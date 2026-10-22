"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiFetch, refreshSession, webClientHeaders } from "@/lib/api/client";
import {
  clearSession,
  getSession,
  hasSessionHint,
  sessionEvents,
  setSession,
  SESSION_EXPIRED_EVENT,
} from "@/lib/api/session";
import type { WebLoginResponse } from "@/lib/api/schemas/auth";
import { coinBalanceSchema, toCoinCount } from "@/lib/api/schemas/coins";
import { toAuthUser, userProfileSchema, type AuthUser } from "@/lib/api/schemas/profile";
import { webAccountsEnabled } from "@/lib/flags";

/** Loaded on first `openLogin()` so the login UI stays out of every page's initial bundle. */
const LoginSheet = dynamic(() => import("@/components/auth/LoginSheet"), { ssr: false });

export type AuthStatus = "loading" | "anonymous" | "authenticated";

export interface LoginRequest {
  reason?: string;
  onSuccess?: () => void;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Whole coins; `null` until loaded. */
  balance: number | null;
  /** True while restoring a session the browser previously had (`gmn_session_hint`). */
  restoring: boolean;
  refreshBalance: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  openLogin: (opts?: LoginRequest) => void;
  /** Pending login request for the login sheet; `null` when closed. */
  loginRequest: LoginRequest | null;
  closeLogin: () => void;
  /**
   * Called by the login flow with the `/auth/web/login/*` response. With `defer`, the sheet stays
   * open (profile step) until `finishLogin` runs.
   */
  completeLogin: (response: WebLoginResponse, opts?: { defer?: boolean }) => Promise<AuthUser | null>;
  /** Closes the login sheet and runs the pending `onSuccess`. */
  finishLogin: () => void;
  logout: () => Promise<void>;
  /** Runs `cb` now if logged in, otherwise after a successful login. */
  requireAuth: (cb: () => void, reason?: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Keys written by the removed localStorage prototype (lib/account-context, lib/cart-context). */
const LEGACY_STORAGE_KEYS = [
  "gamanaAccount",
  "gamanaJourney",
  "gamanaOrders",
  "gamanaCoinBalance",
  "gamanaUnlockedItems",
  "gamanaWelcomeCoinsClaimed",
  "gamanaCart",
];

const BALANCE_POLL_MS = 60_000;

function removeLegacyStorage() {
  try {
    for (const key of LEGACY_STORAGE_KEYS) window.localStorage.removeItem(key);
  } catch {
    // Storage disabled.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [loginRequest, setLoginRequest] = useState<LoginRequest | null>(null);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const pendingSuccess = useRef<(() => void) | null>(null);
  /** `/users/profile` doesn't return the login phone, so keep the one from the login response (memory only). */
  const loginPhone = useRef<{ phone: string; countryCode: string } | null>(null);

  const withLoginPhone = useCallback((next: AuthUser): AuthUser => {
    const fromLogin = loginPhone.current;
    if (next.phone || !fromLogin?.phone) return next;
    return { ...next, phone: fromLogin.phone, countryCode: next.countryCode || fromLogin.countryCode };
  }, []);

  const resetToAnonymous = useCallback(() => {
    loginPhone.current = null;
    setUser(null);
    setBalance(null);
    setStatus("anonymous");
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await apiFetch("/users/profile", { auth: "required", schema: userProfileSchema });
    setUser(withLoginPhone(toAuthUser(profile)));
  }, [withLoginPhone]);

  const refreshBalance = useCallback(async () => {
    if (!getSession()) return;
    try {
      const data = await apiFetch("/coins/balance", { auth: "required", schema: coinBalanceSchema });
      setBalance(toCoinCount(data));
    } catch {
      // Keep the last known balance; a failed poll shouldn't blank the header.
    }
  }, []);

  const loadAccount = useCallback(async () => {
    await refreshProfile();
    setStatus("authenticated");
    void refreshBalance();
  }, [refreshProfile, refreshBalance]);

  useEffect(() => {
    removeLegacyStorage();

    if (!webAccountsEnabled) {
      setStatus("anonymous");
      return;
    }

    let cancelled = false;
    setRestoring(hasSessionHint());

    (async () => {
      const restored = await refreshSession();
      if (cancelled) return;
      if (!restored) {
        resetToAnonymous();
        setRestoring(false);
        return;
      }
      try {
        await loadAccount();
      } catch {
        if (!cancelled) {
          clearSession();
          resetToAnonymous();
        }
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadAccount, resetToAnonymous]);

  useEffect(() => {
    const events = sessionEvents;
    if (!events) return;
    const onExpired = () => resetToAnonymous();
    events.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => events.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [resetToAnonymous]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") void refreshBalance();
    };
    const interval = window.setInterval(refreshIfVisible, BALANCE_POLL_MS);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [status, refreshBalance]);

  const openLogin = useCallback((opts: LoginRequest = {}) => {
    if (!webAccountsEnabled) return;
    pendingSuccess.current = opts.onSuccess ?? null;
    setLoginRequest(opts);
  }, []);

  const closeLogin = useCallback(() => {
    pendingSuccess.current = null;
    setLoginRequest(null);
  }, []);

  const finishLogin = useCallback(() => {
    const onSuccess = pendingSuccess.current;
    pendingSuccess.current = null;
    setLoginRequest(null);
    onSuccess?.();
  }, []);

  const completeLogin = useCallback(
    async (response: WebLoginResponse, opts: { defer?: boolean } = {}) => {
      setSession({
        accessToken: response.access_token,
        sessionId: response.session_id,
        expiresIn: response.expires_in ?? null,
      });
      const phone = response.phone == null ? "" : String(response.phone);
      loginPhone.current = phone ? { phone, countryCode: response.country_code ?? "" } : null;
      try {
        const profile = await apiFetch("/users/profile", { auth: "required", schema: userProfileSchema });
        const nextUser = withLoginPhone(toAuthUser(profile));
        setUser(nextUser);
        setStatus("authenticated");
        void refreshBalance();
        if (!opts.defer) finishLogin();
        return nextUser;
      } catch {
        clearSession();
        resetToAnonymous();
        return null;
      }
    },
    [refreshBalance, resetToAnonymous, finishLogin, withLoginPhone],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/web/logout", {
        method: "POST",
        auth: "optional",
        headers: { ...webClientHeaders },
      });
    } catch {
      // Clear locally even if the server call fails; the refresh cookie expires on its own.
    }
    clearSession();
    resetToAnonymous();
  }, [resetToAnonymous]);

  const requireAuth = useCallback(
    (cb: () => void, reason?: string) => {
      if (status === "authenticated") {
        cb();
        return;
      }
      openLogin({ reason, onSuccess: cb });
    },
    [status, openLogin],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      balance,
      restoring,
      refreshBalance,
      refreshProfile,
      openLogin,
      loginRequest,
      closeLogin,
      completeLogin,
      finishLogin,
      logout,
      requireAuth,
    }),
    [status, user, balance, restoring, refreshBalance, refreshProfile, openLogin, loginRequest, closeLogin, completeLogin, finishLogin, logout, requireAuth],
  );

  if (loginRequest && !sheetLoaded) setSheetLoaded(true);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sheetLoaded && <LoginSheet />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
