import { z } from "zod";
import { idField, nullish, numberish } from "@/lib/api/schemas/common";

export const coinBalanceSchema = z
  .object({
    available_balance: numberish,
    pending_balance: nullish(numberish),
    total_balance: nullish(numberish),
  })
  .passthrough();

export type CoinBalance = z.infer<typeof coinBalanceSchema>;

/** Coins are displayed as whole numbers only (decision 22). */
export function toCoinCount(balance: CoinBalance): number {
  return Math.floor(balance.available_balance);
}

export const packOrderSchema = z
  .object({
    order_id: z.string().min(1),
    amount: z.number().int().positive(),
    currency: z.string(),
    key_id: z.string().min(1),
    product_id: z.string(),
    display_name: nullish(z.string()),
    coins: numberish,
  })
  .passthrough();

export type PackOrder = z.infer<typeof packOrderSchema>;

export const packVerifySchema = z
  .object({
    coins_credited: numberish,
    new_balance: nullish(numberish),
    already_processed: nullish(z.boolean()),
  })
  .passthrough();

export type PackVerify = z.infer<typeof packVerifySchema>;

export const passbookEntrySchema = z
  .object({
    id: nullish(idField),
    _id: nullish(idField),
    transaction_id: nullish(idField),
    type: nullish(z.string()),
    transaction_type: nullish(z.string()),
    description: nullish(z.string()),
    coin_amount: nullish(numberish),
    amount: nullish(numberish),
    coins: nullish(numberish),
    status: nullish(z.string()),
    timestamp: nullish(z.string()),
    created_at: nullish(z.string()),
  })
  .passthrough();

export type PassbookEntry = z.infer<typeof passbookEntrySchema>;

export const iapPackageSchema = z
  .object({
    id: nullish(idField),
    product_id: z.string(),
    display_name: z.string(),
    description: nullish(z.string()),
    amount: numberish,
    currency: z.string(),
    coins: numberish,
    bonus_coins: nullish(numberish),
    save_percent: nullish(numberish),
    is_best_value: nullish(z.boolean()),
    is_popular: nullish(z.boolean()),
    tag_text: nullish(z.string()),
    poi_range: nullish(z.string()),
    tour_range: nullish(z.string()),
    order: nullish(z.number()),
    is_active: nullish(z.boolean()),
    amount_usd: nullish(numberish),
    show_on_web: nullish(z.boolean()),
    web_badge: nullish(z.string()),
  })
  .passthrough();

export type IapPackage = z.infer<typeof iapPackageSchema>;

export const iapPackageListSchema = z.array(iapPackageSchema);
