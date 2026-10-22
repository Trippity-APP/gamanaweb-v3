import { apiFetch } from "@/lib/api/client";
import { iapPackageListSchema, type IapPackage } from "@/lib/api/schemas/coins";
import snapshot from "@/lib/data/pricing-snapshot.json";

export type WebPack = {
  id: string;
  name: string;
  description: string;
  coins: number;
  bonusCoins: number;
  amountInr: number;
  amountUsd: number | null;
  poiRange: string | null;
  tourRange: string | null;
  badge: string | null;
  highlighted: boolean;
};

export function packBadge(p: Pick<IapPackage, "web_badge" | "tag_text" | "is_popular" | "is_best_value">): string | null {
  return p.web_badge || p.tag_text || (p.is_popular ? "Most popular" : p.is_best_value ? "Best value" : null);
}

/** Active, web-visible packs sorted by `order`. Identical packs listed under several store SKUs are shown once. */
export function toWebPacks(raw: IapPackage[]): WebPack[] {
  const seen = new Set<string>();
  return raw
    .filter((p) => p.is_active !== false && p.show_on_web !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((p) => {
      const key = `${p.coins}|${p.bonus_coins ?? 0}|${p.amount}|${p.amount_usd ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({
      id: p.product_id,
      name: p.display_name,
      description: p.description ?? "",
      coins: Number(p.coins),
      bonusCoins: Number(p.bonus_coins ?? 0),
      amountInr: Number(p.amount),
      amountUsd: p.amount_usd == null ? null : Number(p.amount_usd),
      poiRange: p.poi_range || null,
      tourRange: p.tour_range || null,
      badge: packBadge(p),
      highlighted: Boolean(p.is_popular),
    }));
}

const parsedSnapshot = iapPackageListSchema.safeParse(snapshot.packages);

/** Build-time packs, used for first paint and JSON-LD only. */
export const snapshotPacks: WebPack[] = parsedSnapshot.success ? toWebPacks(parsedSnapshot.data) : [];

export async function fetchWebPacks(): Promise<WebPack[]> {
  const list = await apiFetch("/iap/packages", { auth: "none", schema: iapPackageListSchema });
  return toWebPacks(list);
}
