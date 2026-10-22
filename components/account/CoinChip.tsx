"use client";

import Link from "next/link";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

/** Live coin balance; links to the wallet. */
export function CoinChip({ className }: { className?: string }) {
  const { balance } = useAuth();
  const label = balance === null ? "…" : balance.toLocaleString("en-US");
  return (
    <Link
      href="/account/wallet/"
      aria-label={balance === null ? "Wallet" : `${label} coins, open wallet`}
      className={cn(
        "focus-ring inline-flex h-10 items-center gap-1.5 rounded-full bg-sand-100 px-3 text-sm font-bold text-ink transition-colors hover:bg-sand-200",
        className,
      )}
    >
      <GamanaCoinIcon className="h-4 w-4" aria-hidden />
      <span aria-live="polite">{label}</span>
    </Link>
  );
}
