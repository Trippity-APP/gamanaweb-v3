"use client";

import Link from "next/link";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Button } from "@/components/ui/button";
import { formatCoins } from "@/lib/profile-api";

type Props = {
  balance: number;
  loading?: boolean;
};

export function WalletSummary({ balance, loading }: Props) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <GamanaCoinIcon className="h-5 w-5 text-amber-800" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-amber-900">Gamana Coins</p>
          <p className="text-xs text-amber-800/80">Live balance from your wallet</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-lg font-bold text-amber-900 tabular-nums">
          {loading ? "…" : formatCoins(balance)} Coins
        </p>
        <Link href="/pricing">
          <Button size="sm" className="bg-gradient-to-r from-[#159895] to-[#1A5F7A]">
            Buy coins
          </Button>
        </Link>
      </div>
    </div>
  );
}
