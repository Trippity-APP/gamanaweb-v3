"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Library, Smartphone, Ticket } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { StoreBadges } from "@/components/site/StoreBadges";
import { bookingId, fetchBookings, isUpcoming } from "@/lib/account/api";
import { isExpired, useLibrary } from "@/lib/library/library-context";
import type { BookingSummary } from "@/lib/api/schemas/bookings";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDateLabel, formatTimeLabel } from "@/lib/experiences/format";

const CARD = "flex flex-col rounded-3xl bg-white p-6 shadow-card";
const CARD_LINK = "focus-ring mt-auto inline-flex items-center gap-1 self-start rounded pt-4 text-sm font-semibold text-brand-700 hover:text-brand-800";

export default function AccountOverviewPage() {
  const { user, balance } = useAuth();
  const { places, tours, loading, lastHandoff } = useLibrary();
  const [next, setNext] = useState<BookingSummary | null | undefined>(undefined);
  const unlockCount =
    places === null && tours === null && loading
      ? null
      : [...(places ?? []), ...(tours ?? [])].filter((u) => !isExpired(u)).length;

  useEffect(() => {
    let cancelled = false;
    fetchBookings()
      .then((list) => !cancelled && setNext(list.find(isUpcoming) ?? null))
      .catch(() => !cancelled && setNext(null));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Hi {user?.firstName || "there"}</h1>

      {lastHandoff?.device_count === 0 && (
        <section
          aria-labelledby="ov-get-app"
          className="flex flex-col gap-4 rounded-3xl bg-brand-700 p-6 text-white shadow-card md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <Smartphone className="mt-1 h-6 w-6 shrink-0" aria-hidden />
            <div>
              <h2 id="ov-get-app" className="font-display text-lg font-bold">
                Get the Gamana app to listen
              </h2>
              <p className="mt-1 text-sm text-white/85">
                Your stories and walks play in the app. Log in there with the same account and they&apos;re waiting for you.
              </p>
            </div>
          </div>
          <StoreBadges source="account_overview_get_app" className="shrink-0 gap-2 [&_img]:h-10 [&_img]:w-auto" />
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <section className={CARD} aria-labelledby="ov-coins">
          <p id="ov-coins" className="eyebrow">Coins</p>
          <p className="mt-3 flex items-center gap-2 font-display text-4xl font-extrabold text-ink">
            <GamanaCoinIcon className="h-8 w-8" aria-hidden />
            {balance === null ? <Skeleton className="h-9 w-16 rounded-lg" /> : balance.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-sm text-ink-soft">Shared with your Gamana app.</p>
          <Link href="/pricing/" className={CARD_LINK}>
            Get coins <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section className={CARD} aria-labelledby="ov-next">
          <p id="ov-next" className="eyebrow">Next experience</p>
          {next === undefined ? (
            <Skeleton className="mt-3 h-24 rounded-2xl" />
          ) : next ? (
            <>
              <div className="mt-3 flex gap-3">
                {next.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={next.image_url} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                    <Ticket className="h-6 w-6" aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 font-semibold text-ink">{next.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
                    <Calendar className="h-4 w-4" aria-hidden />
                    {next.local_date ? formatDateLabel(next.local_date) : ""}
                    {next.local_time ? ` · ${formatTimeLabel(next.local_time)}` : ""}
                  </p>
                </div>
              </div>
              <Link href={`/account/bookings/detail/?id=${encodeURIComponent(bookingId(next))}`} className={CARD_LINK}>
                View booking <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-ink-soft">No upcoming bookings.</p>
              <Link href="/experiences/" className={CARD_LINK}>
                Explore experiences <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </>
          )}
        </section>

        <section className={CARD} aria-labelledby="ov-collection">
          <p id="ov-collection" className="eyebrow">In your collection</p>
          <p className="mt-3 flex items-center gap-2 font-display text-4xl font-extrabold text-ink">
            <Library className="h-8 w-8 text-brand-700" aria-hidden />
            {unlockCount === null ? <Skeleton className="h-9 w-12 rounded-lg" /> : unlockCount}
          </p>
          <p className="mt-2 text-sm text-ink-soft">Stories and audio walks you&apos;ve unlocked.</p>
          <Link href="/account/collection/" className={CARD_LINK}>
            Open My Collection <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>

    </div>
  );
}
