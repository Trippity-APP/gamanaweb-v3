"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, ChevronDown, Loader2, Minus, Plus, Users } from "@/components/icons";
import { ErrorState } from "@/components/common/ErrorState";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { PriceTag } from "@/components/experiences/PriceTag";
import { TrustBadges } from "@/components/experiences/TrustBadges";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ExperienceDetail } from "@/lib/api/schemas/experiences";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";
import {
  ageRange,
  formatDateLabel,
  formatMoney,
  formatTimeLabel,
  fromIsoDate,
  guestLabel,
  toIsoDate,
} from "@/lib/experiences/format";
import { MAX_TRAVELLERS, type AvailabilityState } from "@/lib/experiences/use-availability";
import { cn } from "@/lib/utils";

type AvailabilityCardProps = {
  experience: ExperienceDetail;
  state: AvailabilityState;
  className?: string;
  bare?: boolean;
};

export function AvailabilityCard({ experience, state, className, bare = false }: AvailabilityCardProps) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [dateOpen, setDateOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const { loadCalendar, visibleMonth } = state;
  const slug = experience.slug ?? "";
  const operator = experience.operator_name ?? "the operator";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!dateOpen) return;
    const controller = new AbortController();
    void loadCalendar(visibleMonth, controller.signal);
    return () => controller.abort();
  }, [dateOpen, visibleMonth, loadCalendar]);

  const bookNow = () => {
    if (!state.checkoutParams) return;
    track("book_now_click", { slug, web_checkout: webAccountsEnabled });
    if (!webAccountsEnabled) {
      setHandoffOpen(true);
      return;
    }
    const url = `/experiences/checkout/?${state.checkoutParams}`;
    requireAuth(() => router.push(url), "to book this experience");
  };

  const selectedDate = state.date ? fromIsoDate(state.date) : undefined;
  const busy = state.phase === "checking" || state.phase === "pricing";

  return (
    <div className={cn(!bare && "rounded-3xl bg-white p-6 shadow-card", className)}>
      <PriceTag amount={experience.from_price} currency={experience.currency} compareAt={experience.compare_at_price} />
      <TrustBadges experience={experience} className="mt-4" />

      <div className="mt-6 space-y-3">
        {experience.guest_types.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-sand-200 px-4 py-3 text-left">
                <Users className="h-5 w-5 text-brand-700" aria-hidden />
                <span className="flex-1">
                  <span className="block text-xs text-ink-soft">Participants</span>
                  <span className="block text-sm font-semibold text-ink">{state.guestSummary || "Choose travellers"}</span>
                </span>
                <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4">
              <ul className="space-y-4">
                {experience.guest_types.map((g) => {
                  const n = state.guests[g.unit_id] ?? 0;
                  const min = g.required ? Math.max(g.min_quantity ?? 1, 1) : 0;
                  const max = Math.min(g.max_quantity ?? MAX_TRAVELLERS, MAX_TRAVELLERS);
                  const label = guestLabel(g.label, g.type ?? "Guest");
                  const ages = ageRange(g.min_age, g.max_age);
                  return (
                    <li key={g.unit_id} className="flex items-center gap-3">
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-ink">{label}</span>
                        {ages && <span className="block text-xs text-ink-soft">{ages}</span>}
                      </span>
                      <Stepper
                        label={label}
                        value={n}
                        canDecrement={n > min}
                        canIncrement={n < max && state.totalGuests < MAX_TRAVELLERS}
                        onChange={(v) => state.setGuest(g.unit_id, v)}
                      />
                    </li>
                  );
                })}
              </ul>
              {state.totalGuests >= MAX_TRAVELLERS && (
                <p className="mt-3 text-xs text-ink-soft">Up to {MAX_TRAVELLERS} travellers per booking.</p>
              )}
            </PopoverContent>
          </Popover>
        )}

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-sand-200 px-4 py-3 text-left">
              <CalendarIcon className="h-5 w-5 text-brand-700" aria-hidden />
              <span className="flex-1">
                <span className="block text-xs text-ink-soft">Date</span>
                <span className="block text-sm font-semibold text-ink">{state.date ? formatDateLabel(state.date) : "Choose a date"}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-soft" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto rounded-2xl p-0">
            <div className={cn("relative", state.calendarLoading && "opacity-60")} aria-busy={state.calendarLoading}>
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                month={visibleMonth}
                onMonthChange={state.setVisibleMonth}
                fromDate={today}
                disabled={[
                  { before: today },
                  (day: Date) => !!state.availableDays && !state.availableDays.has(toIsoDate(day)),
                ]}
                onSelect={(day) => {
                  state.selectDate(day ? toIsoDate(day) : null);
                  if (day) setDateOpen(false);
                }}
              />
              {state.calendarLoading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-brand-700" aria-label="Loading availability" />
              )}
            </div>
            {state.calendarError && (
              <p className="border-t px-4 py-3 text-xs text-ink-soft">Couldn't load availability for these dates. You can still pick a date and check.</p>
            )}
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          disabled={!state.date || !state.totalGuests || busy}
          onClick={() => state.checkAvailability()}
          className="h-12 w-full rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 text-base font-semibold text-white hover:from-sunset-500 hover:to-sunset-500"
        >
          {state.phase === "checking" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          Check availability
        </Button>
      </div>

      <div aria-live="polite" className="mt-4 space-y-4">
        {state.error && <ErrorState compact title={state.error} onRetry={() => state.checkAvailability()} />}

        {state.phase !== "idle" && state.phase !== "checking" && state.soldOut && (
          <div className="rounded-2xl bg-sand-100 p-4">
            <p className="text-sm font-semibold text-ink">Sold out on this date</p>
            {state.nextDates.length > 0 ? (
              <>
                <p className="mt-1 text-xs text-ink-soft">Next available:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.nextDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        state.selectDate(d);
                        void state.checkAvailability(d);
                      }}
                      className="focus-ring rounded-full border border-sand-200 bg-white px-3 py-1 text-sm font-medium text-ink hover:border-brand-300"
                    >
                      {formatDateLabel(d)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-1 text-xs text-ink-soft">Try another date.</p>
            )}
          </div>
        )}

        {state.slots.length > 0 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Choose a time</legend>
            <div className="grid gap-2">
              {state.slots.map((slot, i) => {
                const active = !!slot.time && slot.time === state.time;
                return (
                  <label
                    key={slot.id ?? `${slot.time}-${i}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                      active ? "border-brand-700 bg-brand-50" : "border-sand-200 hover:border-brand-300"
                    )}
                  >
                    <input
                      type="radio"
                      name={`slot-${slug}`}
                      className="accent-brand-700"
                      checked={active}
                      onChange={() => state.selectSlot(slot)}
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">{slot.time ? formatTimeLabel(slot.time) : "Any time"}</span>
                      {slot.lowSpots && <span className="block text-xs font-medium text-sunset-600">Only {slot.vacancies} spots left</span>}
                    </span>
                    {slot.total != null && <span className="text-sm font-semibold text-ink">{formatMoney(slot.total, slot.currency ?? experience.currency)}</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {state.phase === "pricing" && (
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Getting your price…
          </p>
        )}

        {state.summary && (
          <div className="rounded-2xl bg-sand-50 p-4">
            <ul className="space-y-1.5 text-sm text-ink">
              {state.summary.pricing.line_items.map((line) => (
                <li key={line.unit_id} className="flex justify-between gap-3">
                  <span>
                    {line.quantity} × {guestLabel(line.label)}
                  </span>
                  {line.total != null && <span>{formatMoney(line.total, line.currency ?? state.summary?.pricing.currency)}</span>}
                </li>
              ))}
            </ul>
            <div className="my-3 h-px bg-sand-200" />
            <p className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="font-display text-2xl font-bold text-ink">
                {formatMoney(state.summary.pricing.total, state.summary.pricing.currency ?? experience.currency)}
              </span>
            </p>
            <p className="mt-2 text-xs text-ink-soft">
              Charged by {operator} in {state.summary.pricing.currency ?? experience.currency}.
            </p>
          </div>
        )}

        {state.summary && (
          <Button
            type="button"
            onClick={bookNow}
            disabled={!state.checkoutParams}
            className="h-12 w-full rounded-full bg-brand-700 text-base font-semibold text-white hover:bg-brand-800"
          >
            Book now
          </Button>
        )}
      </div>

      <AppHandoffSheet
        open={handoffOpen}
        onOpenChange={setHandoffOpen}
        source="experience-book-handoff"
        title="Book this in the Gamana app"
        steps={["Open Gamana on your phone", "Your experience opens automatically", "Pick your time and book"]}
        note={`You pay ${operator} directly. Refunds are handled by the operator.`}
        deepLink={`https://www.gamana.app/experiences/${encodeURIComponent(slug)}`}
      />
    </div>
  );
}

function Stepper({
  label,
  value,
  canDecrement,
  canIncrement,
  onChange,
}: {
  label: string;
  value: number;
  canDecrement: boolean;
  canIncrement: boolean;
  onChange: (v: number) => void;
}) {
  const btn =
    "focus-ring grid h-9 w-9 place-items-center rounded-full border border-sand-200 text-ink transition-colors hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} disabled={!canDecrement} onClick={() => onChange(value - 1)} aria-label={`Remove one ${label}`}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} disabled={!canIncrement} onClick={() => onChange(value + 1)} aria-label={`Add one ${label}`}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
