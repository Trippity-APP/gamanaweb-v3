import { getApiBaseUrl } from "@/lib/api-base";
import { authHeaders, getStoredAccessToken } from "@/lib/auth-api";

export type UserProfile = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  username?: string | null;
};

export type CoinBalance = {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  status?: string;
};

export type ContentPurchase = {
  purchaseId: string;
  itemId?: string;
  itemName: string;
  purchaseType?: string;
  finalPricePaid?: number;
  purchasedAt?: string;
  narratorName?: string | null;
  source?: "coins" | "pricing" | "unlock";
};

export type CoinPurchaseEntry = {
  transactionId: string;
  transactionType: string;
  status: string;
  coinAmount: number;
  fiatAmount?: number | null;
  fiatCurrency?: string | null;
  description?: string | null;
  timestamp: string;
  balanceAfter?: number | null;
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
  detail?: string;
  success?: boolean;
  items?: unknown[];
  total?: number;
  page?: number;
  pagination?: {
    total?: number;
    skip?: number;
    limit?: number;
    has_more?: boolean;
  };
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/** Format coin amounts from 8-decimal API strings for display. */
export function formatCoins(amount: number): string {
  if (!Number.isFinite(amount)) return "0";
  const rounded = Math.abs(amount - Math.round(amount)) < 1e-6
    ? Math.round(amount)
    : Math.round(amount * 100) / 100;
  return rounded.toLocaleString();
}

function requireToken(accessToken?: string | null): string {
  const token = accessToken ?? getStoredAccessToken();
  if (!token) throw new Error("Please log in to continue.");
  return token;
}

function contactPhone(contact: unknown): string | undefined {
  const record = asRecord(contact);
  if (!record) return undefined;
  return pickString(record.phone, record.mobile, record.primary_phone);
}

async function apiGet(
  path: string,
  token: string
): Promise<{ ok: boolean; status: number; json: ApiEnvelope<unknown> }> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as ApiEnvelope<unknown>;
  return { ok: response.ok, status: response.status, json };
}

function extractError(json: ApiEnvelope<unknown>, fallback: string): string {
  const detail = json.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object") {
    const nested = asRecord(detail);
    const msg = pickString(nested?.message, nested?.detail);
    if (msg) return msg;
  }
  return pickString(json.message) || fallback;
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ["purchases", "items", "entries", "data", "results", "storylists"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function mapContentPurchase(
  item: unknown,
  source: ContentPurchase["source"]
): ContentPurchase | null {
  const row = asRecord(item);
  if (!row) return null;

  const itemName =
    pickString(
      row.item_name,
      row.title,
      row.name,
      row.storylist_name,
      row.place_name
    ) ?? null;
  if (!itemName) return null;

  const purchasedAt =
    pickString(
      row.purchased_at,
      row.access_granted_at,
      row.unlocked_at,
      row.created_at,
      row.timestamp
    ) ?? undefined;

  return {
    purchaseId:
      pickString(row.purchase_id, row.id, row._id, row.item_id, row.storylist_id) ??
      `purchase-${Math.random().toString(36).slice(2)}`,
    itemId: pickString(row.item_id, row.storylist_id, row.place_id),
    itemName,
    purchaseType: pickString(row.purchase_type, row.type) ?? (source === "unlock" ? "unlock" : undefined),
    finalPricePaid: toNumber(
      row.final_price_paid ?? row.final_price ?? row.cost ?? row.coin_amount ?? row.price
    ),
    purchasedAt,
    narratorName: pickString(row.narrator_name) ?? null,
    source,
  };
}

function mapPassbookEntry(item: unknown): CoinPurchaseEntry | null {
  const row = asRecord(item);
  if (!row) return null;

  const transactionType = (
    pickString(row.transaction_type, row.type) ?? "purchase"
  ).toLowerCase();

  const timestamp =
    pickString(row.timestamp, row.completed_at, row.created_at, row.initiated_at) ??
    new Date().toISOString();

  return {
    transactionId:
      pickString(row.transaction_id, row.id, row._id) ??
      `txn-${Math.random().toString(36).slice(2)}`,
    transactionType,
    status: pickString(row.status) ?? "completed",
    coinAmount: toNumber(row.coin_amount) ?? 0,
    fiatAmount: toNumber(row.fiat_amount) ?? null,
    fiatCurrency: pickString(row.fiat_currency) ?? null,
    description: pickString(row.description, row.notes) ?? null,
    timestamp,
    balanceAfter: toNumber(row.balance_after) ?? null,
  };
}

export async function fetchUserProfile(accessToken?: string | null): Promise<UserProfile> {
  const token = requireToken(accessToken);
  const { ok, json } = await apiGet("/users/profile", token);
  if (!ok) {
    throw new Error(extractError(json, "Could not load profile."));
  }

  const payload = asRecord(json.data) ?? {};
  const firstName = pickString(payload.first_name, payload.firstName) ?? null;
  const lastName = pickString(payload.last_name, payload.lastName) ?? null;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    pickString(payload.full_name, payload.fullName) ||
    null;

  return {
    id: pickString(payload._id, payload.id, payload.user_id) ?? "",
    firstName,
    lastName,
    fullName,
    email: pickString(payload.email) ?? null,
    phone: pickString(payload.phone) ?? contactPhone(payload.contact_details) ?? null,
    username: pickString(payload.username) ?? null,
  };
}

export async function updateUserProfile(
  patch: { firstName?: string; lastName?: string; email?: string },
  accessToken?: string | null
): Promise<UserProfile> {
  const token = requireToken(accessToken);
  const body: Record<string, string> = {};
  if (patch.firstName !== undefined) body.first_name = patch.firstName;
  if (patch.lastName !== undefined) body.last_name = patch.lastName;
  if (patch.email !== undefined) body.email = patch.email;

  const response = await fetch(`${getApiBaseUrl()}/users/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as ApiEnvelope<Record<string, unknown>>;
  if (!response.ok) {
    throw new Error(extractError(data, "Could not update profile."));
  }

  const payload = asRecord(data.data) ?? asRecord(data) ?? {};
  if (payload.first_name || payload._id || payload.email) {
    const firstName = pickString(payload.first_name, payload.firstName) ?? null;
    const lastName = pickString(payload.last_name, payload.lastName) ?? null;
    return {
      id: pickString(payload._id, payload.id) ?? "",
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(" ").trim() || null,
      email: pickString(payload.email) ?? null,
      phone: pickString(payload.phone) ?? contactPhone(payload.contact_details) ?? null,
      username: pickString(payload.username) ?? null,
    };
  }

  return fetchUserProfile(token);
}

export async function fetchCoinBalance(accessToken?: string | null): Promise<CoinBalance> {
  const token = requireToken(accessToken);
  const { ok, json } = await apiGet("/coins/balance", token);
  if (!ok) {
    throw new Error(extractError(json, "Could not load coin balance."));
  }

  const payload = asRecord(json.data) ?? {};
  const available = toNumber(payload.available_balance) ?? 0;
  const pending = toNumber(payload.pending_balance) ?? 0;
  const total = toNumber(payload.total_balance) ?? available + pending;

  return {
    availableBalance: available,
    pendingBalance: pending,
    totalBalance: total,
    status: pickString(payload.status),
  };
}

async function fetchCoinsMyPurchases(
  token: string,
  page: number,
  limit: number
): Promise<ContentPurchase[]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const { ok, json } = await apiGet(`/coins/my-purchases?${params}`, token);
  if (!ok) return [];
  return asList(json.data)
    .map((item) => mapContentPurchase(item, "coins"))
    .filter((item): item is ContentPurchase => Boolean(item));
}

async function fetchPricingMyPurchases(
  token: string,
  page: number,
  pageSize: number
): Promise<ContentPurchase[]> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const { ok, json } = await apiGet(`/purchases/my-purchases?${params}`, token);
  if (!ok) return [];
  // Pricing API returns `{ items: [...] }` at the top level (not under data).
  const raw = Array.isArray(json.items) ? json.items : asList(json.data);
  return raw
    .map((item) => mapContentPurchase(item, "pricing"))
    .filter((item): item is ContentPurchase => Boolean(item));
}

async function fetchUnlockedStorylists(token: string): Promise<ContentPurchase[]> {
  const { ok, json } = await apiGet("/map/unlocked/storylists", token);
  if (!ok) return [];
  const raw = asList(json.data);
  return raw
    .map((item) => mapContentPurchase(item, "unlock"))
    .filter((item): item is ContentPurchase => Boolean(item));
}

export async function fetchMyPurchases(
  options: { page?: number; limit?: number; accessToken?: string | null } = {}
): Promise<{ purchases: ContentPurchase[]; total: number; page: number }> {
  const token = requireToken(options.accessToken);
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;

  const [fromCoins, fromPricing, fromUnlocks] = await Promise.all([
    fetchCoinsMyPurchases(token, page, limit),
    fetchPricingMyPurchases(token, page, limit),
    fetchUnlockedStorylists(token),
  ]);

  const merged = [...fromCoins, ...fromPricing, ...fromUnlocks];
  const seen = new Set<string>();
  const purchases: ContentPurchase[] = [];

  for (const purchase of merged) {
    const key = `${purchase.itemId ?? ""}:${purchase.itemName}:${purchase.purchaseId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    purchases.push(purchase);
  }

  purchases.sort((a, b) => {
    const ta = a.purchasedAt ? Date.parse(a.purchasedAt) : 0;
    const tb = b.purchasedAt ? Date.parse(b.purchasedAt) : 0;
    return tb - ta;
  });

  return {
    purchases,
    total: purchases.length,
    page,
  };
}

async function fetchPassbookRaw(
  token: string,
  params: URLSearchParams
): Promise<{ entries: CoinPurchaseEntry[]; total: number; ok: boolean; error?: string }> {
  // Runtime mount is /api/v1/passbook; older docs mentioned /coins/passbook.
  const paths = [`/passbook?${params}`, `/coins/passbook?${params}`];

  for (const path of paths) {
    const { ok, status, json } = await apiGet(path, token);
    if (status === 404) continue;
    if (!ok) {
      return {
        entries: [],
        total: 0,
        ok: false,
        error: extractError(json, "Could not load coin purchase history."),
      };
    }

    const raw = asList(json.data);
    const entries = raw
      .map(mapPassbookEntry)
      .filter((entry): entry is CoinPurchaseEntry => Boolean(entry));

    return {
      entries,
      total: toNumber(json.pagination?.total) ?? entries.length,
      ok: true,
    };
  }

  return { entries: [], total: 0, ok: false, error: "Passbook endpoint not found." };
}

const COIN_CREDIT_TYPES = new Set([
  "purchase",
  "reward",
  "bonus",
  "cashback",
  "system_credit",
  "refund",
]);

export async function fetchCoinPurchaseHistory(
  options: { skip?: number; limit?: number; accessToken?: string | null } = {}
): Promise<{ entries: CoinPurchaseEntry[]; total: number }> {
  const token = requireToken(options.accessToken);
  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const purchaseParams = new URLSearchParams({
    transaction_type: "purchase",
    skip: String(skip),
    limit: String(limit),
  });

  let result = await fetchPassbookRaw(token, purchaseParams);

  // If filtered purchase list is empty, load full passbook and keep credit types.
  if (result.ok && result.entries.length === 0) {
    const allParams = new URLSearchParams({
      skip: String(skip),
      limit: String(Math.max(limit, 100)),
    });
    const all = await fetchPassbookRaw(token, allParams);
    if (all.ok) {
      const credits = all.entries.filter((entry) =>
        COIN_CREDIT_TYPES.has(entry.transactionType)
      );
      // Prefer explicit purchases when present among credits.
      const purchasesOnly = credits.filter((e) => e.transactionType === "purchase");
      result = {
        ok: true,
        entries: purchasesOnly.length > 0 ? purchasesOnly : credits,
        total: purchasesOnly.length > 0 ? purchasesOnly.length : credits.length,
      };
    }
  }

  if (!result.ok) {
    throw new Error(result.error || "Could not load coin purchase history.");
  }

  return {
    entries: result.entries,
    total: result.total,
  };
}
