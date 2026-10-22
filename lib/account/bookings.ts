import { z } from "zod";
import { apiFetch } from "@/lib/api/client";
import { idField, nullish } from "@/lib/api/schemas/common";
import { listOf } from "@/lib/account/api";

const textList = z
  .union([z.array(z.string()), z.string()])
  .nullish()
  .transform((v) => (Array.isArray(v) ? v : v ? [v] : []));

export const bookingBriefSchema = z
  .object({
    id: nullish(idField),
    booking_id: nullish(idField),
    status: nullish(z.string()),
    title: nullish(z.string()),
    experience_slug: nullish(z.string()),
    image_url: nullish(z.string()),
    local_date: nullish(z.string()),
    local_time: nullish(z.string()),
    travellers: nullish(z.string()),
    currency: nullish(z.string()),
    total_price: nullish(z.number()),
    confirmation_code: nullish(z.string()),
    pickup: nullish(z.string()),
    meeting_point: nullish(z.string()),
    meeting_point_address: nullish(z.string()),
    latitude: nullish(z.number()),
    longitude: nullish(z.number()),
    what_to_bring: textList,
    cancellation_policy: nullish(z.string()),
    refund_text: nullish(z.string()),
    is_cancellable: nullish(z.boolean()),
    duration_minutes: nullish(z.number()),
    operator_name: nullish(z.string()),
    operator: z
      .object({ name: nullish(z.string()), phone: nullish(z.string()), email: nullish(z.string()) })
      .passthrough()
      .nullish(),
  })
  .passthrough();

export type BookingBrief = z.infer<typeof bookingBriefSchema>;

export function fetchBookingBrief(id: string): Promise<BookingBrief> {
  return apiFetch(`/my/bookings/${encodeURIComponent(id)}/brief`, { auth: "required", schema: bookingBriefSchema });
}

export function cancelBooking(id: string): Promise<unknown> {
  return apiFetch(`/my/bookings/${encodeURIComponent(id)}/cancel`, { method: "POST", auth: "required", body: {} });
}

const reviewableSchema = z
  .object({
    id: idField,
    booking_id: nullish(idField),
    experience_slug: nullish(z.string()),
    title: nullish(z.string()),
  })
  .passthrough();

export type Reviewable = z.infer<typeof reviewableSchema>;

export function fetchReviewable(): Promise<Reviewable[]> {
  return apiFetch("/my/reviewable", { auth: "required", schema: listOf(reviewableSchema) });
}

export type ReviewTag = { id: string; label: string };

const tagSchema = z
  .union([z.string(), z.object({ id: idField, label: nullish(z.string()) }).passthrough()])
  .transform((t): ReviewTag => (typeof t === "string" ? { id: t, label: t } : { id: String(t.id), label: t.label ?? String(t.id) }));

const tagsSchema = z
  .union([z.array(tagSchema), z.object({ tags: z.array(tagSchema) }).passthrough()])
  .transform((v) => (Array.isArray(v) ? v : v.tags));

export function fetchReviewTags(): Promise<ReviewTag[]> {
  return apiFetch("/experiences/review-tags", { auth: "none", schema: tagsSchema, unwrap: false });
}

const photoUploadSchema = z.object({ blob_name: z.string() }).passthrough();

/** The endpoint takes one `file` per request and returns its `blob_name`. */
export async function uploadReviewPhotos(slug: string, files: Blob[]): Promise<string[]> {
  const names: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const form = new FormData();
    form.append("file", files[i], `review-${i + 1}.jpg`);
    const res = await apiFetch(`/experiences/${encodeURIComponent(slug)}/reviews/photos`, {
      method: "POST",
      auth: "required",
      body: form,
      schema: photoUploadSchema,
      unwrap: false,
    });
    names.push(res.blob_name);
  }
  return names;
}

/** `CreateExperienceReviewRequest`; creating the review also closes the reviewable prompt. */
export type ReviewInput = {
  rating: number;
  review_text?: string;
  review_text_tags?: string[];
  would_recommend?: boolean;
  photo_blob_names?: string[];
};

export function submitReview(slug: string, body: ReviewInput): Promise<unknown> {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/reviews`, { method: "POST", auth: "required", body, unwrap: false });
}

export type BookingTone = "confirmed" | "pending" | "cancelled" | "other";

export function bookingTone(status: string | null | undefined): BookingTone {
  const s = (status ?? "").toLowerCase();
  if (/cancel|refund/.test(s)) return "cancelled";
  if (/confirm|complete|success/.test(s)) return "confirmed";
  if (/pend|submit|process|request/.test(s)) return "pending";
  return "other";
}

export const TONE_CLASS: Record<BookingTone, string> = {
  confirmed: "bg-forest/10 text-forest",
  pending: "bg-sunset-100 text-sunset-600",
  cancelled: "bg-muted text-ink-soft",
  other: "bg-sand-100 text-ink-soft",
};

export const TONE_LABEL: Record<BookingTone, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
  other: "Booked",
};
