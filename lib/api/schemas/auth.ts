import { z } from "zod";
import { nullish } from "@/lib/api/schemas/common";

export const webRefreshResponseSchema = z
  .object({
    access_token: z.string().min(1),
    session_id: z.string().min(1),
    expires_in: nullish(z.number()),
  })
  .passthrough();

export type WebRefreshResponse = z.infer<typeof webRefreshResponseSchema>;

export const webLoginResponseSchema = z
  .object({
    access_token: z.string().min(1),
    session_id: z.string().min(1),
    expires_in: nullish(z.number()),
    /** User fields arrive flat in `data` (no nested `user`, no `is_new_user`). */
    _id: nullish(z.union([z.string(), z.number()]).transform(String)),
    id: nullish(z.union([z.string(), z.number()]).transform(String)),
    first_name: nullish(z.string()),
    last_name: nullish(z.string()),
    email: nullish(z.string()),
    phone: nullish(z.union([z.string(), z.number()]).transform(String)),
    country_code: nullish(z.string()),
    personalization: z.unknown().optional(),
    organizations: z.array(z.unknown()).nullish(),
  })
  .passthrough();

export type WebLoginResponse = z.infer<typeof webLoginResponseSchema>;
