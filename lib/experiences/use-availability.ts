"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client";
import type { AvailabilitySlot, ExperienceDetail, OrderSummary } from "@/lib/api/schemas/experiences";
import {
  getAvailabilityCalendar,
  getAvailabilityRange,
  getAvailabilitySlots,
  getOrderSummary,
  type GuestSelection,
} from "@/lib/experiences/api";
import { fromIsoDate, guestLabel, slotTime, toIsoDate } from "@/lib/experiences/format";

export const MAX_TRAVELLERS = 30;
const LOW_SPOTS = 5;

export type AvailabilityPhase = "idle" | "checking" | "slots" | "pricing" | "priced";

export type SlotOption = {
  id: string | null;
  time: string | null;
  vacancies: number | null;
  lowSpots: boolean;
  total: number | null;
  currency: string | null;
};

type GuestCounts = Record<string, number>;

function initialGuests(experience: ExperienceDetail): GuestCounts {
  const counts: GuestCounts = {};
  for (const g of experience.guest_types) {
    counts[g.unit_id] = g.required ? Math.max(g.min_quantity ?? 1, 1) : 0;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0 && experience.guest_types[0]) {
    const first = experience.guest_types[0];
    counts[first.unit_id] = Math.max(first.min_quantity ?? 1, 1);
  }
  return counts;
}

function parseGuestParam(value: string | null, experience: ExperienceDetail): GuestCounts | null {
  if (!value) return null;
  const known = new Set(experience.guest_types.map((g) => g.unit_id));
  const counts: GuestCounts = Object.fromEntries(experience.guest_types.map((g) => [g.unit_id, 0]));
  let any = false;
  for (const part of value.split(",")) {
    const [unit, qty] = part.split(":");
    const n = Number(qty);
    if (known.has(unit) && Number.isInteger(n) && n > 0) {
      counts[unit] = Math.min(n, MAX_TRAVELLERS);
      any = true;
    }
  }
  return any ? counts : null;
}

export function guestsToParam(counts: GuestCounts): string {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([unit, n]) => `${unit}:${n}`)
    .join(",");
}

function toSelections(counts: GuestCounts): GuestSelection[] {
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([unit_id, quantity]) => ({ unit_id, quantity }));
}

/** Pulls `code` out of either error shape the availability endpoints use. */
export function availabilityErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const details = error.details as Record<string, unknown> | null;
  const nested = details?.error as Record<string, unknown> | undefined;
  const detail = nested?.detail as Record<string, unknown> | undefined;
  const code = detail?.code ?? nested?.code ?? (typeof error.code === "string" ? error.code : null);
  return typeof code === "string" ? code : null;
}

function isDayAvailable(row: AvailabilitySlot): boolean {
  if (row.available === true) return true;
  const status = (row.status ?? "").toUpperCase();
  if (["AVAILABLE", "FREESALE", "LIMITED"].includes(status)) return true;
  return (row.vacancies ?? 0) > 0;
}

function toSlotOption(slot: AvailabilitySlot): SlotOption {
  const pricing = slot.pricing ?? slot.pricingFrom;
  const vacancies = slot.vacancies ?? null;
  return {
    id: slot.id ?? null,
    time: slotTime(slot.localDateTimeStart),
    vacancies,
    lowSpots: vacancies != null && vacancies > 0 && vacancies <= LOW_SPOTS,
    total: pricing?.retail_major ?? null,
    currency: pricing?.currency ?? null,
  };
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function useAvailability(experience: ExperienceDetail | null) {
  const slug = experience?.slug ?? null;

  const [guests, setGuestsState] = useState<GuestCounts>({});
  const [date, setDateState] = useState<string | null>(null);
  const [time, setTimeState] = useState<string | null>(null);
  const [phase, setPhase] = useState<AvailabilityPhase>("idle");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [soldOut, setSoldOut] = useState(false);
  const [nextDates, setNextDates] = useState<string[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => new Date());
  const [availableDays, setAvailableDays] = useState<Set<string> | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(false);
  const calendarCache = useRef(new Map<string, Set<string>>());
  const restored = useRef(false);

  const selections = useMemo(() => toSelections(guests), [guests]);
  const guestKey = guestsToParam(guests);
  const totalGuests = selections.reduce((a, s) => a + s.quantity, 0);

  const syncUrl = useCallback((next: { date?: string | null; time?: string | null; guests?: GuestCounts }) => {
    const params = new URLSearchParams(window.location.search);
    const set = (key: string, value: string | null | undefined) => (value ? params.set(key, value) : params.delete(key));
    if ("date" in next) set("date", next.date);
    if ("time" in next) set("time", next.time);
    if (next.guests) set("g", guestsToParam(next.guests));
    const qs = params.toString();
    const { pathname } = window.location;
    window.history.replaceState(window.history.state, "", qs ? `${pathname}?${qs}` : pathname);
  }, []);

  const resetResults = () => {
    setPhase("idle");
    setSlots([]);
    setSoldOut(false);
    setNextDates([]);
    setSummary(null);
    setError(null);
  };

  useEffect(() => {
    if (!experience || restored.current) return;
    restored.current = true;
    const searchParams = new URLSearchParams(window.location.search);
    const fromUrl = parseGuestParam(searchParams.get("g"), experience);
    setGuestsState(fromUrl ?? initialGuests(experience));
    const urlDate = searchParams.get("date");
    const parsed = urlDate ? fromIsoDate(urlDate) : null;
    if (parsed && urlDate && urlDate >= toIsoDate(new Date())) {
      setDateState(urlDate);
      setVisibleMonth(parsed);
      setTimeState(searchParams.get("time"));
    }
  }, [experience]);

  const setGuest = (unitId: string, quantity: number) => {
    if (!experience) return;
    const type = experience.guest_types.find((g) => g.unit_id === unitId);
    const min = type?.required ? Math.max(type.min_quantity ?? 1, 1) : 0;
    const max = type?.max_quantity ?? MAX_TRAVELLERS;
    const others = totalGuests - (guests[unitId] ?? 0);
    const clamped = Math.max(min, Math.min(quantity, max, MAX_TRAVELLERS - others));
    const next = { ...guests, [unitId]: clamped };
    setGuestsState(next);
    setTimeState(null);
    resetResults();
    syncUrl({ guests: next, time: null });
  };

  const selectDate = (iso: string | null) => {
    setDateState(iso);
    setTimeState(null);
    resetResults();
    syncUrl({ date: iso, time: null });
  };

  const loadCalendar = useCallback(
    async (month: Date, signal?: AbortSignal) => {
      if (!slug || !selections.length) return;
      const key = `${monthKey(month)}|${guestKey}`;
      const cached = calendarCache.current.get(key);
      if (cached) {
        setAvailableDays(cached);
        setCalendarError(false);
        return;
      }
      const today = toIsoDate(new Date());
      const start = toIsoDate(new Date(month.getFullYear(), month.getMonth(), 1));
      const end = toIsoDate(new Date(month.getFullYear(), month.getMonth() + 2, 0));
      setCalendarLoading(true);
      setCalendarError(false);
      try {
        const res = await getAvailabilityCalendar(
          slug,
          { local_date_start: start < today ? today : start, local_date_end: end, guests: selections },
          signal
        );
        const days = new Set(res.calendar.filter(isDayAvailable).map((r) => (r.localDate ?? "").slice(0, 10)));
        calendarCache.current.set(key, days);
        setAvailableDays(days);
      } catch (err) {
        if (signal?.aborted) return;
        if (availabilityErrorCode(err) === "no_availability") {
          const empty = new Set<string>();
          calendarCache.current.set(key, empty);
          setAvailableDays(empty);
        } else {
          setAvailableDays(null);
          setCalendarError(true);
        }
      } finally {
        if (!signal?.aborted) setCalendarLoading(false);
      }
    },
    [slug, selections, guestKey]
  );

  const fetchNextDates = async (from: string) => {
    if (!slug) return;
    const start = fromIsoDate(from) ?? new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 13);
    try {
      const res = await getAvailabilityRange(slug, {
        local_date_start: toIsoDate(start),
        local_date_end: toIsoDate(end),
        guests: selections,
      });
      setNextDates(res.dates_with_slots.filter((d) => d !== from).slice(0, 3));
    } catch {
      setNextDates([]);
    }
  };

  const priceSlot = async (slot: SlotOption, forDate: string) => {
    if (!slug) return;
    setTimeState(slot.time);
    syncUrl({ time: slot.time });
    setPhase("pricing");
    setSummary(null);
    setError(null);
    try {
      const res = await getOrderSummary(slug, {
        local_date: forDate,
        local_time: slot.time ?? undefined,
        guests: selections,
      });
      setSummary(res);
      setPhase("priced");
    } catch {
      setPhase("slots");
      setError("Couldn't price this time. Try another time or try again.");
    }
  };

  const checkAvailability = async (forDate = date) => {
    if (!slug || !forDate || !selections.length) return;
    setPhase("checking");
    setSlots([]);
    setSoldOut(false);
    setNextDates([]);
    setSummary(null);
    setError(null);
    const travellers = selections.reduce((n, s) => n + s.quantity, 0);
    track("availability_check", { slug, date: forDate, guests: travellers });
    try {
      const res = await getAvailabilitySlots(slug, { local_date: forDate, guests: selections });
      const options = res.slots.map(toSlotOption).filter((s) => s.vacancies !== 0);
      if (!options.length) {
        track("availability_no_slots", { slug, travellers });
        setSoldOut(true);
        setPhase("slots");
        void fetchNextDates(forDate);
        return;
      }
      setSlots(options);
      setPhase("slots");
      const preselected = time ? options.find((s) => s.time === time) : options.length === 1 ? options[0] : undefined;
      if (preselected) void priceSlot(preselected, forDate);
    } catch (err) {
      const code = availabilityErrorCode(err);
      if (code === "no_availability" || code === "insufficient_vacancies") {
        track("availability_no_slots", { slug, travellers });
        setSoldOut(true);
        setPhase("slots");
        void fetchNextDates(forDate);
        return;
      }
      setPhase("idle");
      setError("Couldn't load availability. Try again.");
    }
  };

  const guestSummary = useMemo(() => {
    if (!experience) return "";
    return experience.guest_types
      .filter((g) => (guests[g.unit_id] ?? 0) > 0)
      .map((g) => {
        const n = guests[g.unit_id];
        const label = guestLabel(g.label, g.type ?? "Guest");
        return `${n} ${label}${n > 1 && !/s$/i.test(label) && !/\(/.test(label) ? "s" : ""}`;
      })
      .join(", ");
  }, [experience, guests]);

  const checkoutParams = useMemo(() => {
    if (!slug || !date || !summary) return null;
    const params = new URLSearchParams({ exp: slug, date, g: guestKey });
    const t = summary.selection.local_time ?? time;
    if (t) params.set("time", t);
    if (summary.selection.slot_id) params.set("slot", summary.selection.slot_id);
    return params.toString();
  }, [slug, date, summary, guestKey, time]);

  return {
    guests,
    setGuest,
    totalGuests,
    guestSummary,
    date,
    selectDate,
    time,
    phase,
    slots,
    soldOut,
    nextDates,
    summary,
    error,
    checkAvailability,
    selectSlot: (slot: SlotOption) => date && priceSlot(slot, date),
    visibleMonth,
    setVisibleMonth,
    availableDays,
    calendarLoading,
    calendarError,
    loadCalendar,
    checkoutParams,
  };
}

export type AvailabilityState = ReturnType<typeof useAvailability>;
