"use client";

import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { formatMoney, type PricingCurrency } from "@/lib/coin-pricing";
import { formatCoins, type CoinPurchaseEntry } from "@/lib/profile-api";

type Props = {
  entries: CoinPurchaseEntry[];
  loading?: boolean;
  error?: string | null;
};

export function CoinPurchaseHistoryList({ entries, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-5 animate-pulse space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-100" />
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

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-5 text-sm text-gray-500">
        No coin purchases yet. Buy a pack on the{" "}
        <a href="/pricing" className="font-semibold text-[#159895] hover:underline">
          pricing page
        </a>
        .
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
      {entries.map((entry) => {
        const currency = (entry.fiatCurrency?.toUpperCase() === "USD"
          ? "USD"
          : "INR") as PricingCurrency;
        return (
          <div
            key={entry.transactionId}
            className="p-5 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <GamanaCoinIcon className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  +{formatCoins(entry.coinAmount)} Coins
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {entry.description ||
                    (entry.transactionType === "purchase"
                      ? "Coin purchase"
                      : entry.transactionType.replace(/_/g, " "))}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString()}
                  {entry.transactionId
                    ? ` · ${entry.transactionId.slice(0, 12)}…`
                    : ""}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              {entry.fiatAmount != null && (
                <p className="text-sm font-semibold text-gray-900 tabular-nums">
                  {formatMoney(entry.fiatAmount, currency)}
                </p>
              )}
              <p className="text-xs text-gray-400 capitalize">{entry.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
