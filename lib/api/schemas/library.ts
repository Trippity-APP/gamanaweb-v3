import { z } from "zod";
import { idField, nullish } from "@/lib/api/schemas/common";

/** Missing `activation_status` means an app unlock, which is always active (B4). */
export const activationStatusSchema = z.enum(["pending", "active"]).catch("active");

export const libraryUnlockSchema = z
  .object({
    id: nullish(idField),
    _id: nullish(idField),
    place_id: nullish(idField),
    storylist_id: nullish(idField),
    title: nullish(z.string()),
    name: nullish(z.string()),
    image_url: nullish(z.string()),
    city: nullish(z.string()),
    expires_at: nullish(z.string()),
    activation_status: activationStatusSchema.optional().transform((value) => value ?? "active"),
    reserved_until: nullish(z.string()),
    /** Only on `tours/mine` cards: a user's own tour can still be locked. */
    is_unlocked: nullish(z.boolean()),
  })
  .passthrough();

export type LibraryUnlock = z.infer<typeof libraryUnlockSchema>;
