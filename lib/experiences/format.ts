import type { ExperienceDetail, ExperienceSummary } from "@/lib/api/schemas/experiences";
import { DEFAULT_TOUR_IMAGE } from "@/lib/marketplace-api";

export const EXPERIENCES_PATH = "/experiences/";

export function experienceHref(slug: string): string {
  return `/experiences/${encodeURIComponent(slug)}/`;
}

export function formatMoney(amount: number, currency: string | null | undefined): string {
  const code = (currency || "INR").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) {
    const hours = minutes / 60;
    const rounded = Number.isInteger(hours) ? hours : Math.round(hours * 2) / 2;
    return `${rounded} ${rounded === 1 ? "hour" : "hours"}`;
  }
  const days = Math.round(minutes / (24 * 60));
  return `${days} ${days === 1 ? "day" : "days"}`;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  en_gb: "English",
  en_us: "English",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  hi: "Hindi",
  pt: "Portuguese",
  ja: "Japanese",
  zh: "Chinese",
  ar: "Arabic",
};

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code.trim().toLowerCase()] ?? code;
}

/** De-duplicated human labels (`EN`, `EN_GB` and `English` collapse to one). */
export function languageLabels(codes: readonly string[]): string[] {
  return Array.from(new Set(codes.map(languageLabel)));
}

export function locationLabel(item: Pick<ExperienceSummary, "city" | "country">): string | null {
  return [item.city, item.country].filter(Boolean).join(", ") || null;
}

export function coverImage(item: Pick<ExperienceSummary, "hero_image_url" | "images">): string {
  if (item.hero_image_url) return item.hero_image_url;
  const sorted = [...item.images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return sorted[0]?.url ?? DEFAULT_TOUR_IMAGE;
}

const BADGE_LABELS: Record<string, string> = {
  gamana_certified: "Gamana certified",
  skip_the_line: "Skip the line",
  private_option: "Private option",
  selling_out_shortly: "Selling out fast",
};

export type CardBadge = { label: string; tone: "sunset" | "brand" | "neutral" };

/** §2.3: selling out › Gamana pick (featured) › first badge. */
export function cardBadge(item: Pick<ExperienceSummary, "selling_out_shortly" | "featured" | "badges">): CardBadge | null {
  if (item.selling_out_shortly || item.badges.includes("selling_out_shortly")) {
    return { label: "Selling out fast", tone: "sunset" };
  }
  if (item.featured) return { label: "Gamana pick", tone: "brand" };
  const first = item.badges[0];
  if (!first) return null;
  return { label: BADGE_LABELS[first] ?? first.replace(/_/g, " "), tone: "neutral" };
}

const FREE_CANCELLATION = /\b(free cancell?ation|fully refundable|refundable)\b/i;

export function hasFreeCancellation(
  item: Pick<ExperienceDetail, "cancellation_policy" | "is_cancellable"> & { booking_policies?: ExperienceDetail["booking_policies"] }
): boolean {
  if (item.is_cancellable === true) return true;
  const policyText = cancellationText(item);
  return !!policyText && FREE_CANCELLATION.test(policyText) && !/non[- ]?refundable/i.test(policyText);
}

function readText(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const text = (value as Record<string, unknown>).text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

export function cancellationText(
  item: Pick<ExperienceDetail, "cancellation_policy"> & { booking_policies?: ExperienceDetail["booking_policies"] }
): string | null {
  return readText(item.booking_policies?.cancellation_policy) ?? item.cancellation_policy ?? null;
}

export function refundText(item: Pick<ExperienceDetail, "booking_policies">): string | null {
  return readText(item.booking_policies?.refund_processing);
}

export function confirmationText(item: Pick<ExperienceDetail, "instant_confirmation" | "booking_policies">): string | null {
  if (item.instant_confirmation === true) return "Instant confirmation";
  return readText(item.booking_policies?.booking_confirmation);
}

export function isPickup(item: Pick<ExperienceDetail, "meeting_type" | "pickup_required" | "pickup_optional">): boolean {
  return item.meeting_type === "PICK_UP" || !!item.pickup_required || !!item.pickup_optional;
}

/** Sorted, de-duplicated gallery from `images[]` and `photos[]`. */
export function galleryImages(item: Pick<ExperienceDetail, "hero_image_url" | "images" | "photos">): string[] {
  const photos = (item.photos ?? []).flatMap((p) => {
    if (typeof p === "string") return [{ url: p, sort_order: 0 }];
    if (p && typeof p === "object" && typeof (p as { url?: unknown }).url === "string") {
      const row = p as { url: string; sort_order?: number | null };
      return [{ url: row.url, sort_order: row.sort_order ?? 0 }];
    }
    return [];
  });
  const rows = [...item.images.map((i) => ({ url: i.url, sort_order: i.sort_order ?? 0 })), ...photos].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const urls = [item.hero_image_url, ...rows.map((r) => r.url)].filter((u): u is string => !!u);
  return Array.from(new Set(urls));
}

export function ageRange(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  if ((min ?? 0) <= 0 && (max ?? 199) >= 99) return null;
  if (max == null || max >= 99) return `Age ${min}+`;
  return `Age ${min ?? 0}–${max}`;
}

/** "Adult (18 - 99)" → "Adult". */
export function guestLabel(label: string | null | undefined, fallback = "Guest"): string {
  return (label ?? fallback).replace(/\s*\(.*\)\s*$/, "").trim() || fallback;
}

/** Local `YYYY-MM-DD` (never UTC: a late-evening user would get tomorrow). */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateLabel(value: string): string {
  const date = fromIsoDate(value);
  if (!date) return value;
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/** `HH:MM` from an OCTO `localDateTimeStart` like `2026-10-22T09:00:00+05:30`. */
export function slotTime(localDateTimeStart: string | null | undefined): string | null {
  const match = /T(\d{2}):(\d{2})/.exec(localDateTimeStart ?? "");
  return match ? `${match[1]}:${match[2]}` : null;
}

export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const date = new Date(2000, 0, 1, h, m);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
