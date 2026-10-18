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
    user: z.record(z.unknown()).nullish(),
    organizations: z.array(z.unknown()).nullish(),
    is_new_user: nullish(z.boolean()),
  })
  .passthrough();

export type WebLoginResponse = z.infer<typeof webLoginResponseSchema>;
