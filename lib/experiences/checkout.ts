import { z } from "zod";
import { apiFetch, ApiError } from "@/lib/api/client";
import { checkoutStateSchema, type CheckoutState } from "@/lib/api/schemas/bookings";
import { idField, nullish } from "@/lib/api/schemas/common";
import type { GuestSelection } from "@/lib/experiences/api";

const STORAGE_PREFIX = "gmn_checkout:";

export type CheckoutSelection = {
  slug: string;
  date: string;
  time: string | null;
  slot: string | null;
  guests: GuestSelection[];
  /** The raw `g` param, e.g. `unitA:2,unitB:1`. */
  guestKey: string;
};

export function parseCheckoutQuery(search: string): CheckoutSelection | null {
  const params = new URLSearchParams(search);
  const slug = params.get("exp");
  const date = params.get("date");
  const guestKey = params.get("g") ?? "";
  if (!slug || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const guests = guestKey
    .split(",")
    .map((part) => part.split(":"))
    .map(([unit_id, qty]) => ({ unit_id, quantity: Number(qty) }))
    .filter((g) => g.unit_id && Number.isInteger(g.quantity) && g.quantity > 0);
  if (guests.length === 0) return null;
  return { slug, date, time: params.get("time"), slot: params.get("slot"), guests, guestKey };
}

/** Back to the detail page with the availability card restored. */
export function detailHrefFor(sel: Pick<CheckoutSelection, "slug" | "date" | "time" | "guestKey">): string {
  const params = new URLSearchParams({ date: sel.date, g: sel.guestKey });
  if (sel.time) params.set("time", sel.time);
  return `/experiences/${encodeURIComponent(sel.slug)}/?${params.toString()}`;
}

type StoredCheckout = { checkout_id: string; key: string };

function selectionKey(sel: CheckoutSelection, pickupKey: string): string {
  return [sel.date, sel.time ?? "", sel.guestKey, pickupKey].join("|");
}

export function readStoredCheckout(sel: CheckoutSelection, pickupKey: string): string | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + sel.slug);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredCheckout;
    return stored.key === selectionKey(sel, pickupKey) ? stored.checkout_id : null;
  } catch {
    return null;
  }
}

export function storeCheckout(sel: CheckoutSelection, pickupKey: string, checkoutId: string): void {
  try {
    const value: StoredCheckout = { checkout_id: checkoutId, key: selectionKey(sel, pickupKey) };
    window.sessionStorage.setItem(STORAGE_PREFIX + sel.slug, JSON.stringify(value));
  } catch {
    // Private mode: the checkout simply restarts on reload.
  }
}

export function clearStoredCheckout(slug: string): void {
  try {
    window.sessionStorage.removeItem(STORAGE_PREFIX + slug);
  } catch {
    // Ignore.
  }
}

export const pickupPlaceSchema = z
  .object({
    id: idField,
    title: nullish(z.string()),
    name: nullish(z.string()),
    address: nullish(z.string()),
  })
  .passthrough();

export type PickupPlace = z.infer<typeof pickupPlaceSchema>;

const pickupListSchema = z
  .union([
    z.array(pickupPlaceSchema),
    z.object({ pickup_places: z.array(pickupPlaceSchema) }).passthrough(),
    z.object({ items: z.array(pickupPlaceSchema) }).passthrough(),
  ])
  .transform((v): PickupPlace[] => {
    if (Array.isArray(v)) return v;
    return ((v as { pickup_places?: PickupPlace[] }).pickup_places ?? (v as { items?: PickupPlace[] }).items ?? []);
  });

export function getPickupPlaces(slug: string): Promise<PickupPlace[]> {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/pickup-places`, { auth: "optional", schema: pickupListSchema });
}

export function getBookingQuestions(slug: string): Promise<unknown> {
  return apiFetch(`/experiences/${encodeURIComponent(slug)}/booking-questions`, { auth: "optional" });
}

export type StartCheckoutBody = {
  local_date: string;
  local_time?: string;
  slot_id?: string;
  guests: GuestSelection[];
  pickup_place_id?: string;
  pickup_description?: string;
  pickup_room_number?: string;
};

const startSchema = z.object({ checkout_id: idField }).passthrough();

export async function startCheckout(slug: string, body: StartCheckoutBody): Promise<string> {
  const res = await apiFetch(`/experiences/${encodeURIComponent(slug)}/checkout/start`, {
    method: "POST",
    auth: "required",
    body,
    schema: startSchema,
  });
  return String(res.checkout_id);
}

export const checkoutOptionsSchema = z
  .object({
    checkout_id: nullish(idField),
    currency: nullish(z.string()),
    booking_id: nullish(idField),
    preferred_payment: z
      .object({
        uti: nullish(z.string()),
        checkout_option_type: nullish(z.string()),
        payment_method: nullish(z.string()),
      })
      .passthrough()
      .nullish(),
    booking_questions: z.unknown().optional(),
  })
  .passthrough();

export type CheckoutOptions = z.infer<typeof checkoutOptionsSchema>;

export function getCheckoutOptions(checkoutId: string, currency: string | null | undefined): Promise<CheckoutOptions> {
  return apiFetch(`/experiences/checkout/${encodeURIComponent(checkoutId)}/options`, {
    auth: "required",
    query: { currency: currency ?? undefined },
    schema: checkoutOptionsSchema,
  });
}

const redirectSchema = z.object({ redirect_url: z.string() }).passthrough();

export async function confirmCheckout(checkoutId: string, body: Record<string, unknown>): Promise<string> {
  const res = await apiFetch(`/experiences/checkout/${encodeURIComponent(checkoutId)}/confirm`, {
    method: "POST",
    auth: "required",
    body,
    schema: redirectSchema,
  });
  return res.redirect_url;
}

export function getCheckoutState(checkoutId: string, signal?: AbortSignal): Promise<CheckoutState> {
  return apiFetch(`/experiences/checkout/${encodeURIComponent(checkoutId)}`, {
    auth: "required",
    schema: checkoutStateSchema,
    signal,
  });
}

export async function retryPayment(checkoutId: string): Promise<string> {
  const res = await apiFetch(`/experiences/checkout/${encodeURIComponent(checkoutId)}/retry-payment`, {
    method: "POST",
    auth: "required",
    schema: redirectSchema,
  });
  return res.redirect_url;
}

/** `code` from either the top level or `error.detail.code`. */
export function checkoutErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const details = error.details as Record<string, unknown> | null;
  const nested = details?.error as Record<string, unknown> | undefined;
  const detail = nested?.detail as Record<string, unknown> | undefined;
  const code = detail?.code ?? nested?.code ?? details?.code ?? error.code;
  return typeof code === "string" ? code : null;
}

/** Field errors from a 422, keyed by request field (`contact_email`, …). */
export function checkoutFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const details = error.details as Record<string, unknown> | null;
  const fields = (details?.fields ?? (details?.error as Record<string, unknown> | undefined)?.fields) as unknown;
  if (fields && typeof fields === "object" && !Array.isArray(fields)) {
    return Object.fromEntries(Object.entries(fields as Record<string, unknown>).map(([k, v]) => [k, String(v)]));
  }
  const detail = details?.detail;
  if (Array.isArray(detail)) {
    return Object.fromEntries(
      detail
        .filter((d): d is { loc: unknown[]; msg: string } => !!d && Array.isArray((d as { loc?: unknown }).loc))
        .map((d) => [String(d.loc[d.loc.length - 1]), d.msg]),
    );
  }
  return {};
}

export const SITE_ORIGIN = (): string => window.location.origin;

export function returnUrls(checkoutId: string, slug: string) {
  const base = `${SITE_ORIGIN()}/experiences/checkout/return/?checkout_id=${encodeURIComponent(checkoutId)}&exp=${encodeURIComponent(slug)}`;
  return {
    success_url: `${base}&status=success`,
    cancel_url: `${base}&status=cancel`,
    error_url: `${base}&status=error`,
  };
}
