import { z } from "zod";
import { idField, nullish, paginatedItems } from "@/lib/api/schemas/common";

const stringList = z
  .array(z.string())
  .nullish()
  .transform((value) => value ?? []);

export const experienceImageSchema = z
  .object({
    url: z.string(),
    caption: nullish(z.string()),
    sort_order: nullish(z.number()),
  })
  .passthrough();

export const guestTypeSchema = z
  .object({
    unit_id: idField,
    label: nullish(z.string()),
    min_quantity: nullish(z.number()),
    max_quantity: nullish(z.number()),
    required: nullish(z.boolean()),
    type: nullish(z.string()),
    min_age: nullish(z.number()),
    max_age: nullish(z.number()),
  })
  .passthrough();

export const experienceSummarySchema = z
  .object({
    id: idField,
    title: z.string(),
    slug: nullish(z.string()),
    short_description: nullish(z.string()),
    description: nullish(z.string()),
    category: nullish(z.string()),
    tags: stringList,
    badges: stringList,
    city: nullish(z.string()),
    locality: nullish(z.string()),
    country: nullish(z.string()),
    duration_minutes: nullish(z.number()),
    languages: stringList,
    operator_name: nullish(z.string()),
    currency: nullish(z.string()),
    from_price: nullish(z.number()),
    compare_at_price: nullish(z.number()),
    hero_image_url: nullish(z.string()),
    linked_story_id: nullish(z.string()),
    images: z
      .array(experienceImageSchema)
      .nullish()
      .transform((value) => value ?? []),
    average_rating: nullish(z.number()),
    review_count: nullish(z.number()),
    featured: nullish(z.boolean()),
    selling_out_shortly: nullish(z.boolean()),
    status: nullish(z.string()),
    published_at: nullish(z.string()),
    updated_at: nullish(z.string()),
  })
  .passthrough();

export type ExperienceSummary = z.infer<typeof experienceSummarySchema>;

export const experienceListSchema = paginatedItems(experienceSummarySchema);

export type ExperienceList = z.infer<typeof experienceListSchema>;

export const experienceDetailSchema = experienceSummarySchema
  .extend({
    long_description: nullish(z.string()),
    latitude: nullish(z.number()),
    longitude: nullish(z.number()),
    photos: z.array(z.unknown()).nullish(),
    min_spots_remaining: nullish(z.number()),
    why_gamana_recommends: nullish(z.string()),
    highlights: stringList,
    inclusions: stringList,
    exclusions: stringList,
    know_before_you_go: stringList,
    important_information: stringList,
    what_to_bring: stringList,
    not_suitable_for: stringList,
    itinerary: z.array(z.unknown()).nullish().transform((value) => value ?? []),
    meeting_type: nullish(z.string()),
    meeting_point_text: nullish(z.string()),
    meeting_point_address: nullish(z.string()),
    pickup_required: nullish(z.boolean()),
    pickup_optional: nullish(z.boolean()),
    custom_pickup_allowed: nullish(z.boolean()),
    cancellation_policy: nullish(z.string()),
    is_cancellable: nullish(z.boolean()),
    instant_confirmation: nullish(z.boolean()),
    booking_confirmation_mode: nullish(z.string()),
    booking_policies: z.record(z.unknown()).nullish(),
    guest_types: z
      .array(guestTypeSchema)
      .nullish()
      .transform((value) => value ?? []),
    bokun_widget_url: nullish(z.string()),
    source_system: nullish(z.string()),
  })
  .passthrough();

export type ExperienceDetail = z.infer<typeof experienceDetailSchema>;

/** `GET /experiences/{slug}` returns `{ success, experience }` (no `data` envelope). */
export const experienceDetailResponseSchema = z
  .object({ experience: experienceDetailSchema })
  .passthrough()
  .transform((value) => value.experience);
