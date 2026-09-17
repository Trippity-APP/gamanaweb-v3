"use client";

import { Headphones, MapPin, Unlock } from "lucide-react";
import { formatCoins, type ContentPurchase } from "@/lib/profile-api";

type Props = {
  purchases: ContentPurchase[];
  loading?: boolean;
  error?: string | null;
};

function formatPurchaseType(type?: string, source?: ContentPurchase["source"]) {
  if (source === "unlock") return "Unlocked";
  if (!type) return "Content";
  if (type === "place") return "Place";
  if (type === "storylist") return "Audio walk";
  if (type === "unlock") return "Unlocked";
  return type.replace(/_/g, " ");
}

export function PurchaseHistoryList({ purchases, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 animate-pulse space-y-2">
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-3 w-1/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-5 text-sm text-gray-500">
        No content purchases yet. Unlock places and audio walks in the app with Gamana Coins.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
      {purchases.map((purchase) => {
        const Icon =
          purchase.source === "unlock"
            ? Unlock
            : purchase.purchaseType === "storylist"
              ? Headphones
              : MapPin;
        return (
          <div
            key={`${purchase.source ?? "api"}-${purchase.purchaseId}`}
            className="p-5 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <Icon className="h-4 w-4 text-[#159895] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {purchase.itemName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPurchaseType(purchase.purchaseType, purchase.source)}
                  {purchase.narratorName ? ` · ${purchase.narratorName}` : ""}
                </p>
                {purchase.purchasedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(purchase.purchasedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {purchase.finalPricePaid != null && (
              <p className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
                {formatCoins(purchase.finalPricePaid)} Coins
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
