import { apiFetch } from "@/lib/api/client";
import { packVerifySchema, stripeCheckoutSchema, type PackVerify, type StripeCheckout } from "@/lib/api/schemas/coins";
import { apiMocksEnabled } from "@/lib/flags";

/** Stripe sends buyers back to /pricing with these query params (set by the backend). */
export const STRIPE_SESSION_PARAM = "stripe_session";
export const STRIPE_CANCELLED_PARAM = "stripe_cancelled";

const SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{1,250}$/;

export function isStripeSessionId(value: string | null): value is string {
  return value != null && SESSION_ID_PATTERN.test(value);
}

export function createStripeCheckout(productId: string): Promise<StripeCheckout> {
  return apiFetch("/payments/stripe/packs/checkout", {
    method: "POST",
    auth: "required",
    body: { product_id: productId },
    schema: stripeCheckoutSchema,
  });
}

export function verifyStripeSession(sessionId: string): Promise<PackVerify> {
  return apiFetch("/payments/stripe/packs/verify", {
    method: "POST",
    auth: "required",
    body: { session_id: sessionId },
    schema: packVerifySchema,
  });
}

/** Leaves the site for Stripe's hosted page (the URL comes from our backend; custom checkout domains are allowed). */
export function redirectToStripe(checkout: StripeCheckout): void {
  const url = new URL(checkout.url, window.location.origin);
  const allowed = url.protocol === "https:" || (apiMocksEnabled && url.origin === window.location.origin);
  if (!allowed) throw new Error("Unexpected checkout address");
  window.location.assign(url.toString());
}
