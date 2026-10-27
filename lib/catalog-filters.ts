import type { Tour } from "@/lib/marketplace-data";

/**
 * Marketplace filters, mirroring the Gamana app:
 * - Stories: the Explore → Stories sheet (radius, filter, sort).
 * - Tours: the option ids served by `GET /api/v2/tours/filter-options`, so the
 *   chips can be swapped for the API's list when the visitor is signed in.
 */

export type FilterOption = { id: string; label: string; count?: number };

export type LatLng = { lat: number; lng: number };

type ParamReader = { get(name: string): string | null };

// --- Stories ---------------------------------------------------------------

export const STORY_RADIUS_OPTIONS: FilterOption[] = [
  { id: "5", label: "5 km" },
  { id: "10", label: "10 km" },
  { id: "25", label: "25 km" },
  { id: "50", label: "50 km" },
  { id: "all", label: "All" },
];

export const STORY_FLAG_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "verified", label: "Verified" },
  { id: "legend", label: "Legend" },
  { id: "unlocked", label: "Unlocked" },
];

export const STORY_PRICE_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "premium", label: "Premium" },
];

export const STORY_SORT_OPTIONS: FilterOption[] = [
  { id: "nearest", label: "Nearest first" },
  { id: "farthest", label: "Farthest first" },
  { id: "duration_asc", label: "Duration: Shortest" },
  { id: "duration_desc", label: "Duration: Longest" },
  { id: "newest", label: "Newest" },
];

export type StoryFilters = {
  radius: string;
  flag: string;
  price: string;
  sort: string;
};

export const DEFAULT_STORY_FILTERS: StoryFilters = { radius: "all", flag: "all", price: "all", sort: "nearest" };

// --- Tours -----------------------------------------------------------------

export const TOUR_SORT_OPTIONS: FilterOption[] = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "title_asc", label: "A-Z" },
  { id: "price_asc", label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "duration_asc", label: "Duration: Shortest" },
  { id: "duration_desc", label: "Duration: Longest" },
];

export const TOUR_DURATION_OPTIONS: FilterOption[] = [
  { id: "under_1h", label: "< 1h" },
  { id: "1_to_2h", label: "1–2h" },
  { id: "2_to_4h", label: "2–4h" },
  { id: "4h_plus", label: "4h+" },
];

export const TOUR_PRICE_OPTIONS: FilterOption[] = [
  { id: "free", label: "Free" },
  { id: "under_100", label: "1–99 coins" },
  { id: "100_plus", label: "100+ coins" },
];

export const TOUR_STOP_OPTIONS: FilterOption[] = [
  { id: "1_to_3", label: "1–3 stops" },
  { id: "4_plus", label: "4+ stops" },
];

export const TOUR_ACCESS_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "unlocked", label: "Unlocked" },
  { id: "locked", label: "Locked" },
];

export type TourFilters = {
  categories: string[];
  duration: string[];
  price: string[];
  stops: string[];
  access: string;
  sort: string;
};

export const DEFAULT_TOUR_FILTERS: TourFilters = {
  categories: [],
  duration: [],
  price: [],
  stops: [],
  access: "all",
  sort: "recommended",
};

type Range = { min?: number; max?: number };

const DURATION_RANGES: Record<string, Range> = {
  under_1h: { min: 0, max: 59 },
  "1_to_2h": { min: 60, max: 119 },
  "2_to_4h": { min: 120, max: 239 },
  "4h_plus": { min: 240 },
};

const PRICE_RANGES: Record<string, Range> = {
  free: { min: 0, max: 0 },
  under_100: { min: 1, max: 99 },
  "100_plus": { min: 100 },
};

const STOP_RANGES: Record<string, Range> = {
  "1_to_3": { min: 1, max: 3 },
  "4_plus": { min: 4 },
};

function inRange(value: number | undefined, range: Range): boolean {
  if (value === undefined || !Number.isFinite(value)) return false;
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
}

function matchesAnyBucket(value: number | undefined, ids: string[], ranges: Record<string, Range>): boolean {
  const known = ids.map((id) => ranges[id]).filter(Boolean);
  if (known.length === 0) return true;
  return known.some((range) => inRange(value, range));
}

// --- Shared helpers -----------------------------------------------------------

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function distanceFrom(origin: LatLng | null | undefined, tour: Pick<Tour, "geo">): number | undefined {
  if (!origin || !tour.geo) return undefined;
  return haversineKm(origin, tour.geo);
}

function timeOf(tour: Pick<Tour, "createdAt">): number {
  const t = tour.createdAt ? Date.parse(tour.createdAt) : NaN;
  return Number.isFinite(t) ? t : 0;
}

/** Stable sort that sends items without a value to the end regardless of direction. */
function sortBy<T>(items: T[], value: (item: T) => number | undefined, direction: 1 | -1): T[] {
  return items
    .map((item, index) => ({ item, index, v: value(item) }))
    .sort((a, b) => {
      const av = a.v;
      const bv = b.v;
      if (av === undefined && bv === undefined) return a.index - b.index;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return (av - bv) * direction || a.index - b.index;
    })
    .map(({ item }) => item);
}

type ApplyContext = {
  /** Selected city's coordinates; distance filters and sorts are skipped without it. */
  origin?: LatLng | null;
  unlockedIds?: Set<string>;
};

export function applyStoryFilters<T extends Tour>(tours: T[], filters: StoryFilters, ctx: ApplyContext = {}): T[] {
  const { origin, unlockedIds } = ctx;
  const radiusKm = filters.radius === "all" ? null : Number(filters.radius);

  const filtered = tours.filter((tour) => {
    if (radiusKm && origin) {
      const d = distanceFrom(origin, tour);
      if (d === undefined || d > radiusKm) return false;
    }
    if (filters.flag === "featured" && !tour.isFeatured) return false;
    if (filters.flag === "verified" && !tour.isVerified) return false;
    if (filters.flag === "legend" && !tour.isLegend) return false;
    if (filters.flag === "unlocked" && !unlockedIds?.has(tour.id)) return false;
    if (filters.price === "free" && tour.price !== 0) return false;
    if (filters.price === "premium" && tour.price <= 0) return false;
    return true;
  });

  switch (filters.sort) {
    case "nearest":
      return origin ? sortBy(filtered, (t) => distanceFrom(origin, t), 1) : filtered;
    case "farthest":
      return origin ? sortBy(filtered, (t) => distanceFrom(origin, t), -1) : filtered;
    case "duration_asc":
      return sortBy(filtered, (t) => t.durationMinutes, 1);
    case "duration_desc":
      return sortBy(filtered, (t) => t.durationMinutes, -1);
    case "newest":
      return sortBy(filtered, (t) => timeOf(t) || undefined, -1);
    default:
      return filtered;
  }
}

export function applyTourFilters<T extends Tour>(tours: T[], filters: TourFilters, ctx: ApplyContext = {}): T[] {
  const wanted = new Set(filters.categories.map((c) => c.trim().toLowerCase()).filter(Boolean));
  const { unlockedIds } = ctx;

  const filtered = tours.filter((tour) => {
    if (wanted.size > 0 && !wanted.has(tour.category.trim().toLowerCase())) return false;
    if (!matchesAnyBucket(tour.durationMinutes, filters.duration, DURATION_RANGES)) return false;
    if (!matchesAnyBucket(tour.price, filters.price, PRICE_RANGES)) return false;
    if (!matchesAnyBucket(tour.stopsCount, filters.stops, STOP_RANGES)) return false;
    if (filters.access === "unlocked" && !unlockedIds?.has(tour.id)) return false;
    if (filters.access === "locked" && unlockedIds?.has(tour.id)) return false;
    return true;
  });

  switch (filters.sort) {
    case "newest":
      return sortBy(filtered, (t) => timeOf(t) || undefined, -1);
    case "title_asc":
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    case "price_asc":
      return sortBy(filtered, (t) => t.price, 1);
    case "price_desc":
      return sortBy(filtered, (t) => t.price, -1);
    case "duration_asc":
      return sortBy(filtered, (t) => t.durationMinutes, 1);
    case "duration_desc":
      return sortBy(filtered, (t) => t.durationMinutes, -1);
    default:
      return filtered;
  }
}

/** Category chips from the loaded catalog, deduped case-insensitively like the backend (`id` is the lowercase label). */
export function buildCategoryOptions(tours: Pick<Tour, "category">[]): FilterOption[] {
  const grouped = new Map<string, FilterOption & { count: number }>();
  for (const tour of tours) {
    const label = tour.category?.trim();
    if (!label) continue;
    const id = label.toLowerCase();
    const existing = grouped.get(id);
    if (existing) existing.count += 1;
    else grouped.set(id, { id, label, count: 1 });
  }
  return Array.from(grouped.values()).sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
}

export function countStoryFilters(filters: StoryFilters): number {
  return (
    Number(filters.radius !== DEFAULT_STORY_FILTERS.radius) +
    Number(filters.flag !== DEFAULT_STORY_FILTERS.flag) +
    Number(filters.price !== DEFAULT_STORY_FILTERS.price) +
    Number(filters.sort !== DEFAULT_STORY_FILTERS.sort)
  );
}

export function countTourFilters(filters: TourFilters): number {
  return (
    filters.categories.length +
    filters.duration.length +
    filters.price.length +
    filters.stops.length +
    Number(filters.access !== DEFAULT_TOUR_FILTERS.access) +
    Number(filters.sort !== DEFAULT_TOUR_FILTERS.sort)
  );
}

// --- URL state -----------------------------------------------------------------

const oneOf = (value: string | null, options: FilterOption[], fallback: string) =>
  value && options.some((o) => o.id === value) ? value : fallback;

const listOf = (value: string | null, options?: FilterOption[]) =>
  (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v && (!options || options.some((o) => o.id === v)));

export const FILTER_PARAM_KEYS = ["radius", "show", "price", "sort", "category", "duration", "stops", "access"] as const;

export function parseStoryFilters(params: ParamReader): StoryFilters {
  return {
    radius: oneOf(params.get("radius"), STORY_RADIUS_OPTIONS, DEFAULT_STORY_FILTERS.radius),
    flag: oneOf(params.get("show"), STORY_FLAG_OPTIONS, DEFAULT_STORY_FILTERS.flag),
    price: oneOf(params.get("price"), STORY_PRICE_OPTIONS, DEFAULT_STORY_FILTERS.price),
    sort: oneOf(params.get("sort"), STORY_SORT_OPTIONS, DEFAULT_STORY_FILTERS.sort),
  };
}

export function parseTourFilters(params: ParamReader): TourFilters {
  return {
    categories: listOf(params.get("category")),
    duration: listOf(params.get("duration"), TOUR_DURATION_OPTIONS),
    price: listOf(params.get("price"), TOUR_PRICE_OPTIONS),
    stops: listOf(params.get("stops"), TOUR_STOP_OPTIONS),
    access: oneOf(params.get("access"), TOUR_ACCESS_OPTIONS, DEFAULT_TOUR_FILTERS.access),
    sort: oneOf(params.get("sort"), TOUR_SORT_OPTIONS, DEFAULT_TOUR_FILTERS.sort),
  };
}

/** Returns a copy of `base` with all filter keys replaced by `filters` (defaults are omitted). */
export function writeStoryFilters(base: URLSearchParams, filters: StoryFilters): URLSearchParams {
  const next = clearFilterParams(base);
  if (filters.radius !== DEFAULT_STORY_FILTERS.radius) next.set("radius", filters.radius);
  if (filters.flag !== DEFAULT_STORY_FILTERS.flag) next.set("show", filters.flag);
  if (filters.price !== DEFAULT_STORY_FILTERS.price) next.set("price", filters.price);
  if (filters.sort !== DEFAULT_STORY_FILTERS.sort) next.set("sort", filters.sort);
  return next;
}

export function writeTourFilters(base: URLSearchParams, filters: TourFilters): URLSearchParams {
  const next = clearFilterParams(base);
  if (filters.categories.length) next.set("category", filters.categories.join(","));
  if (filters.duration.length) next.set("duration", filters.duration.join(","));
  if (filters.price.length) next.set("price", filters.price.join(","));
  if (filters.stops.length) next.set("stops", filters.stops.join(","));
  if (filters.access !== DEFAULT_TOUR_FILTERS.access) next.set("access", filters.access);
  if (filters.sort !== DEFAULT_TOUR_FILTERS.sort) next.set("sort", filters.sort);
  return next;
}

export function clearFilterParams(base: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(base.toString());
  for (const key of FILTER_PARAM_KEYS) next.delete(key);
  return next;
}
