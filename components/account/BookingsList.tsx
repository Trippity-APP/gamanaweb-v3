"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Calendar, ChevronRight, Ticket, Users } from "@/components/icons";
import { bookingId, fetchBookings, todayIso } from "@/lib/account/api";
import { bookingTone, TONE_CLASS, TONE_LABEL } from "@/lib/account/bookings";
import type { BookingSummary } from "@/lib/api/schemas/bookings";
import { formatDateLabel, formatTimeLabel } from "@/lib/experiences/format";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "past" | "cancelled";

const TABS: Tab[] = ["upcoming", "past", "cancelled"];

const EMPTY: Record<Tab, string> = {
  upcoming: "No upcoming bookings.",
  past: "No past bookings yet.",
  cancelled: "No cancelled bookings.",
};

function tabFor(b: BookingSummary, today = todayIso()): Tab {
  if (bookingTone(b.status) === "cancelled") return "cancelled";
  return (b.local_date ?? "") >= today ? "upcoming" : "past";
}

/** Upcoming / past / cancelled booking tabs — used by /account/bookings/ and the Collection's Bookings tab. */
export function BookingsList() {
  const [list, setList] = useState<BookingSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setList(null);
    fetchBookings()
      .then(setList)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  const grouped = useMemo(() => {
    const out: Record<Tab, BookingSummary[]> = { upcoming: [], past: [], cancelled: [] };
    for (const b of list ?? []) out[tabFor(b)].push(b);
    out.past.reverse();
    return out;
  }, [list]);

  if (error) return <ErrorState title="Couldn't load your bookings" onRetry={load} />;

  return (
    <Tabs defaultValue="upcoming">
      <TabsList className="h-auto gap-1 rounded-full bg-white p-1 shadow-card">
        {TABS.map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            className="min-h-[44px] rounded-full px-5 capitalize data-[state=active]:bg-brand-700 data-[state=active]:text-white"
          >
            {t}
            {list && grouped[t].length > 0 && <span className="ml-1.5 text-xs opacity-80">({grouped[t].length})</span>}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t} value={t} className="mt-6">
          {list === null ? (
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
            </div>
          ) : grouped[t].length === 0 ? (
            <EmptyState
              icon={Ticket}
              title={EMPTY[t]}
              action={
                t === "upcoming" ? (
                  <Button asChild className="h-11 rounded-full px-6">
                    <Link href="/experiences/">Explore experiences</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <ul className="space-y-4">
              {grouped[t].map((b) => (
                <li key={bookingId(b)}>
                  <BookingRow booking={b} />
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function BookingRow({ booking: b }: { booking: BookingSummary }) {
  const tone = bookingTone(b.status);
  const travellers = typeof b.travellers === "string" ? b.travellers : null;
  return (
    <Link
      href={`/account/bookings/detail/?id=${encodeURIComponent(bookingId(b))}`}
      className="focus-ring group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card transition-shadow hover:shadow-lift sm:p-5"
    >
      {b.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={b.image_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24" />
      ) : (
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 sm:h-24 sm:w-24">
          <Ticket className="h-7 w-7" aria-hidden />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE_CLASS[tone])}>{TONE_LABEL[tone]}</span>
        <p className="mt-1.5 line-clamp-2 font-display font-bold text-ink">{b.title ?? "Experience"}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-soft">
          {b.local_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden />
              {formatDateLabel(b.local_date)}
              {b.local_time ? ` · ${formatTimeLabel(b.local_time)}` : ""}
            </span>
          )}
          {travellers && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden /> {travellers}
            </span>
          )}
        </p>
      </div>
      <span className="hidden items-center gap-1 text-sm font-semibold text-brand-700 sm:inline-flex">
        View <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
