import type { ExperienceListQuery } from "@/lib/experiences/api";

export const PAGE_SIZE = 24;

export const DURATION_BUCKETS = [
  { id: "1h", label: "Up to 1 hour", min: undefined, max: 60 },
  { id: "1-4h", label: "1–4 hours", min: 60, max: 240 },
  { id: "4h-1d", label: "4 hours – 1 day", min: 240, max: 1440 },
  { id: "multi", label: "Multi-day", min: 1441, max: undefined },
] as const;

export type DurationBucketId = (typeof DURATION_BUCKETS)[number]["id"];

export type ExperienceFilters = {
  search: string;
  city: string;
  category: string;
  languages: string[];
  cancellation: string;
  operator: string;
  featured: boolean;
  priceMin?: number;
  priceMax?: number;
  durations: DurationBucketId[];
  ratingMin?: number;
};

export const EMPTY_FILTERS: ExperienceFilters = {
  search: "",
  city: "",
  category: "",
  languages: [],
  cancellation: "",
  operator: "",
  featured: false,
  durations: [],
};

function num(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const BUCKET_IDS = new Set<string>(DURATION_BUCKETS.map((b) => b.id));

export function parseFilters(params: URLSearchParams): ExperienceFilters {
  return {
    search: params.get("q") ?? "",
    city: params.get("city") ?? "",
    category: params.get("category") ?? "",
    languages: params.getAll("language"),
    cancellation: params.get("cancellation") ?? "",
    operator: params.get("operator") ?? "",
    featured: params.get("featured") === "1",
    priceMin: num(params.get("price_min")),
    priceMax: num(params.get("price_max")),
    durations: params.getAll("duration").filter((d): d is DurationBucketId => BUCKET_IDS.has(d)),
    ratingMin: num(params.get("rating_min")),
  };
}

export function parsePage(params: URLSearchParams): number {
  const page = Number(params.get("page"));
  return Number.isInteger(page) && page > 1 ? Math.min(page, 20) : 1;
}

export function serializeFilters(filters: ExperienceFilters, page = 1): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  for (const lang of filters.languages) params.append("language", lang);
  if (filters.cancellation) params.set("cancellation", filters.cancellation);
  if (filters.operator) params.set("operator", filters.operator);
  if (filters.featured) params.set("featured", "1");
  if (filters.priceMin != null) params.set("price_min", String(filters.priceMin));
  if (filters.priceMax != null) params.set("price_max", String(filters.priceMax));
  for (const d of filters.durations) params.append("duration", d);
  if (filters.ratingMin != null) params.set("rating_min", String(filters.ratingMin));
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

/** Checked duration buckets collapse to one `duration_min`–`duration_max` span (the API takes a single range). */
function durationRange(ids: DurationBucketId[]): { min?: number; max?: number } {
  const buckets = DURATION_BUCKETS.filter((b) => ids.includes(b.id));
  if (!buckets.length) return {};
  const mins = buckets.map((b) => b.min);
  const maxes = buckets.map((b) => b.max);
  return {
    min: mins.some((m) => m === undefined) ? undefined : Math.min(...(mins as number[])),
    max: maxes.some((m) => m === undefined) ? undefined : Math.max(...(maxes as number[])),
  };
}

export function toListQuery(filters: ExperienceFilters, page: number, pageSize = PAGE_SIZE): ExperienceListQuery {
  const duration = durationRange(filters.durations);
  return {
    page,
    page_size: pageSize,
    search: filters.search.trim() || undefined,
    city: filters.city || undefined,
    category: filters.category || undefined,
    languages: filters.languages.length ? filters.languages : undefined,
    cancellation_policy: filters.cancellation || undefined,
    operator_name: filters.operator || undefined,
    featured: filters.featured || undefined,
    price_min: filters.priceMin,
    price_max: filters.priceMax,
    duration_min: duration.min,
    duration_max: duration.max,
    rating_min: filters.ratingMin,
  };
}

export type ActiveChip = { key: string; label: string; clear: (f: ExperienceFilters) => ExperienceFilters };

export function activeChips(filters: ExperienceFilters, formatPrice: (n: number) => string): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (filters.search.trim()) chips.push({ key: "q", label: `“${filters.search.trim()}”`, clear: (f) => ({ ...f, search: "" }) });
  if (filters.city) chips.push({ key: "city", label: filters.city, clear: (f) => ({ ...f, city: "" }) });
  if (filters.category) chips.push({ key: "category", label: categoryLabel(filters.category), clear: (f) => ({ ...f, category: "" }) });
  for (const lang of filters.languages) {
    chips.push({ key: `lang-${lang}`, label: lang, clear: (f) => ({ ...f, languages: f.languages.filter((l) => l !== lang) }) });
  }
  if (filters.cancellation) chips.push({ key: "cancel", label: filters.cancellation, clear: (f) => ({ ...f, cancellation: "" }) });
  if (filters.operator) chips.push({ key: "operator", label: filters.operator, clear: (f) => ({ ...f, operator: "" }) });
  if (filters.featured) chips.push({ key: "featured", label: "Gamana picks", clear: (f) => ({ ...f, featured: false }) });
  if (filters.priceMin != null || filters.priceMax != null) {
    const label = [filters.priceMin != null ? formatPrice(filters.priceMin) : null, filters.priceMax != null ? formatPrice(filters.priceMax) : null];
    chips.push({
      key: "price",
      label: label[0] && label[1] ? `${label[0]} – ${label[1]}` : label[0] ? `From ${label[0]}` : `Up to ${label[1]}`,
      clear: (f) => ({ ...f, priceMin: undefined, priceMax: undefined }),
    });
  }
  for (const id of filters.durations) {
    const bucket = DURATION_BUCKETS.find((b) => b.id === id);
    if (bucket) chips.push({ key: `dur-${id}`, label: bucket.label, clear: (f) => ({ ...f, durations: f.durations.filter((d) => d !== id) }) });
  }
  if (filters.ratingMin != null) chips.push({ key: "rating", label: `${filters.ratingMin}+ stars`, clear: (f) => ({ ...f, ratingMin: undefined }) });
  return chips;
}

export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, " ");
}
