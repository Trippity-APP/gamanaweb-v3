/**
 * State for the dev-only mock API. Persisted in sessionStorage (`gmn_mock_db`) so a mock login
 * survives reloads and the payment redirect. Only ever used when `NEXT_PUBLIC_API_MOCKS=1`.
 */

export type MockUnlock = {
  id: string;
  kind: "place" | "storylist";
  place_id?: string;
  storylist_id?: string;
  title: string;
  image_url?: string;
  city?: string;
  narrator?: string;
  activation_status: "pending" | "active";
  reserved_until?: string;
  expires_at?: string;
  unlocked_at: string;
};

export type MockPassbookEntry = {
  id: string;
  type: "purchase" | "unlock" | "reward" | "refund" | "promo";
  description: string;
  amount: number;
  status: "completed" | "pending";
  created_at: string;
};

export type MockCheckout = {
  checkout_id: string;
  experience_slug: string;
  experience_id?: string;
  title?: string;
  image_url?: string;
  operator_name?: string;
  currency?: string;
  total?: number;
  local_date: string;
  local_time?: string;
  guests: { unit_id: string; quantity: number }[];
  pickup?: string;
  status: string;
  can_retry_payment?: boolean;
  booking_id?: string;
  return_urls?: { success: string; cancel: string; error: string };
  created_at: string;
};

export type MockBooking = {
  booking_id: string;
  status: "confirmed" | "pending" | "cancelled";
  experience_slug: string;
  experience_id?: string;
  title: string;
  image_url?: string;
  local_date: string;
  local_time?: string;
  travellers: string;
  currency?: string;
  total_price?: number;
  operator_name?: string;
  pickup?: string;
  confirmation_code: string;
  reviewed?: boolean;
  created_at: string;
};

export type MockDb = {
  session: { accessToken: string; sessionId: string } | null;
  user: Record<string, unknown> | null;
  balance: number;
  passbook: MockPassbookEntry[];
  redeemedPromos: string[];
  personalization: Record<string, unknown>;
  wishlist: string[];
  unlocks: MockUnlock[];
  checkouts: Record<string, MockCheckout>;
  bookings: MockBooking[];
};

const KEY = "gmn_mock_db";

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function seed(): MockDb {
  return {
    session: null,
    user: null,
    balance: 25,
    passbook: [
      { id: "pb-1", type: "purchase", description: "Bought 10 coins in the app", amount: 10, status: "completed", created_at: daysFromNow(-40) },
      { id: "pb-2", type: "reward", description: "Welcome bonus", amount: 20, status: "completed", created_at: daysFromNow(-39) },
      { id: "pb-3", type: "unlock", description: "Unlocked Amber Fort", amount: -5, status: "completed", created_at: daysFromNow(-12) },
    ],
    redeemedPromos: [],
    personalization: {
      narrators: { languages: { codes: ["en"] }, voice_persona_id: null },
      notifications: { push: true, email: true, sms: false },
      travel_profile: {},
    },
    wishlist: [],
    unlocks: [
      {
        id: "ul-seed-1",
        kind: "place",
        place_id: "seed-amber-fort",
        title: "Amber Fort",
        city: "Jaipur",
        narrator: "Arjun",
        activation_status: "active",
        expires_at: daysFromNow(4),
        unlocked_at: daysFromNow(-26),
      },
    ],
    checkouts: {},
    bookings: [
      {
        booking_id: "bk-seed-past",
        status: "confirmed",
        experience_slug: "alter-do-chao-tour",
        title: "Alter do Chao Tour",
        local_date: daysFromNow(-9).slice(0, 10),
        local_time: "08:00",
        travellers: "2 Adults",
        currency: "USD",
        total_price: 180,
        operator_name: "Amazing Tours Agency",
        confirmation_code: "GMN-48213",
        created_at: daysFromNow(-20),
      },
    ],
  };
}

let cache: MockDb | null = null;

export function readDb(): MockDb {
  if (cache) return cache;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    cache = raw ? ({ ...seed(), ...JSON.parse(raw) } as MockDb) : seed();
  } catch {
    cache = seed();
  }
  return cache;
}

export function writeDb(mutate: (db: MockDb) => void): MockDb {
  const db = readDb();
  mutate(db);
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // Quota or disabled storage: keep the in-memory copy.
  }
  return db;
}

export function resetDb() {
  cache = seed();
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function mockId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export { daysFromNow };
