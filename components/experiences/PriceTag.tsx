import { formatMoney } from "@/lib/experiences/format";
import { cn } from "@/lib/utils";

type PriceTagProps = {
  amount: number | null | undefined;
  currency: string | null | undefined;
  compareAt?: number | null;
  showFrom?: boolean;
  showPerPerson?: boolean;
  className?: string;
};

export function PriceTag({ amount, currency, compareAt, showFrom = true, showPerPerson = true, className }: PriceTagProps) {
  if (amount == null || amount <= 0) return null;
  const strike = compareAt != null && compareAt > amount ? compareAt : null;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-1.5", className)}>
      {showFrom && <span className="text-xs text-ink-soft">From</span>}
      {strike && <span className="text-sm text-ink-soft line-through">{formatMoney(strike, currency)}</span>}
      <span className="font-display text-lg font-bold text-ink">{formatMoney(amount, currency)}</span>
      {showPerPerson && <span className="text-xs text-ink-soft">per person</span>}
    </p>
  );
}
