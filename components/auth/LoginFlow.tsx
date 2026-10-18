"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Check, ChevronDown, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api/client";
import type { WebLoginResponse } from "@/lib/api/schemas/auth";
import type { AuthUser } from "@/lib/api/schemas/profile";
import { useAuth } from "@/lib/auth/auth-context";
import { appleSignIn, preloadApple } from "@/lib/auth/apple";
import { DIAL_CODES, defaultDialCode, maskPhone, type DialCode } from "@/lib/auth/dial-codes";
import { getGoogleAccessToken, preloadGoogle } from "@/lib/auth/google";
import { loginErrorCode, loginErrorMessage, oauthLogin, requestOtp, verifyOtp } from "@/lib/auth/login-api";
import { detectPricingCurrency } from "@/lib/coin-pricing";
import { apiMocksEnabled } from "@/lib/flags";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type LoginScreen = "method" | "otp" | "profile";

export const LOGIN_COPY: Record<LoginScreen, { title: string; description?: string }> = {
  method: {
    title: "Log in or sign up",
    description: "Same account as the Gamana app — your coins, collection and bookings follow you.",
  },
  otp: { title: "Enter the 6-digit code" },
  profile: { title: "What should we call you?", description: "This is how you'll appear on bookings and reviews." },
};

const RESEND_SECONDS = 30;

const PRIMARY =
  "focus-ring h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-base font-semibold text-white hover:from-brand-700 hover:to-brand-800";
const OUTLINE = "focus-ring h-12 w-full justify-center gap-3 rounded-full border-sand-200 text-base font-semibold text-ink";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 384 512" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function CountryCodePicker({ value, onChange }: { value: DialCode; onChange: (code: DialCode) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Country code ${value.name} ${value.code}`}
          className="focus-ring flex h-12 shrink-0 items-center gap-1 rounded-xl border border-sand-200 bg-white px-3 text-base font-medium text-ink"
        >
          {value.code}
          <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search country or code" />
          <CommandList className="max-h-64">
            <CommandEmpty>No country found.</CommandEmpty>
            {DIAL_CODES.map((d) => (
              <CommandItem
                key={d.iso}
                value={`${d.name} ${d.code} ${d.iso}`}
                onSelect={() => {
                  onChange(d);
                  setOpen(false);
                }}
                className="min-h-[44px] gap-2"
              >
                <Check className={cn("h-4 w-4", d.iso === value.iso ? "opacity-100" : "opacity-0")} aria-hidden />
                <span className="flex-1">{d.name}</span>
                <span className="text-ink-soft">{d.code}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type LoginFlowProps = {
  reason?: string;
  /** Page variant renders its own headings; the sheet shows them in its title bar. */
  showHeader?: boolean;
  onScreenChange?: (screen: LoginScreen) => void;
  onDone?: (user: AuthUser) => void;
};

export function LoginFlow({ reason, showHeader = false, onScreenChange, onDone }: LoginFlowProps) {
  const { completeLogin, finishLogin, refreshProfile } = useAuth();
  const [screen, setScreenState] = useState<LoginScreen>("method");
  const [dial, setDial] = useState<DialCode>(DIAL_CODES[0]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<null | "google" | "apple" | "send" | "verify" | "profile">(null);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(null);
  const method = useRef<"google" | "apple" | "phone">("phone");
  const isNew = useRef(false);

  const setScreen = (next: LoginScreen) => {
    setScreenState(next);
    setError("");
    onScreenChange?.(next);
  };

  useEffect(() => {
    setDial(defaultDialCode(detectPricingCurrency() === "INR"));
    track("login_view");
    if (!apiMocksEnabled) {
      preloadGoogle();
      preloadApple();
    }
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const phoneValid = /^\d{7,15}$/.test(phone);

  function fail(err: unknown) {
    const message = loginErrorMessage(err);
    if (message) {
      setError(message);
      track("login_error", { code: loginErrorCode(err) });
    }
  }

  function done(user: AuthUser) {
    track("login_success", { method: method.current, is_new_user: isNew.current });
    toast({ title: user.firstName && !isNew.current ? `Welcome back, ${user.firstName}` : "Welcome to Gamana" });
    finishLogin();
    onDone?.(user);
  }

  async function afterLogin(response: WebLoginResponse) {
    isNew.current = Boolean(response.is_new_user);
    if (response.organizations?.length) track("login_org_user");
    const user = await completeLogin(response, { defer: true });
    if (!user) throw new Error("profile_failed");
    if (isNew.current || !user.firstName) {
      setLoggedUser(user);
      setProfile({ firstName: user.firstName, lastName: user.lastName, email: user.email });
      setScreen("profile");
      return;
    }
    done(user);
  }

  async function social(provider: "google" | "apple") {
    method.current = provider;
    track("login_method_selected", { method: provider });
    setBusy(provider);
    setError("");
    try {
      if (apiMocksEnabled) {
        await afterLogin(await oauthLogin({ auth_type: provider, token: "mock-token" }));
      } else if (provider === "google") {
        await afterLogin(await oauthLogin({ auth_type: "google", token: await getGoogleAccessToken() }));
      } else {
        const apple = await appleSignIn();
        await afterLogin(
          await oauthLogin({ auth_type: "apple", token: apple.token, first_name: apple.firstName, last_name: apple.lastName }),
        );
      }
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  }

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    if (!phoneValid) {
      setError("Enter a valid phone number.");
      return;
    }
    method.current = "phone";
    track("login_method_selected", { method: "phone" });
    setBusy("send");
    setError("");
    try {
      await requestOtp(dial.code, phone);
      setOtp("");
      setResendIn(RESEND_SECONDS);
      if (screen !== "otp") setScreen("otp");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  }

  async function verify(code: string) {
    if (code.length !== 6 || busy) return;
    setBusy("verify");
    setError("");
    try {
      await afterLogin(await verifyOtp(dial.code, phone, code));
    } catch (err) {
      setOtp("");
      fail(err);
    } finally {
      setBusy(null);
    }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!profile.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy("profile");
    setError("");
    try {
      await apiFetch("/users/profile", {
        method: "PATCH",
        auth: "required",
        body: {
          first_name: profile.firstName.trim(),
          last_name: profile.lastName.trim(),
          ...(profile.email ? { email: profile.email.trim() } : {}),
        },
      });
      await refreshProfile();
      done({ ...(loggedUser as AuthUser), firstName: profile.firstName.trim(), lastName: profile.lastName.trim() });
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  }

  const resendLabel = useMemo(() => `Resend in 0:${String(resendIn).padStart(2, "0")}`, [resendIn]);
  const copy = LOGIN_COPY[screen];

  return (
    <div className="space-y-5">
      {showHeader && (
        <div>
          {reason && screen === "method" && <p className="eyebrow text-brand-700">{reason}</p>}
          <h1 className="font-display text-2xl font-bold text-ink">{copy.title}</h1>
          {copy.description && screen !== "otp" && <p className="mt-1 text-sm text-ink-soft">{copy.description}</p>}
        </div>
      )}
      {!showHeader && reason && screen === "method" && <p className="eyebrow -mt-2 text-brand-700">{reason}</p>}

      {screen === "method" && (
        <>
          <div className="grid gap-3">
            <Button type="button" variant="outline" className={OUTLINE} disabled={busy !== null} onClick={() => void social("google")}>
              {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <GoogleMark />}
              Continue with Google
            </Button>
            <Button type="button" variant="outline" className={OUTLINE} disabled={busy !== null} onClick={() => void social("apple")}>
              {busy === "apple" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <AppleMark />}
              Continue with Apple
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            <span className="h-px flex-1 bg-sand-200" />
            or use your phone
            <span className="h-px flex-1 bg-sand-200" />
          </div>
          <form onSubmit={sendCode} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="login-phone" className="sr-only">
                Phone number
              </Label>
              <div className="flex gap-2">
                <CountryCodePicker value={dial} onChange={setDial} />
                <Input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby="login-error"
                  className="h-12 rounded-xl border-sand-200 text-base"
                />
              </div>
            </div>
            <Button type="submit" className={PRIMARY} disabled={busy !== null}>
              {busy === "send" && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />}
              Send code
            </Button>
          </form>
          <p className="text-xs text-ink-soft">
            By continuing you agree to our{" "}
            <Link href="/terms-of-service/" className="focus-ring rounded underline underline-offset-2 hover:text-ink">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy/" className="focus-ring rounded underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}

      {screen === "otp" && (
        <div className="space-y-5">
          <p className="text-sm text-ink-soft">
            Sent to {maskPhone(dial.code, phone)} ·{" "}
            <button type="button" onClick={() => setScreen("method")} className="focus-ring rounded font-semibold text-brand-700 hover:text-brand-800">
              Edit
            </button>
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            onComplete={(code: string) => void verify(code)}
            pattern={REGEXP_ONLY_DIGITS}
            autoFocus
            autoComplete="one-time-code"
            disabled={busy === "verify"}
            aria-label="6-digit code"
            aria-describedby="login-error"
            containerClassName="justify-center"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-11 border-sand-200 text-lg font-semibold text-ink sm:h-14 sm:w-12" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {busy === "verify" && (
            <p className="flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Checking code…
            </p>
          )}
          <div className="text-center">
            <button
              type="button"
              disabled={resendIn > 0 || busy !== null}
              onClick={() => void sendCode()}
              className="focus-ring min-h-[44px] rounded px-2 text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:text-ink-muted"
            >
              {resendIn > 0 ? resendLabel : "Resend code"}
            </button>
          </div>
          {apiMocksEnabled && <p className="text-center text-xs text-ink-muted">Mock mode: use 123456</p>}
        </div>
      )}

      {screen === "profile" && (
        <form onSubmit={saveProfile} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="login-first">First name</Label>
              <Input
                id="login-first"
                autoComplete="given-name"
                required
                autoFocus
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                className="h-12 rounded-xl border-sand-200 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login-last">Last name</Label>
              <Input
                id="login-last"
                autoComplete="family-name"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                className="h-12 rounded-xl border-sand-200 text-base"
              />
            </div>
          </div>
          {method.current === "phone" && (
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email for booking confirmations</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="h-12 rounded-xl border-sand-200 text-base"
              />
            </div>
          )}
          <Button type="submit" className={PRIMARY} disabled={busy !== null}>
            {busy === "profile" && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />}
            Save and continue
          </Button>
        </form>
      )}

      <p id="login-error" role="status" aria-live="assertive" className={cn("text-sm font-medium text-red-700", !error && "sr-only")}>
        {error}
      </p>
    </div>
  );
}
