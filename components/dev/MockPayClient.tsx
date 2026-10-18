"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiMocksEnabled } from "@/lib/flags";
import { readDb, writeDb, type MockCheckout } from "@/lib/api/mock/db";
import { realExperience } from "@/lib/api/mock/core";
import { bookingFromCheckout } from "@/lib/api/mock/routes-commerce";
import { formatMoney } from "@/lib/experiences/format";

type Outcome = "pay" | "fail" | "cancel";

/** Stand-in for the operator's hosted payment page. Only works with `NEXT_PUBLIC_API_MOCKS=1`. */
export function MockPayClient() {
  const [checkout, setCheckout] = useState<MockCheckout | null | undefined>(undefined);
  const [busy, setBusy] = useState<Outcome | null>(null);

  useEffect(() => {
    if (!apiMocksEnabled) return;
    const id = new URLSearchParams(window.location.search).get("checkout_id") ?? "";
    setCheckout(readDb().checkouts[id] ?? null);
  }, []);

  async function finish(outcome: Outcome) {
    if (!checkout) return;
    setBusy(outcome);
    let target = checkout.return_urls?.success ?? "/";
    if (outcome === "pay") {
      const booking = bookingFromCheckout(checkout, await realExperience(checkout.experience_slug));
      writeDb((d) => {
        d.bookings.unshift(booking);
        d.checkouts[checkout.checkout_id] = { ...d.checkouts[checkout.checkout_id], status: "confirmed", booking_id: booking.booking_id, can_retry_payment: false };
      });
    } else if (outcome === "fail") {
      writeDb((d) => {
        d.checkouts[checkout.checkout_id] = { ...d.checkouts[checkout.checkout_id], status: "payment_failed", can_retry_payment: true };
      });
      target = checkout.return_urls?.error ?? target;
    } else {
      writeDb((d) => {
        d.checkouts[checkout.checkout_id] = { ...d.checkouts[checkout.checkout_id], status: "options_ready" };
      });
      target = checkout.return_urls?.cancel ?? target;
    }
    window.location.assign(target);
  }

  return (
    <section className="section">
      <div className="container-site max-w-lg">
        <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
          <p className="eyebrow text-sunset-600">Dev only · mock payment</p>
          <h1 className="mt-2 font-display text-h3 text-ink">Operator payment page</h1>
          {!apiMocksEnabled ? (
            <p className="mt-4 text-ink-soft">The mock API is turned off. Set NEXT_PUBLIC_API_MOCKS=1 to use this page.</p>
          ) : checkout === undefined ? (
            <p className="mt-4 text-ink-soft">Loading…</p>
          ) : checkout === null ? (
            <p className="mt-4 text-ink-soft">This mock checkout wasn&apos;t found. Start again from an experience page.</p>
          ) : (
            <>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Experience</dt>
                  <dd className="text-right font-medium text-ink">{checkout.title ?? checkout.experience_slug}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Date</dt>
                  <dd className="font-medium text-ink">
                    {checkout.local_date}
                    {checkout.local_time ? ` · ${checkout.local_time}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-sand-200 pt-2">
                  <dt className="text-ink-soft">Total</dt>
                  <dd className="font-semibold text-ink">{formatMoney(checkout.total ?? 0, checkout.currency ?? "USD")}</dd>
                </div>
              </dl>
              <div className="mt-6 grid gap-3">
                <Button type="button" disabled={busy !== null} onClick={() => finish("pay")} className="focus-ring h-12 rounded-full bg-brand-700 text-base font-semibold text-white hover:bg-brand-800">
                  {busy === "pay" ? "Paying…" : "Pay successfully"}
                </Button>
                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => finish("fail")} className="focus-ring h-12 rounded-full">
                  Card declined
                </Button>
                <Button type="button" variant="ghost" disabled={busy !== null} onClick={() => finish("cancel")} className="focus-ring h-12 rounded-full">
                  Cancel and go back
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
