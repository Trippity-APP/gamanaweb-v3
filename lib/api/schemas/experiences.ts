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

const range = z
  .object({ min: nullish(z.number()), max: nullish(z.number()) })
  .passthrough()
  .nullish()
  .transform((value) => value ?? undefined);

export const ratingPresetSchema = z
  .object({ id: z.string(), min: z.number(), label: nullish(z.string()) })
  .passthrough();

/** `GET /experiences/filter-options` → `{ success, filters }`. */
export const experienceFilterOptionsSchema = z
  .object({
    filters: z
      .object({
        categories: stringList,
        cities: stringList,
        countries: stringList,
        tags: stringList,
        languages: stringList,
        operators: stringList,
        cancellation_policies: stringList,
        price: range,
        duration_minutes: range,
        rating: z
          .object({
            presets: z
              .array(ratingPresetSchema)
              .nullish()
              .transform((value) => value ?? []),
          })
          .passthrough()
          .nullish()
          .transform((value) => value ?? { presets: [] }),
        featured_available: nullish(z.boolean()),
      })
      .passthrough(),
  })
  .passthrough()
  .transform((value) => value.filters);

export type ExperienceFilterOptions = z.infer<typeof experienceFilterOptionsSchema>;

/** OCTO money block after backend enrichment (`*_major` = display units). */
export const octoPricingSchema = z
  .object({
    retail: nullish(z.number()),
    original: nullish(z.number()),
    currency: nullish(z.string()),
    currencyPrecision: nullish(z.number()),
    retail_major: nullish(z.number()),
    original_major: nullish(z.number()),
  })
  .passthrough();

/** One OCTO availability row (calendar day or bookable slot). */
export const availabilitySlotSchema = z
  .object({
    id: nullish(z.string()),
    localDate: nullish(z.string()),
    localDateTimeStart: nullish(z.string()),
    localDateTimeEnd: nullish(z.string()),
    allDay: nullish(z.boolean()),
    available: nullish(z.boolean()),
    status: nullish(z.string()),
    vacancies: nullish(z.number()),
    capacity: nullish(z.number()),
    pricing: nullish(octoPricingSchema),
    pricingFrom: nullish(octoPricingSchema),
  })
  .passthrough();

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;

const slotList = z
  .array(availabilitySlotSchema)
  .nullish()
  .transform((value) => value ?? []);

export const availabilityCalendarSchema = z.object({ calendar: slotList }).passthrough();
export const availabilitySlotsSchema = z
  .object({ local_date: nullish(z.string()), slots: slotList })
  .passthrough();
export const availabilityRangeSchema = z
  .object({ dates_with_slots: stringList, slots: slotList })
  .passthrough();

export const orderLineItemSchema = z
  .object({
    unit_id: idField,
    label: nullish(z.string()),
    quantity: z.number(),
    unit_price: nullish(z.number()),
    total: nullish(z.number()),
    currency: nullish(z.string()),
  })
  .passthrough();

/** `POST /experiences/{ref}/order-summary` — authoritative totals. */
export const orderSummarySchema = z
  .object({
    selection: z
      .object({
        local_date: nullish(z.string()),
        local_time: nullish(z.string()),
        slot_id: nullish(z.string()),
      })
      .passthrough(),
    pricing: z
      .object({
        currency: nullish(z.string()),
        total: z.number(),
        display_total: nullish(z.string()),
        all_taxes_and_fees_included: nullish(z.boolean()),
        line_items: z.array(orderLineItemSchema),
      })
      .passthrough(),
  })
  .passthrough();

export type OrderSummary = z.infer<typeof orderSummarySchema>;

export const experienceReviewSchema = z
  .object({
    id: idField,
    rating: z.number(),
    review_text: nullish(z.string()),
    review_text_tags: stringList,
    photo_urls: stringList,
    created_at: nullish(z.string()),
    reviewer: z
      .object({
        display_name: nullish(z.string()),
        profile_pic_url: nullish(z.string()),
      })
      .passthrough()
      .nullish()
      .transform((value) => value ?? undefined),
  })
  .passthrough();

export type ExperienceReview = z.infer<typeof experienceReviewSchema>;

export const experienceReviewListSchema = paginatedItems(experienceReviewSchema).and(
  z
    .object({
      summary: z
        .object({
          average_rating: nullish(z.number()),
          review_count: nullish(z.number()),
          distribution: z.record(z.number()).nullish(),
        })
        .passthrough()
        .nullish(),
    })
    .passthrough()
);

export type ExperienceReviewList = z.infer<typeof experienceReviewListSchema>;
