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
      items: z.array(passbookEntrySchema).optional(),
      transactions: z.array(passbookEntrySchema).optional(),
      entries: z.array(passbookEntrySchema).optional(),
      has_next: z.boolean().nullish(),
      total: z.number().nullish(),
    })
    .passthrough(),
]);

export function passbookKind(entry: Pick<PassbookEntry, "type" | "transaction_type" | "description">): PassbookKind {
  const raw = `${entry.type ?? ""} ${entry.transaction_type ?? ""}`.toLowerCase();
  if (/refund|revers/.test(raw)) return "refund";
  if (/promo|coupon/.test(raw)) return "promo";
  if (/unlock|spend|debit|redeem_content|purchase_content/.test(raw)) return "unlock";
  if (/reward|bonus|referral|gift|signup|welcome/.test(raw)) return "reward";
  if (/purchase|iap|buy|topup|top_up|credit/.test(raw)) return "purchase";
  return "other";
}

export function toPassbookRow(entry: PassbookEntry, index: number): PassbookRow {
  const kind = passbookKind(entry);
  const raw = Number(entry.amount ?? entry.coins ?? 0);
  const amount = kind === "unlock" && raw > 0 ? -raw : raw;
  return {
    id: String(entry.id ?? entry._id ?? `${entry.created_at ?? "row"}-${index}`),
    kind,
    description: entry.description?.trim() || defaultDescription(kind),
    amount,
    status: (entry.status ?? "completed").toLowerCase(),
    createdAt: entry.created_at ?? "",
  };
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

export async function fetchPassbookPage(page: number): Promise<PassbookPage> {
  const data = await apiFetch("/passbook", {
    auth: "required",
    query: { page, page_size: PASSBOOK_PAGE_SIZE },
    schema: pageSchema,
  });
  const list = Array.isArray(data) ? data : data.items ?? data.transactions ?? data.entries ?? [];
  const rows = list.map(toPassbookRow);
  const hasNext = Array.isArray(data)
    ? list.length >= PASSBOOK_PAGE_SIZE
    : data.has_next ?? (typeof data.total === "number" ? page * PASSBOOK_PAGE_SIZE < data.total : list.length >= PASSBOOK_PAGE_SIZE);
  return { rows, hasNext };
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
