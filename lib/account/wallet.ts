import { z } from "zod";
import { apiFetch, ApiError } from "@/lib/api/client";
import { passbookEntrySchema, type PassbookEntry } from "@/lib/api/schemas/coins";

export const PASSBOOK_PAGE_SIZE = 20;

export type PassbookKind = "purchase" | "unlock" | "reward" | "refund" | "promo" | "other";

export type PassbookRow = {
  id: string;
  kind: PassbookKind;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type PassbookPage = { rows: PassbookRow[]; hasNext: boolean };

const pageSchema = z.union([
  z.array(passbookEntrySchema),
  z
    .object({
      data: z.array(passbookEntrySchema).optional(),
      items: z.array(passbookEntrySchema).optional(),
      transactions: z.array(passbookEntrySchema).optional(),
      entries: z.array(passbookEntrySchema).optional(),
      pagination: z
        .object({ total: z.number().nullish(), has_more: z.boolean().nullish() })
        .passthrough()
        .nullish(),
    })
    .passthrough(),
]);

export function passbookKind(entry: Pick<PassbookEntry, "type" | "transaction_type" | "description">): PassbookKind {
  const raw = `${entry.type ?? ""} ${entry.transaction_type ?? ""}`.toLowerCase();
  if (/refund|revers/.test(raw)) return "refund";
  if (/promo|coupon/.test(raw)) return "promo";
  if (IAP_PRODUCT.test(entry.description ?? "")) return "purchase";
  if (/unlock|spend|debit|redemption|redeem_content|purchase_content/.test(raw)) return "unlock";
  if (/reward|bonus|cashback|referral|gift|signup|welcome/.test(raw)) return "reward";
  if (/purchase|iap|buy|topup|top_up|credit/.test(raw)) return "purchase";
  return "other";
}

export function toPassbookRow(entry: PassbookEntry, index: number): PassbookRow {
  const kind = passbookKind(entry);
  const raw = Number(entry.coin_amount ?? entry.amount ?? entry.coins ?? 0);
  const amount = kind === "unlock" && raw > 0 ? -raw : raw;
  const createdAt = entry.timestamp ?? entry.created_at ?? "";
  return {
    id: String(entry.transaction_id ?? entry.id ?? entry._id ?? `${createdAt || "row"}-${index}`),
    kind,
    description: readableDescription(entry.description, kind),
    amount,
    status: (entry.status ?? "completed").toLowerCase(),
    createdAt,
  };
}

/** App store purchases arrive as e.g. "Reward: iap_purchase_gamana_ten_coin". */
const IAP_PRODUCT = /\biap_[a-z0-9_]+/i;
const RAW_ID = /\b[a-z0-9]+(?:_[a-z0-9]+)+\b/i;

function readableDescription(text: string | null | undefined, kind: PassbookKind): string {
  const trimmed = text?.trim() ?? "";
  if (IAP_PRODUCT.test(trimmed)) return "Coins purchased in the app";
  if (/\bstorylist_unlock\b/i.test(trimmed)) return "Unlocked an audio tour";
  if (/\b(place|story)_unlock\b/i.test(trimmed)) return "Unlocked an audio story";
  if (!trimmed || RAW_ID.test(trimmed)) return defaultDescription(kind);
  return trimmed;
}

function defaultDescription(kind: PassbookKind): string {
  switch (kind) {
    case "purchase":
      return "Coins purchased";
    case "unlock":
      return "Unlocked content";
    case "reward":
      return "Reward";
    case "refund":
      return "Refund";
    case "promo":
      return "Promo code";
    default:
      return "Coin activity";
  }
}

/** `GET /passbook?skip&limit` → `{ data: [...], pagination: { total, skip, limit, has_more } }`. */
export function parsePassbookPage(payload: unknown, page: number): PassbookPage {
  const parsed = pageSchema.parse(payload);
  const list = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.items ?? parsed.transactions ?? parsed.entries ?? [];
  const pagination = Array.isArray(parsed) ? null : parsed.pagination;
  const rows = list.map((entry, i) => toPassbookRow(entry, (page - 1) * PASSBOOK_PAGE_SIZE + i));
  const hasNext =
    pagination?.has_more ??
    (typeof pagination?.total === "number" ? page * PASSBOOK_PAGE_SIZE < pagination.total : list.length >= PASSBOOK_PAGE_SIZE);
  return { rows, hasNext };
}

export async function fetchPassbookPage(page: number): Promise<PassbookPage> {
  const payload = await apiFetch<unknown>("/passbook", {
    auth: "required",
    query: { skip: (page - 1) * PASSBOOK_PAGE_SIZE, limit: PASSBOOK_PAGE_SIZE },
    unwrap: false,
  });
  return parsePassbookPage(payload, page);
}

/** Groups rows (already newest-first) under "October 2026"-style month labels. */
export function groupByMonth(rows: PassbookRow[]): { label: string; rows: PassbookRow[] }[] {
  const groups: { label: string; rows: PassbookRow[] }[] = [];
  for (const row of rows) {
    const date = row.createdAt ? new Date(row.createdAt) : null;
    const label =
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Earlier";
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.rows.push(row);
    else groups.push({ label, rows: [row] });
  }
  return groups;
}

/** Resolves with the server's success message; rejects with ApiError (also for `200 { success: false }`). */
export async function redeemPromo(code: string): Promise<string> {
  const res = await apiFetch<Record<string, unknown>>("/coins/redeem-promo", {
    method: "POST",
    auth: "required",
    body: { promo_code: code.trim() },
    unwrap: false,
  });
  const message = typeof res?.message === "string" ? res.message : "";
  if (res?.success === false) throw new ApiError(message || "That promo code isn't valid.", 400, "invalid_promo", res);
  return message;
}
