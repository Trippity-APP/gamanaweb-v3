"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "@/components/icons";
import { LoginFlow } from "@/components/auth/LoginFlow";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";

/** Only same-site paths, so `?next=` can't be used as an open redirect. */
export function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/account/";
  return raw;
}

export function LoginPageClient() {
  const router = useRouter();
  const { status } = useAuth();
  const [next, setNext] = useState("/account/");
  const [flowShown, setFlowShown] = useState(false);

  useEffect(() => {
    setNext(safeNext(new URLSearchParams(window.location.search).get("next")));
  }, []);

  useEffect(() => {
    if (status === "anonymous") setFlowShown(true);
    // Already logged in when the page opened: go straight on. Otherwise `onDone` navigates.
    if (status === "authenticated" && !flowShown) router.replace(next);
  }, [status, flowShown, next, router]);

  if (!webAccountsEnabled) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card">
        <h1 className="font-display text-2xl font-bold text-ink">Accounts are coming soon</h1>
        <p className="mt-2 text-ink-soft">Use the Gamana app to manage your coins, collection and bookings.</p>
        <Link href="/download-app/" className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-brand-700 px-6 font-semibold text-white hover:bg-brand-800">
          Get the app
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card sm:p-8">
      {flowShown ? (
        <LoginFlow showHeader onDone={() => router.replace(next)} />
      ) : (
        <div className="flex justify-center py-16" role="status" aria-label="Loading">
          <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden />
        </div>
      )}
    </div>
  );
}
