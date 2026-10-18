import { ApiError, apiFetch, RateLimitedError, webClientHeaders } from "@/lib/api/client";
import { webLoginResponseSchema, type WebLoginResponse } from "@/lib/api/schemas/auth";

export function requestOtp(countryCode: string, phone: string): Promise<unknown> {
  return apiFetch("/auth/request-otp", {
    method: "POST",
    auth: "none",
    body: { country_code: countryCode, phone },
  });
}

function toLogin(payload: unknown): WebLoginResponse {
  const parsed = webLoginResponseSchema.safeParse(payload);
  // An invalid OTP keeps the app's `{ data: { success: false } }` shape, i.e. no tokens.
  if (!parsed.success) throw new ApiError("That code didn't match.", 400, "invalid_otp", payload);
  return parsed.data;
}

export async function verifyOtp(countryCode: string, phone: string, otp: string): Promise<WebLoginResponse> {
  const payload = await apiFetch("/auth/web/login/otp", {
    method: "POST",
    auth: "none",
    headers: { ...webClientHeaders },
    body: { country_code: countryCode, phone, otp },
  });
  return toLogin(payload);
}

export async function oauthLogin(body: {
  auth_type: "google" | "apple";
  token: string;
  first_name?: string;
  last_name?: string;
}): Promise<WebLoginResponse> {
  const payload = await apiFetch("/auth/web/login/oauth", {
    method: "POST",
    auth: "none",
    headers: { ...webClientHeaders },
    body,
  });
  const parsed = webLoginResponseSchema.safeParse(payload);
  if (!parsed.success) throw new ApiError("We couldn't sign you in.", 400, "oauth_failed", payload);
  return parsed.data;
}

/** User-facing copy for login failures (spec W1.2). */
export function loginErrorMessage(error: unknown): string {
  if (error instanceof RateLimitedError) return "Too many attempts. Please wait a minute.";
  if (error instanceof ApiError) {
    if (error.code === "invalid_otp" || (error.status === 400 && /otp|code/i.test(error.message))) {
      return "That code didn't match. Try again.";
    }
    if (error.code === "invalid_phone" || error.status === 422) return "Enter a valid phone number.";
    return error.message || "Something went wrong. Please try again.";
  }
  if (error instanceof Error && error.message === "cancelled") return "";
  if (error instanceof Error && /not_configured/.test(error.message)) return "This sign-in option isn't available yet. Use your phone number instead.";
  return "Couldn't reach Gamana. Check your connection.";
}

export function loginErrorCode(error: unknown): string {
  if (error instanceof ApiError) return String(error.code ?? error.status);
  if (error instanceof Error) return error.message;
  return "unknown";
}
