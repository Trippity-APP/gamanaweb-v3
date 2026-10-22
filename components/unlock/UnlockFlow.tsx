"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Loader2, Send } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { LibraryUnlock } from "@/lib/api/schemas/library";
import { fetchPersonalization, narratorLanguages } from "@/lib/account/personalization";
import { useAuth } from "@/lib/auth/auth-context";
import { apiMocksEnabled, webAccountsEnabled } from "@/lib/flags";
import { isInsufficientCoins, isPriceMismatch, priceFromMismatch } from "@/lib/unlock/errors";
import {
  daysLeft as unlockDaysLeft,
  deepLinkFor,
  sendToPhone,
  unlockStatusLine,
  useLibrary,
  type HandoffResult,
  type StatusLine,
  type UnlockKind,
} from "@/lib/library/library-context";

export type UnlockItem = {
  kind: UnlockKind;
  id: string;
  title: string;
  price: number;
  image?: string;
  city?: string;
  narrator?: string;
};

export type UnlockRenderArgs = {
  state: "free" | "locked" | "unlocked";
  unlock: LibraryUnlock | undefined;
  status: StatusLine;
  daysLeft: number | null;
  /** Locked: runs the unlock flow. Unlocked / free: opens the app handoff. */
  start: () => void;
  busy: boolean;
};

type Step =
  | { name: "idle" }
  | { name: "need-coins"; needed: number }
  | { name: "confirm"; price: number; changed: boolean }
  | { name: "success"; handoff: HandoffResult | null }
  | { name: "open-app" };

function errorDetails(error: ApiError): Record<string, unknown> {
  const d = (error.details ?? {}) as Record<string, unknown>;
  const nested = (d.error as Record<string, unknown> | undefined)?.detail as Record<string, unknown> | undefined;
  return { ...(nested ?? {}), ...d };
}

function errorCode(error: ApiError): string {
  const d = errorDetails(error);
  return String(d.code ?? error.code ?? "");
}

const PRICE_KEYS = ["current_price", "new_price", "price", "coin_amount", "expected_price", "required"];

export function UnlockFlow({ item, source, children }: { item: UnlockItem; source: string; children: (args: UnlockRenderArgs) => ReactNode }) {
  const { status: authStatus, balance, requireAuth, refreshBalance } = useAuth();
  const library = useLibrary();
  const [step, setStep] = useState<Step>({ name: "idle" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const unlock = authStatus === "authenticated" ? library.find(item.kind, item.id) : undefined;
  const state: UnlockRenderArgs["state"] = item.price === 0 ? "free" : unlock ? "unlocked" : "locked";
  const deepLink = deepLinkFor(item.kind, item.id);

  const begin = () => {
    track("unlock_click", { type: item.kind, id: item.id, price: item.price, source });
    const current = balanceRef.current;
    if (current !== null && current < item.price) {
      track("unlock_insufficient_coins", { type: item.kind, source });
      setStep({ name: "need-coins", needed: item.price - current });
      return;
    }
    setError("");
    setStep({ name: "confirm", price: item.price, changed: false });
  };

  const start = () => {
    if (state !== "locked" || !webAccountsEnabled) {
      setStep({ name: "open-app" });
      return;
    }
    requireAuth(begin, "to unlock this");
  };

  const confirm = async (price: number) => {
    setBusy(true);
    setError("");
    const mockHeaders: Record<string, string> = apiMocksEnabled
      ? {
          "X-Mock-Price": String(price),
          "X-Mock-Meta": encodeURIComponent(
            JSON.stringify({ title: item.title, image: item.image, city: item.city, narrator: item.narrator }),
          ),
        }
      : {};
    try {
      let res: { handoff?: HandoffResult | null; already_unlocked?: boolean } | null;
      if (item.kind === "place") {
        res = await apiFetch("/map/unlock", {
          method: "POST",
          auth: "required",
          body: { place_id: item.id, coin_amount: String(price) },
          headers: mockHeaders,
        });
      } else {
        const languages = narratorLanguages(await fetchPersonalization().catch(() => null));
        res = await apiFetch("/map/unlock/storylist", {
          method: "POST",
          auth: "required",
          body: { storylist_id: item.id, languages: languages.length ? languages : ["en"] },
          headers: mockHeaders,
        });
      }
      if (res?.already_unlocked) {
        void library.invalidate();
        toast({ title: "Already in your collection", description: "Open it in the Gamana app to listen." });
        setStep({ name: "open-app" });
        return;
      }
      const handoff = res?.handoff ?? null;
      track("unlock_success", { type: item.kind, push_sent: !!handoff?.push_sent, price, source });
      library.setLastHandoff(handoff);
      setStep({ name: "success", handoff });
      void refreshBalance();
      void library.invalidate();
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setError("Couldn't reach Gamana. Check your connection and try again.");
        return;
      }
      const code = errorCode(err);
      const details = errorDetails(err);
      if (err.status === 402 || code === "insufficient_coins" || isInsufficientCoins(err.message)) {
        track("unlock_insufficient_coins", { type: item.kind, source });
        const required = Number(details.required ?? price);
        const available = Number(details.available ?? balanceRef.current ?? 0);
        setStep({ name: "need-coins", needed: Math.max(1, Math.ceil(required - available)) });
        void refreshBalance();
      } else if (code === "already_unlocked" || err.status === 409) {
        void library.invalidate();
        toast({ title: "Already in your collection", description: "Open it in the Gamana app to listen." });
        setStep({ name: "open-app" });
      } else if (isPriceMismatch(err.message) || /price/i.test(code)) {
        const raw = PRICE_KEYS.map((k) => details[k]).find((v) => v !== undefined && v !== null);
        const next = priceFromMismatch(err.message) ?? Number(raw);
        if (Number.isFinite(next) && next > 0 && next !== price) setStep({ name: "confirm", price: next, changed: true });
        else setError("The price just changed. Please reload the page.");
      } else {
        setError(err.message || "Couldn't unlock this right now. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const sendAgain = async () => {
    setSending(true);
    try {
      const res = await sendToPhone(item.kind, item.id);
      library.setLastHandoff(res);
      toast({ title: "Sent. Check your phone." });
    } catch {
      toast({ title: "Couldn't send it to your phone", description: "Open the Gamana app to find it in My Collection.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const close = () => !busy && setStep({ name: "idle" });
  const needed = step.name === "need-coins" ? step.needed : 0;

  const sendButton = (
    <Button type="button" variant="outline" onClick={sendAgain} disabled={sending} className="h-11 rounded-full px-5">
      {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
      {step.name === "success" ? "Send again" : "Send to my phone"}
    </Button>
  );

  return (
    <>
      {children({
        state,
        unlock,
        status: unlock ? unlockStatusLine(unlock) : null,
        daysLeft: unlock ? unlockDaysLeft(unlock) : null,
        start,
        busy,
      })}

      <Dialog open={step.name === "need-coins"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              You need {needed} more {needed === 1 ? "coin" : "coins"}
            </DialogTitle>
            <DialogDescription>
              {item.title} costs {item.price} coins
              {balance !== null ? ` and you have ${balance}.` : "."} Get coins in the Gamana app — they show up here too.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={close} className="h-11 rounded-full">
              Cancel
            </Button>
            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/pricing/">Get coins</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={step.name === "confirm"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          {step.name === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>{step.changed ? "The price just changed" : `Unlock ${item.title}?`}</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-3 text-sm text-ink-soft">
                    {step.changed ? (
                      <p>
                        The price just changed to {step.price} coins. Unlock for {step.price}?
                      </p>
                    ) : null}
                    <p className="flex items-center gap-2 font-semibold text-ink">
                      <GamanaCoinIcon className="h-5 w-5" aria-hidden /> {step.price} coins
                    </p>
                    <p>
                      You&apos;ll listen in the Gamana app. Your 30 days start the first time you open it there — open it within 90
                      days.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <p aria-live="assertive" className="min-h-[1.25rem] text-sm text-red-700">
                {error}
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={close} disabled={busy} className="h-11 rounded-full">
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void confirm(step.price)}
                  disabled={busy}
                  className="h-11 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-6 text-white hover:from-sunset-500 hover:to-sunset-600"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {step.changed ? `Unlock for ${step.price}` : "Unlock"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AppHandoffSheet
        open={step.name === "success"}
        onOpenChange={(o) => !o && close()}
        source={`${source}-unlocked`}
        title="Unlocked — it's on your phone"
        steps={["Open the Gamana app", "Find it in My Collection", "Tap play — your 30 days start then"]}
        note={
          step.name === "success" && step.handoff?.push_sent
            ? "We sent it to your Gamana app. Tap the notification to start."
            : "Open the Gamana app to listen."
        }
        deepLink={deepLink}
      >
        <div className="flex flex-wrap gap-3">
          {sendButton}
          <Button asChild variant="ghost" className="h-11 rounded-full px-5">
            <Link href="/account/collection/">Go to My Collection</Link>
          </Button>
        </div>
      </AppHandoffSheet>

      <AppHandoffSheet
        open={step.name === "open-app"}
        onOpenChange={(o) => !o && close()}
        source={`${source}-open`}
        title={state === "locked" ? "Unlock in the Gamana app" : "Listen in the Gamana app"}
        steps={
          state === "locked"
            ? ["Open Gamana on your phone", "Log in with the same account", "Unlock with your coins"]
            : ["Open Gamana on your phone", "It opens automatically", "Tap play and start walking"]
        }
        deepLink={deepLink}
      >
        {state === "unlocked" && authStatus === "authenticated" ? <div className="flex flex-wrap gap-3">{sendButton}</div> : null}
      </AppHandoffSheet>
    </>
  );
}
