import {
  fail,
  ok,
  realExperience,
  travellersText,
  unitLabel,
  unitPrice,
  type MockCtx,
  type MockRoute,
} from "@/lib/api/mock/core";
import { daysFromNow, mockId, writeDb, type MockBooking, type MockCheckout, type MockUnlock } from "@/lib/api/mock/db";

type Guests = { unit_id: string; quantity: number }[];

function guestsOf(body: Record<string, unknown>): Guests {
  const list = (body.guests as Guests | undefined) ?? [];
  return list.map((g) => ({ unit_id: String(g.unit_id), quantity: Number(g.quantity) || 0 })).filter((g) => g.quantity > 0);
}

function isoDays(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (d <= last && out.length < 120) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Mondays are "sold out" so the sold-out path can be exercised. */
function dayOpen(iso: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return iso >= today && new Date(`${iso}T00:00:00`).getDay() !== 1;
}

async function slotsFor(ctx: MockCtx, date: string) {
  const experience = await realExperience(ctx.params.slug);
  const guests = guestsOf(ctx.body);
  const currency = String(experience?.currency ?? "USD");
  const total = guests.reduce((sum, g) => sum + unitPrice(experience, g.unit_id) * g.quantity, 0) || Number(experience?.from_price ?? 50);
  if (!dayOpen(date)) return [];
  return [
    { time: "09:00", vacancies: 12 },
    { time: "14:30", vacancies: 3 },
  ].map((s) => ({
    id: `${date}T${s.time}`,
    localDate: date,
    localDateTimeStart: `${date}T${s.time}:00`,
    available: true,
    status: s.vacancies < 5 ? "LIMITED" : "AVAILABLE",
    vacancies: s.vacancies,
    pricing: { retail_major: Math.round(total * 100) / 100, currency },
  }));
}

async function orderSummary(slug: string, body: Record<string, unknown>) {
  const experience = await realExperience(slug);
  const currency = String(experience?.currency ?? "USD");
  const line_items = guestsOf(body).map((g) => {
    const unit = unitPrice(experience, g.unit_id);
    return { unit_id: g.unit_id, label: unitLabel(experience, g.unit_id), quantity: g.quantity, unit_price: unit, total: Math.round(unit * g.quantity * 100) / 100, currency };
  });
  const total = Math.round(line_items.reduce((s, l) => s + l.total, 0) * 100) / 100;
  return {
    selection: { local_date: body.local_date, local_time: body.local_time ?? null, slot_id: body.local_time ? `${body.local_date}T${body.local_time}` : null },
    pricing: { currency, total, line_items, all_taxes_and_fees_included: true },
    checkout: { mode: "bokun_cart" },
  };
}

const PICKUP_PLACES = [
  { id: "pp-1", title: "Hotel Grand Palace", address: "12 Station Road" },
  { id: "pp-2", title: "Riverside Inn", address: "4 Lake View Street" },
  { id: "pp-3", title: "City Centre Hostel", address: "88 Market Square" },
  { id: "pp-4", title: "Heritage Haveli Resort", address: "Old Town Gate" },
];

/** Bókun-style questions, so the web normalizer is exercised the same way as real data. */
const BOOKING_QUESTIONS = {
  main_contact: [
    { questionId: "firstName", label: "First name", dataType: "SHORT_TEXT", required: true },
    { questionId: "lastName", label: "Last name", dataType: "SHORT_TEXT", required: true },
    { questionId: "email", label: "Email", dataType: "EMAIL", required: true },
    { questionId: "phoneNumber", label: "Phone", dataType: "PHONE_NUMBER", required: true },
  ],
  per_booking: [
    {
      questionId: "dietary",
      label: "Dietary requirements",
      dataType: "OPTIONS",
      required: true,
      selectFromOptions: true,
      answerOptions: [
        { value: "none", label: "None" },
        { value: "vegetarian", label: "Vegetarian" },
        { value: "vegan", label: "Vegan" },
        { value: "other", label: "Other" },
      ],
    },
    {
      questionId: "dietary_other",
      label: "Tell us more about your dietary needs",
      dataType: "LONG_TEXT",
      required: true,
      maxLength: 300,
      trigger: { questionId: "dietary", value: "other" },
    },
    { questionId: "arrival_flight", label: "Arrival flight number", dataType: "SHORT_TEXT", required: false, helpText: "Only if you're arriving by air", pattern: "^[A-Za-z0-9 ]{2,8}$" },
    { questionId: "arrival_time", label: "Arrival time", dataType: "TIME", required: false },
    { questionId: "special", label: "Special requirements", dataType: "LONG_TEXT", required: false, maxLength: 500 },
    { questionId: "accessibility", label: "Someone in the group uses a wheelchair", dataType: "CHECKBOX_TOGGLE", required: false },
  ],
  per_passenger: [
    { questionId: "fullName", label: "Full name", dataType: "SHORT_TEXT", required: true },
    { questionId: "dob", label: "Date of birth", dataType: "DATE", required: false },
    { questionId: "weight", label: "Weight", dataType: "INT", required: false, unit: "kg", min: 10, max: 200 },
  ],
};

export function bookingFromCheckout(c: MockCheckout, experience: Record<string, unknown> | null): MockBooking {
  return {
    booking_id: mockId("bk"),
    status: "confirmed",
    experience_slug: c.experience_slug,
    experience_id: c.experience_id,
    title: c.title ?? String(experience?.title ?? "Experience"),
    image_url: c.image_url,
    local_date: c.local_date,
    local_time: c.local_time,
    travellers: travellersText(experience, c.guests),
    currency: c.currency,
    total_price: c.total,
    operator_name: c.operator_name,
    pickup: c.pickup,
    confirmation_code: `GMN-${Math.floor(10000 + Math.random() * 89999)}`,
    created_at: daysFromNow(0),
  };
}

function briefOf(b: MockBooking, experience: Record<string, unknown> | null) {
  const policies = experience?.booking_policies as Record<string, Record<string, unknown>> | undefined;
  return {
    ...b,
    id: b.booking_id,
    meeting_point: experience?.meeting_point_text ?? experience?.meeting_point_address ?? null,
    meeting_point_address: experience?.meeting_point_address ?? null,
    latitude: experience?.latitude ?? null,
    longitude: experience?.longitude ?? null,
    what_to_bring: experience?.what_to_bring ?? [],
    cancellation_policy: policies?.cancellation_policy?.text ?? experience?.cancellation_policy ?? null,
    refund_text: policies?.refund_processing?.text ?? null,
    is_cancellable: b.status === "confirmed" && b.local_date >= new Date().toISOString().slice(0, 10),
    image_url: b.image_url ?? experience?.hero_image_url ?? null,
    operator: { name: b.operator_name ?? experience?.operator_name ?? null, phone: "+91 98765 43210", email: "bookings@operator.example" },
  };
}

function unlockFromRequest(ctx: MockCtx, kind: "place" | "storylist"): MockUnlock {
  let meta: Record<string, string> = {};
  try {
    meta = JSON.parse(decodeURIComponent(ctx.headers.get("X-Mock-Meta") ?? "")) as Record<string, string>;
  } catch {
    meta = {};
  }
  const id = String(kind === "place" ? ctx.body.place_id : ctx.body.storylist_id);
  return {
    id: mockId("ul"),
    kind,
    place_id: kind === "place" ? id : undefined,
    storylist_id: kind === "storylist" ? id : undefined,
    title: meta.title ?? "Audio story",
    image_url: meta.image,
    city: meta.city,
    narrator: meta.narrator,
    activation_status: "pending",
    reserved_until: daysFromNow(90),
    unlocked_at: daysFromNow(0),
  };
}

function unlock(ctx: MockCtx, kind: "place" | "storylist") {
  const price = Math.round(Number(ctx.body.coin_amount ?? ctx.headers.get("X-Mock-Price") ?? 0));
  const entry = unlockFromRequest(ctx, kind);
  const target = entry.place_id ?? entry.storylist_id;
  if (ctx.db.unlocks.some((u) => (u.place_id ?? u.storylist_id) === target)) {
    return fail(409, "already_unlocked", "You've already unlocked this.");
  }
  if (ctx.db.balance < price) {
    return fail(402, "insufficient_coins", "Not enough coins.", { required: price, available: ctx.db.balance });
  }
  const db = writeDb((d) => {
    d.balance -= price;
    d.unlocks.unshift(entry);
    d.passbook.push({ id: mockId("pb"), type: "unlock", description: `Unlocked ${entry.title}`, amount: -price, status: "completed", created_at: daysFromNow(0) });
  });
  return ok({ unlock: entry, balance: db.balance, handoff: { push_sent: true, device_count: 1 } }, "Unlocked");
}

export const commerceRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/experiences/:slug/availability/calendar",
    fallback: true,
    handle: ({ body }) => ({
      status: 200,
      body: {
        calendar: isoDays(String(body.local_date_start), String(body.local_date_end)).map((d) => ({
          localDate: d,
          available: dayOpen(d),
          status: dayOpen(d) ? "AVAILABLE" : "SOLD_OUT",
          vacancies: dayOpen(d) ? 12 : 0,
        })),
      },
    }),
  },
  {
    method: "POST",
    path: "/experiences/:slug/availability",
    fallback: true,
    handle: async (ctx) => {
      const slots = await slotsFor(ctx, String(ctx.body.local_date));
      if (!slots.length) return fail(422, "no_availability", "No availability on this date.");
      return ok({ local_date: ctx.body.local_date, slots });
    },
  },
  {
    method: "POST",
    path: "/experiences/:slug/availability/range",
    fallback: true,
    handle: async (ctx) => {
      const days = isoDays(String(ctx.body.local_date_start), String(ctx.body.local_date_end)).filter(dayOpen);
      const slots = (await Promise.all(days.slice(0, 3).map((d) => slotsFor(ctx, d)))).flat();
      return { status: 200, body: { dates_with_slots: days, slots } };
    },
  },
  {
    method: "POST",
    path: "/experiences/:slug/order-summary",
    fallback: true,
    handle: async ({ params, body }) => ({ status: 200, body: await orderSummary(params.slug, body) }),
  },
  { method: "GET", path: "/experiences/:slug/pickup-places", fallback: true, handle: () => ok({ pickup_places: PICKUP_PLACES }) },
  { method: "GET", path: "/experiences/:slug/booking-questions", fallback: true, handle: () => ok(BOOKING_QUESTIONS) },
  {
    method: "GET",
    path: "/experiences/review-tags",
    fallback: true,
    handle: () => ({
      status: 200,
      body: {
        success: true,
        tags: ["Guide was great", "Great value", "Culturally insightful", "Well organised", "Would go again"].map((label) => ({
          id: label.toLowerCase().replace(/\s+/g, "_"),
          label,
        })),
      },
    }),
  },
  {
    method: "POST",
    path: "/experiences/:slug/checkout/start",
    auth: true,
    handle: async ({ params, body }) => {
      const experience = await realExperience(params.slug);
      const summary = await orderSummary(params.slug, body);
      const id = mockId("co");
      writeDb((d) => {
        d.checkouts[id] = {
          checkout_id: id,
          experience_slug: params.slug,
          experience_id: experience?.id ? String(experience.id) : undefined,
          title: experience?.title ? String(experience.title) : undefined,
          image_url: experience?.hero_image_url ? String(experience.hero_image_url) : undefined,
          operator_name: experience?.operator_name ? String(experience.operator_name) : undefined,
          currency: summary.pricing.currency,
          total: summary.pricing.total,
          local_date: String(body.local_date),
          local_time: body.local_time ? String(body.local_time) : undefined,
          guests: guestsOf(body),
          pickup: body.pickup_description ? String(body.pickup_description) : body.pickup_place_id ? PICKUP_PLACES.find((p) => p.id === body.pickup_place_id)?.title : undefined,
          status: "started",
          created_at: daysFromNow(0),
        };
      });
      return ok({ checkout_id: id, status: "started" });
    },
  },
  {
    method: "GET",
    path: "/experiences/checkout/:id/options",
    auth: true,
    handle: ({ params, db, query }) => {
      const c = db.checkouts[params.id];
      if (!c) return fail(404, "checkout_not_found", "Checkout not found.");
      writeDb((d) => {
        d.checkouts[params.id].status = "options_ready";
      });
      return ok({
        checkout_id: c.checkout_id,
        currency: query.get("currency") ?? c.currency,
        preferred_payment: { uti: "mock-uti", checkout_option_type: "CUSTOMER_FULL_PAYMENT", payment_method: "CARD" },
        booking_questions: BOOKING_QUESTIONS,
        booking_id: `act-${c.checkout_id}`,
      });
    },
  },
  {
    method: "POST",
    path: "/experiences/checkout/:id/confirm",
    auth: true,
    handle: ({ params, body, db }) => {
      const c = db.checkouts[params.id];
      if (!c) return fail(404, "checkout_not_found", "Checkout not found.");
      if (!body.contact_email || !body.contact_name) return fail(422, "validation_error", "Contact details are required.", { fields: { contact_email: "Required" } });
      writeDb((d) => {
        d.checkouts[params.id].status = "pending_mock_pay";
        d.checkouts[params.id].return_urls = {
          success: String(body.success_url),
          cancel: String(body.cancel_url),
          error: String(body.error_url),
        };
      });
      return ok({ redirect_url: `/dev/mock-pay/?checkout_id=${encodeURIComponent(params.id)}`, status: "pending_mock_pay" });
    },
  },
  {
    method: "GET",
    path: "/experiences/checkout/:id",
    auth: true,
    handle: ({ params, db }) => {
      const c = db.checkouts[params.id];
      if (!c) return fail(404, "checkout_not_found", "Checkout not found.");
      return ok({
        checkout_id: c.checkout_id,
        status: c.status,
        can_retry_payment: c.can_retry_payment ?? false,
        booking_id: c.booking_id ?? null,
        payment_failure: c.status === "payment_failed" ? { user_message: "Your card was declined by the bank." } : null,
      });
    },
  },
  {
    method: "POST",
    path: "/experiences/checkout/:id/retry-payment",
    auth: true,
    handle: ({ params, db }) => {
      if (!db.checkouts[params.id]) return fail(404, "checkout_not_found", "Checkout not found.");
      writeDb((d) => {
        d.checkouts[params.id].status = "pending_mock_pay";
      });
      return ok({ redirect_url: `/dev/mock-pay/?checkout_id=${encodeURIComponent(params.id)}` });
    },
  },
  {
    method: "GET",
    path: "/my/bookings",
    auth: true,
    handle: ({ db }) => ok({ items: db.bookings.map((b) => ({ ...b, id: b.booking_id })) }),
  },
  {
    method: "GET",
    path: "/my/bookings/:id/brief",
    auth: true,
    handle: async ({ params, db }) => {
      const b = db.bookings.find((x) => x.booking_id === params.id);
      if (!b) return fail(404, "booking_not_found", "Booking not found.");
      return ok(briefOf(b, await realExperience(b.experience_slug)));
    },
  },
  {
    method: "GET",
    path: "/my/bookings/:id",
    auth: true,
    handle: async ({ params, db }) => {
      const b = db.bookings.find((x) => x.booking_id === params.id);
      if (!b) return fail(404, "booking_not_found", "Booking not found.");
      return ok(briefOf(b, await realExperience(b.experience_slug)));
    },
  },
  {
    method: "POST",
    path: "/my/bookings/:id/cancel",
    auth: true,
    handle: ({ params, db }) => {
      const b = db.bookings.find((x) => x.booking_id === params.id);
      if (!b) return fail(404, "booking_not_found", "Booking not found.");
      writeDb((d) => {
        const target = d.bookings.find((x) => x.booking_id === params.id);
        if (target) target.status = "cancelled";
      });
      return ok({ status: "cancelled" }, "Booking cancelled");
    },
  },
  {
    method: "GET",
    path: "/my/reviewable",
    auth: true,
    handle: ({ db }) => {
      const today = new Date().toISOString().slice(0, 10);
      return ok({
        items: db.bookings
          .filter((b) => b.status === "confirmed" && b.local_date < today && !b.reviewed)
          .map((b) => ({ id: `rv-${b.booking_id}`, booking_id: b.booking_id, experience_slug: b.experience_slug, title: b.title })),
      });
    },
  },
  {
    method: "POST",
    path: "/my/reviewable/:id/action",
    auth: true,
    handle: ({ params }) => {
      const bookingId = params.id.replace(/^rv-/, "");
      writeDb((d) => {
        const b = d.bookings.find((x) => x.booking_id === bookingId);
        if (b) b.reviewed = true;
      });
      return ok({});
    },
  },
  {
    method: "POST",
    path: "/experiences/:slug/reviews/photos",
    auth: true,
    handle: () => ({ status: 200, body: { success: true, blob_name: `mock-review-photo-${Date.now()}.jpg` } }),
  },
  {
    method: "POST",
    path: "/experiences/:slug/reviews",
    auth: true,
    handle: ({ body, params }) => {
      const rating = Number(body.rating);
      if (!(rating >= 1 && rating <= 5)) return fail(422, "validation_error", "Choose a rating.");
      writeDb((d) => {
        for (const b of d.bookings) if (b.experience_slug === params.slug) b.reviewed = true;
      });
      return { status: 200, body: { success: true, review: { id: mockId("rev"), rating } } };
    },
  },
  {
    method: "GET",
    path: "/users/me/wishlists/experiences",
    auth: true,
    handle: async ({ db }) => {
      const items = (await Promise.all(db.wishlist.map((ref) => realExperience(ref)))).filter(Boolean);
      return ok({ items });
    },
  },
  {
    method: "POST",
    path: "/users/me/wishlists/experiences/:ref",
    auth: true,
    handle: ({ params }) => {
      writeDb((d) => {
        if (!d.wishlist.includes(params.ref)) d.wishlist.unshift(params.ref);
      });
      return ok({ saved: true });
    },
  },
  {
    method: "DELETE",
    path: "/users/me/wishlists/experiences/:ref",
    auth: true,
    handle: ({ params }) => {
      writeDb((d) => {
        d.wishlist = d.wishlist.filter((r) => r !== params.ref);
      });
      return ok({ saved: false });
    },
  },
  { method: "POST", path: "/map/unlock", auth: true, handle: (ctx) => unlock(ctx, "place") },
  { method: "POST", path: "/map/unlock/storylist", auth: true, handle: (ctx) => unlock(ctx, "storylist") },
  {
    method: "GET",
    version: "v2",
    path: "/library/unlocks",
    auth: true,
    handle: ({ db }) =>
      ok({
        places: db.unlocks.filter((u) => u.kind === "place"),
        storylists: db.unlocks.filter((u) => u.kind === "storylist"),
      }),
  },
  {
    method: "GET",
    version: "v2",
    path: "/tours/mine",
    auth: true,
    handle: () => ok([]),
  },
  {
    method: "GET",
    version: "v2",
    path: "/tours/recommended",
    auth: true,
    // Empty on purpose: the home shelf then falls back to the live public catalog.
    handle: () => ok({ items: [] }),
  },
  {
    method: "GET",
    path: "/storylists/my-storylists",
    auth: true,
    handle: () => ok({ items: [{ id: "my-tour-1", title: "My weekend in Jaipur", stops_count: 6, city: "Jaipur", updated_at: daysFromNow(-3) }] }),
  },
  {
    method: "POST",
    path: "/me/handoff/:kind/:id",
    auth: true,
    handle: () => ok({ handoff: { push_sent: true, device_count: 1 } }, "Sent to your phone"),
  },
];
