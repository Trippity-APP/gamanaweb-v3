import { fail, ok, type MockRoute } from "@/lib/api/mock/core";
import { daysFromNow, mockId, resetDb, writeDb } from "@/lib/api/mock/db";

export const MOCK_OTP = "123456";

const SOS: Record<string, { label: string; number: string }[]> = {
  IN: [
    { label: "Police", number: "100" },
    { label: "Ambulance", number: "108" },
    { label: "Fire", number: "101" },
    { label: "Tourist helpline", number: "1363" },
    { label: "All emergencies", number: "112" },
  ],
  US: [{ label: "All emergencies", number: "911" }],
  GB: [{ label: "All emergencies", number: "999" }],
  BR: [
    { label: "Police", number: "190" },
    { label: "Ambulance", number: "192" },
    { label: "Fire", number: "193" },
  ],
  TR: [{ label: "All emergencies", number: "112" }],
};

const MOCK_PACKS = [
  { product_id: "ten_coin", display_name: "Starter", amount: 999, amount_usd: 11.99, currency: "INR", coins: 10, bonus_coins: 0, poi_range: "3–5", tour_range: "1", order: 1, is_active: true, show_on_web: true },
  { product_id: "thirty_coin", display_name: "Explorer", amount: 2499, amount_usd: 29.99, currency: "INR", coins: 30, bonus_coins: 3, poi_range: "10–15", tour_range: "2–3", order: 2, is_active: true, show_on_web: true, is_popular: true },
  { product_id: "hundred_coin", display_name: "Voyager", amount: 6999, amount_usd: 84.99, currency: "INR", coins: 100, bonus_coins: 15, poi_range: "35–50", tour_range: "8–10", order: 3, is_active: true, show_on_web: true, is_best_value: true, save_percent: 30 },
];

type PackLike = {
  product_id: string;
  display_name: string;
  amount: number;
  amount_usd?: number | null;
  coins: number;
  bonus_coins?: number;
};

/** The pricing page shows the real API's packs when it's reachable, so orders must accept those ids too. */
async function realPacks(): Promise<PackLike[]> {
  try {
    const res = await fetch("/api/v1/iap/packages");
    const json = (await res.json()) as { data?: PackLike[] };
    if (res.ok && Array.isArray(json.data)) return [...json.data, ...MOCK_PACKS];
  } catch {
    // Fall through to the mock list.
  }
  return MOCK_PACKS;
}

/** Beta's login `data`: user fields flat next to the tokens. */
function loginResponse() {
  const session = { accessToken: mockId("at"), sessionId: mockId("sess") };
  const db = writeDb((d) => {
    d.session = session;
  });
  const user = db.user ?? {};
  return ok({
    ...user,
    _id: user.id,
    access_token: session.accessToken,
    session_id: session.sessionId,
    expires_in: 900,
    organizations: [],
  });
}

function ensureUser(fields: Record<string, unknown>): boolean {
  let created = false;
  writeDb((d) => {
    if (!d.user) {
      created = true;
      d.user = { id: "mock-user-1", first_name: "", last_name: "", email: "", ...fields };
    }
  });
  return created;
}

export const accountRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/auth/request-otp",
    handle: ({ body }) => {
      const phone = String(body.phone ?? "");
      if (!/^\d{7,15}$/.test(phone)) return fail(422, "invalid_phone", "Enter a valid phone number.");
      return ok({ sent: true }, "OTP sent");
    },
  },
  {
    method: "POST",
    path: "/auth/web/login/otp",
    handle: ({ body }) => {
      if (String(body.otp) !== MOCK_OTP) return ok({ success: false }, "Invalid OTP");
      ensureUser({ phone: String(body.phone ?? ""), country_code: String(body.country_code ?? "+91") });
      return loginResponse();
    },
  },
  {
    method: "POST",
    path: "/auth/web/login/oauth",
    handle: ({ body }) => {
      const provider = String(body.auth_type ?? "google");
      ensureUser({
        first_name: String(body.first_name ?? (provider === "google" ? "Asha" : "")),
        last_name: String(body.last_name ?? ""),
        email: provider === "google" ? "asha.traveller@example.com" : "",
      });
      return loginResponse();
    },
  },
  {
    method: "POST",
    path: "/auth/web/refresh",
    handle: ({ db }) => {
      if (!db.session || !db.user) return fail(401, "no_session", "Not logged in.");
      const session = { accessToken: mockId("at"), sessionId: db.session.sessionId };
      writeDb((d) => {
        d.session = session;
      });
      return ok({ access_token: session.accessToken, session_id: session.sessionId, expires_in: 900 });
    },
  },
  {
    method: "POST",
    path: "/auth/web/logout",
    handle: () => {
      writeDb((d) => {
        d.session = null;
      });
      return ok({});
    },
  },
  { method: "GET", path: "/users/profile", auth: true, handle: ({ db }) => ok(db.user) },
  {
    method: "PATCH",
    path: "/users/profile",
    auth: true,
    handle: ({ body }) => {
      const allowed = ["first_name", "last_name", "email", "dob", "gender"];
      const db = writeDb((d) => {
        for (const key of allowed) if (key in body) (d.user as Record<string, unknown>)[key] = body[key];
      });
      return ok(db.user, "Profile updated");
    },
  },
  {
    method: "PUT",
    path: "/users/profile-pic/:id",
    auth: true,
    handle: async ({ form }) => {
      const file = form?.get("file") ?? form?.get("profile_pic");
      if (!(file instanceof Blob)) return fail(422, "no_file", "Choose a photo.");
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      const db = writeDb((d) => {
        (d.user as Record<string, unknown>).profile_pic = dataUrl;
      });
      return ok(db.user, "Photo updated");
    },
  },
  {
    method: "POST",
    path: "/compliance/gdpr/data-deletion",
    auth: true,
    handle: () => {
      resetDb();
      return ok({ requested: true }, "Account deletion requested");
    },
  },
  { method: "GET", path: "/personalization/", auth: true, handle: ({ db }) => ok(db.personalization) },
  {
    method: "PATCH",
    path: "/personalization/update",
    auth: true,
    handle: ({ body }) => {
      const db = writeDb((d) => {
        d.personalization = { ...d.personalization, ...body };
      });
      return ok(db.personalization, "Preferences saved");
    },
  },
  {
    method: "GET",
    path: "/personalization/catalog",
    fallback: true,
    handle: () =>
      ok({
        languages: [
          { code: "en", label: "English" },
          { code: "hi", label: "Hindi" },
          { code: "es", label: "Spanish" },
          { code: "fr", label: "French" },
          { code: "de", label: "German" },
          { code: "ta", label: "Tamil" },
          { code: "pt", label: "Portuguese" },
        ],
      }),
  },
  {
    method: "GET",
    path: "/voice-personas/mobile/active",
    fallback: true,
    handle: () =>
      ok({
        personas: [
          { id: "arjun", name: "Arjun", description: "Warm storyteller", voice_id: "en-IN-Arjun", persona_image_blob_url: null },
          { id: "meera", name: "Meera", description: "Curious historian", voice_id: "en-IN-Meera", persona_image_blob_url: null },
          { id: "leo", name: "Leo", description: "Upbeat explorer", voice_id: "en-US-Leo", persona_image_blob_url: null },
        ],
      }),
  },
  {
    method: "GET",
    path: "/sos/country/:code",
    fallback: true,
    handle: ({ params }) => {
      const code = params.code.toUpperCase();
      return ok({ countryCode: code, fallback: "112", services: SOS[code] ?? [{ label: "All emergencies", number: "112" }] });
    },
  },
  {
    method: "GET",
    path: "/coins/balance",
    auth: true,
    handle: ({ db }) =>
      ok({ available_balance: String(db.balance), pending_balance: "0", total_balance: String(db.balance) }),
  },
  {
    method: "GET",
    path: "/passbook",
    auth: true,
    handle: ({ db, query }) => {
      const skip = Number(query.get("skip") ?? 0);
      const limit = Number(query.get("limit") ?? 100);
      const sorted = [...db.passbook].sort((a, b) => b.created_at.localeCompare(a.created_at));
      const data = sorted.slice(skip, skip + limit);
      return {
        status: 200,
        body: {
          success: true,
          message: "Passbook retrieved successfully",
          data,
          pagination: { total: sorted.length, skip, limit, has_more: skip + limit < sorted.length },
        },
      };
    },
  },
  {
    method: "POST",
    path: "/coins/redeem-promo",
    auth: true,
    handle: ({ body, db }) => {
      const code = String(body.promo_code ?? body.code ?? "").trim().toUpperCase();
      if (code !== "WELCOME10") return fail(400, "invalid_promo", "That promo code isn't valid.");
      if (db.redeemedPromos.includes(code)) return fail(400, "promo_used", "You've already used this code.");
      writeDb((d) => {
        d.redeemedPromos.push(code);
        d.balance += 10;
        d.passbook.push({ id: mockId("pb"), type: "promo", description: `Promo ${code}`, amount: 10, status: "completed", created_at: daysFromNow(0) });
      });
      return ok({ coins_added: 10 }, "10 coins added");
    },
  },
  {
    method: "GET",
    path: "/iap/packages",
    fallback: true,
    handle: () => ok(MOCK_PACKS),
  },
  {
    method: "POST",
    path: "/payments/razorpay/packs/order",
    auth: true,
    handle: async ({ body }) => {
      const pack = (await realPacks()).find((p) => p.product_id === body.product_id);
      if (!pack) return fail(404, "pack_unavailable", "This coin pack isn't available.");
      const coins = Number(pack.coins) + Number(pack.bonus_coins ?? 0);
      return ok({
        order_id: `order_mock_${coins}_${Date.now()}`,
        amount: Math.round(Number(pack.amount) * 100),
        currency: "INR",
        key_id: "rzp_test_mock",
        product_id: pack.product_id,
        display_name: pack.display_name,
        coins,
      });
    },
  },
  {
    method: "POST",
    path: "/payments/razorpay/packs/verify",
    auth: true,
    handle: ({ body }) => {
      const coins = Number(/^order_mock_(\d+)_/.exec(String(body.razorpay_order_id ?? ""))?.[1] ?? 0);
      if (!coins) return fail(400, "payment_order_mismatch", "Payment not found for this order.");
      const { balance } = writeDb((d) => {
        d.balance += coins;
        d.passbook.push({ id: mockId("pb"), type: "purchase", description: `${coins} Coins (website)`, amount: coins, status: "completed", created_at: daysFromNow(0) });
      });
      return ok({ coins_credited: String(coins), new_balance: String(balance), already_processed: false }, "Coins added");
    },
  },
  {
    method: "POST",
    path: "/payments/stripe/packs/checkout",
    auth: true,
    handle: async ({ body }) => {
      const pack = (await realPacks()).find((p) => p.product_id === body.product_id);
      if (!pack || pack.amount_usd == null) return fail(404, "pack_unavailable", "This coin pack isn't available.");
      const coins = Number(pack.coins) + Number(pack.bonus_coins ?? 0);
      const sessionId = `cs_mock_${coins}_${Date.now()}`;
      return ok({
        session_id: sessionId,
        url: `${window.location.origin}/pricing/?stripe_session=${sessionId}`,
        amount: Math.round(Number(pack.amount_usd) * 100),
        currency: "USD",
        product_id: pack.product_id,
        display_name: pack.display_name,
        coins,
      });
    },
  },
  {
    method: "POST",
    path: "/payments/stripe/packs/verify",
    auth: true,
    handle: ({ body }) => {
      const coins = Number(/^cs_mock_(\d+)_/.exec(String(body.session_id ?? ""))?.[1] ?? 0);
      if (!coins) return fail(404, "session_missing", "Checkout session not found.");
      const { balance } = writeDb((d) => {
        d.balance += coins;
        d.passbook.push({ id: mockId("pb"), type: "purchase", description: `${coins} Coins (website)`, amount: coins, status: "completed", created_at: daysFromNow(0) });
      });
      return ok({ coins_credited: String(coins), new_balance: String(balance), already_processed: false }, "Coins added");
    },
  },
];
