import { z } from "zod";
import { idField, nullish } from "@/lib/api/schemas/common";

export const checkoutStatusSchema = z.enum([
  "started",
  "options_ready",
  "submitted",
  "pending_token_pay",
  "pending_mock_pay",
  "confirmed",
  "payment_failed",
  "expired",
  "aborted",
]);

export type CheckoutStatus = z.infer<typeof checkoutStatusSchema>;

export const bookingSummarySchema = z
  .object({
    id: nullish(idField),
    _id: nullish(idField),
    booking_id: nullish(idField),
    status: nullish(z.string()),
    experience_id: nullish(idField),
    experience_slug: nullish(z.string()),
    title: nullish(z.string()),
    image_url: nullish(z.string()),
    local_date: nullish(z.string()),
    local_time: nullish(z.string()),
    currency: nullish(z.string()),
    total_price: nullish(z.number()),
    created_at: nullish(z.string()),
  })
  .passthrough();

export type BookingSummary = z.infer<typeof bookingSummarySchema>;

export const checkoutStateSchema = z
  .object({
    checkout_id: nullish(idField),
    status: checkoutStatusSchema.or(z.string()),
    can_retry_payment: nullish(z.boolean()),
    booking_id: nullish(idField),
    payment_failure: z
      .object({ user_message: nullish(z.string()) })
      .passthrough()
      .nullish(),
  })
  .passthrough();

export type CheckoutState = z.infer<typeof checkoutStateSchema>;
