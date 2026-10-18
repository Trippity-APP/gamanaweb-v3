"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api/client";
import { libraryUnlockSchema, type LibraryUnlock } from "@/lib/api/schemas/library";
import { listOf } from "@/lib/account/api";
import { useAuth } from "@/lib/auth/auth-context";

export type UnlockKind = "place" | "storylist";

export type HandoffResult = { push_sent?: boolean | null; device_count?: number | null };

type LibraryContextValue = {
  /** `null` until loaded (or when logged out). */
  places: LibraryUnlock[] | null;
  tours: LibraryUnlock[] | null;
  loading: boolean;
  /** Most recent handoff result from an unlock or "Send to my phone" in this session. */
  lastHandoff: HandoffResult | null;
  setLastHandoff: (h: HandoffResult | null) => void;
  find: (kind: UnlockKind, id: string) => LibraryUnlock | undefined;
  invalidate: () => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

const REFRESH_ON_FOCUS_AFTER_MS = 30_000;

export function unlockTargetId(u: LibraryUnlock): string {
  return String(u.place_id ?? u.storylist_id ?? u.id ?? u._id ?? "");
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [places, setPlaces] = useState<LibraryUnlock[] | null>(null);
  const [tours, setTours] = useState<LibraryUnlock[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastHandoff, setLastHandoff] = useState<HandoffResult | null>(null);
  const lastLoad = useRef(0);

  const load = useCallback(async () => {
    lastLoad.current = Date.now();
    setLoading(true);
    const [p, t] = await Promise.all([
      apiFetch("/library/unlocks", { auth: "required", version: "v2", schema: listOf(libraryUnlockSchema) }).catch(() => null),
      apiFetch("/tours/mine", {
        auth: "required",
        version: "v2",
        query: { page: 1, page_size: 100 },
        schema: listOf(libraryUnlockSchema),
      }).catch(() => null),
    ]);
    if (p) setPlaces(p);
    if (t) setTours(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      void load();
    } else if (status === "anonymous") {
      setPlaces(null);
      setTours(null);
      setLastHandoff(null);
    }
  }, [status, load]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastLoad.current > REFRESH_ON_FOCUS_AFTER_MS) void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [status, load]);

  const find = useCallback(
    (kind: UnlockKind, id: string) => {
      const list = kind === "place" ? places : tours;
      return list?.find((u) => unlockTargetId(u) === id && !isExpired(u));
    },
    [places, tours],
  );

  const value = useMemo(
    () => ({ places, tours, loading, lastHandoff, setLastHandoff, find, invalidate: load }),
    [places, tours, loading, lastHandoff, find, load],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysLeft(u: LibraryUnlock, now = Date.now()): number | null {
  if (u.activation_status === "pending" || !u.expires_at) return null;
  const end = new Date(u.expires_at).getTime();
  if (Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - now) / DAY_MS));
}

export function isExpired(u: LibraryUnlock, now = Date.now()): boolean {
  if (u.activation_status === "pending" || !u.expires_at) return false;
  const end = new Date(u.expires_at).getTime();
  return !Number.isNaN(end) && end <= now;
}

export type StatusLine = { text: string; urgent: boolean } | null;

/** W5.1 status line: pending → "Starts when you first open it…", active → "{n} days left". */
export function unlockStatusLine(u: LibraryUnlock, now = Date.now()): StatusLine {
  if (u.activation_status === "pending") {
    const by = u.reserved_until ? new Date(u.reserved_until) : null;
    const date = by && !Number.isNaN(by.getTime()) ? by.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
    return { text: `Starts when you first open it in the app${date ? ` · Open by ${date}` : ""}`, urgent: true };
  }
  const n = daysLeft(u, now);
  if (n === null) return null;
  if (n === 0) return null;
  return { text: `${n} ${n === 1 ? "day" : "days"} left`, urgent: n < 6 };
}

export function deepLinkFor(kind: UnlockKind, id: string): string {
  return kind === "place"
    ? `https://www.gamana.app/place/${encodeURIComponent(id)}`
    : `https://www.gamana.app/storylist/${encodeURIComponent(id)}`;
}

export function sendToPhone(kind: UnlockKind, id: string): Promise<HandoffResult> {
  return apiFetch<HandoffResult>(`/me/handoff/${kind}/${encodeURIComponent(id)}`, { method: "POST", auth: "required", body: {} });
}
