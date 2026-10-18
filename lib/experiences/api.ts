import { apiFetch } from "@/lib/api/client";
import {
  availabilityCalendarSchema,
  availabilityRangeSchema,
  availabilitySlotsSchema,
  experienceDetailResponseSchema,
  experienceFilterOptionsSchema,
  experienceListSchema,
  experienceReviewListSchema,
  orderSummarySchema,
  type ExperienceDetail,
  type ExperienceSummary,
} from "@/lib/api/schemas/experiences";

export type GuestSelection = { unit_id: string; quantity: number };

export type ExperienceListQuery = {
  page?: number;
  page_size?: number;
  search?: string;
  city?: string;
  country?: string;
  category?: string;
  languages?: string[];
  cancellation_policy?: string;
  operator_name?: string;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  rating_min?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
};

export function listExperiences(query: ExperienceListQuery, signal?: AbortSignal) {
  return apiFetch("/experiences", {
    auth: "none",
    query,
    schema: experienceListSchema,
    signal,
    unwrap: false,
  });
}

export function getExperienceFilterOptions(signal?: AbortSignal) {
  return apiFetch("/experiences/filter-options", {
    auth: "none",
    schema: experienceFilterOptionsSchema,
    signal,
    unwrap: false,
  });
}

export function getExperienceDetail(slug: string, signal?: AbortSignal): Promise<ExperienceDetail> {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}`, {
    auth: "none",
    query: { include_scarcity: true },
    schema: experienceDetailResponseSchema,
    signal,
    unwrap: false,
  });
}

/** Build-time only: never throws, so a flaky API can't break `next build`. */
export async function getExperienceDetailSafe(slug: string): Promise<ExperienceDetail | null> {
  try {
    return await getExperienceDetail(slug);
  } catch {
    return null;
  }
}

/** Every published experience, paging through `page_size=100`. Build-time only. */
export async function listAllPublishedExperiences(): Promise<ExperienceSummary[]> {
  const out: ExperienceSummary[] = [];
  try {
    for (let page = 1; page <= 50; page += 1) {
      const res = await listExperiences({ page, page_size: 100 });
      out.push(...res.items);
      if (!res.has_next) break;
    }
  } catch {
    // Build-time API may be unavailable; fall back to whatever was fetched.
  }
  return out;
}

export function getExperienceReviews(slug: string, page = 1, signal?: AbortSignal) {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/reviews`, {
    auth: "none",
    query: { page, page_size: 10 },
    schema: experienceReviewListSchema,
    signal,
    unwrap: false,
  });
}

export function getAvailabilityCalendar(
  slug: string,
  body: { local_date_start: string; local_date_end: string; guests: GuestSelection[] },
  signal?: AbortSignal
) {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/availability/calendar`, {
    method: "POST",
    auth: "none",
    body,
    schema: availabilityCalendarSchema,
    signal,
    unwrap: false,
  });
}

export function getAvailabilitySlots(
  slug: string,
  body: { local_date: string; guests: GuestSelection[] },
  signal?: AbortSignal
) {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/availability`, {
    method: "POST",
    auth: "none",
    body,
    schema: availabilitySlotsSchema,
    signal,
  });
}

export function getAvailabilityRange(
  slug: string,
  body: { local_date_start: string; local_date_end: string; guests: GuestSelection[] },
  signal?: AbortSignal
) {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/availability/range`, {
    method: "POST",
    auth: "none",
    body,
    schema: availabilityRangeSchema,
    signal,
    unwrap: false,
  });
}

export function getOrderSummary(
  slug: string,
  body: { local_date: string; local_time?: string; guests: GuestSelection[] },
  signal?: AbortSignal
) {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/order-summary`, {
    method: "POST",
    auth: "none",
    body,
    schema: orderSummarySchema,
    signal,
    unwrap: false,
  });
}
