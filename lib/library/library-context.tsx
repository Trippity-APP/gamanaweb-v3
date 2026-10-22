"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api/client";
import type { LibraryUnlock } from "@/lib/api/schemas/library";
import { useAuth } from "@/lib/auth/auth-context";
import { fetchPublicTourById } from "@/lib/marketplace-api";
import { fetchAllPublicPlaces, mapPublicPlaceToTour } from "@/lib/places-api";
import type { Tour } from "@/lib/marketplace-data";
import { mergeUnlocks, parseLibraryUnlocks, parseToursMine, withDisplayData, type DisplayData } from "@/lib/library/unlocks";

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

function display(tour: Tour): DisplayData {
  return { title: tour.title, image_url: tour.image || null, city: tour.location.split(",")[0]?.trim() || null };
}

async function catalogDisplayData(places: LibraryUnlock[], walks: LibraryUnlock[]): Promise<Map<string, DisplayData>> {
  const lookup = new Map<string, DisplayData>();
  const needs = (u: LibraryUnlock) => !u.title || !u.image_url;
  const placeIds = new Set(places.filter(needs).map(unlockTargetId));
  const walkIds = Array.from(new Set(walks.filter(needs).map(unlockTargetId))).filter(Boolean);

  if (placeIds.size > 0) {
    const catalogue = await fetchAllPublicPlaces().catch(() => []);
    for (const place of catalogue) {
      const tour = mapPublicPlaceToTour(place);
      if (tour && placeIds.has(tour.id)) lookup.set(tour.id, display(tour));
    }
  }
  const walkTours = await Promise.allSettled(walkIds.map((id) => fetchPublicTourById(id)));
  for (const result of walkTours) {
    if (result.status === "fulfilled" && result.value) lookup.set(result.value.id, display(result.value));
  }
  return lookup;
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
    const [unlocks, mine] = await Promise.all([
      apiFetch<unknown>("/library/unlocks", { auth: "required", version: "v2" })
        .then(parseLibraryUnlocks)
        .catch(() => null),
      apiFetch<unknown>("/tours/mine", { auth: "required", version: "v2", query: { skip: 0, limit: 10 } })
        .then(parseToursMine)
        .catch(() => null),
    ]);
    const placeList = unlocks?.places ?? null;
    const walkList = unlocks || mine ? mergeUnlocks(unlocks?.storylists ?? [], mine ?? []) : null;
    if (placeList) setPlaces(placeList);
    if (walkList) setTours(walkList);
    setLoading(false);

    const lookup = await catalogDisplayData(placeList ?? [], walkList ?? []);
    if (lookup.size === 0) return;
    setPlaces((cur) => (cur === placeList && cur ? withDisplayData(cur, lookup) : cur));
    setTours((cur) => (cur === walkList && cur ? withDisplayData(cur, lookup) : cur));
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
      return list?.find((u) => unlockTargetId(u) === id && u.is_unlocked !== false && !isExpired(u));
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

/** `POST /me/handoff/{kind}/{id}` → `data: { handoff: { push_sent, device_count } }`. */
export async function sendToPhone(kind: UnlockKind, id: string): Promise<HandoffResult> {
  const data = await apiFetch<{ handoff?: HandoffResult | null } & HandoffResult>(
    `/me/handoff/${kind}/${encodeURIComponent(id)}`,
    { method: "POST", auth: "required", body: {} },
  );
  return data?.handoff ?? data ?? {};
}
