export type PricingCurrency = "INR" | "USD";

export interface CoinPack {
  id: string;
  coins: number;
  priceInr: number;
  priceUsd: number;
  blurb: string;
  bullets: string[];
  popular?: boolean;
}

const PRICING_CURRENCY_KEY = "gamana-pricing-currency";

/** Public coin packs for /pricing — 1 coin = ₹100 / $1.20. Separate from USD coinBundles. */
export const coinPacks: CoinPack[] = [
  {
    id: "coins-2",
    coins: 2,
    priceInr: 200,
    priceUsd: 3,
    blurb: "Try a couple of premium stories on your next walk.",
    bullets: ["About 2 premium audio stories", "Keep unused coins in your wallet", "Free stories stay free"],
  },
  {
    id: "coins-10",
    coins: 10,
    priceInr: 1000,
    priceUsd: 12,
    blurb: "A typical audio walk, or several stories in one city.",
    bullets: ["A typical audio walk", "Or several premium stories", "Best value for a city day"],
    popular: true,
  },
  {
    id: "coins-15",
    coins: 15,
    priceInr: 1500,
    priceUsd: 18,
    blurb: "Stories and walks for a longer city stay.",
    bullets: ["A walk plus extra stories", "Enough for a 2–3 day stay", "One-time pack, not a plan"],
  },
  {
    id: "coins-25",
    coins: 25,
    priceInr: 2500,
    priceUsd: 30,
    blurb: "The largest self-serve pack for a full trip.",
    bullets: ["Multiple walks and stories", "Built for a full trip", "Share one wallet across the journey"],
  },
];

/** @deprecated Use coinPacks */
export const inrCoinPacks = coinPacks;

export function packPrice(pack: CoinPack, currency: PricingCurrency): number {
  return currency === "INR" ? pack.priceInr : pack.priceUsd;
}

export function formatMoney(amount: number, currency: PricingCurrency): string {
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

export function detectPricingCurrency(): PricingCurrency {
  if (typeof window === "undefined") return "USD";

  try {
    const stored = window.localStorage.getItem(PRICING_CURRENCY_KEY);
    if (stored === "INR" || stored === "USD") return stored;
  } catch {
    // Ignore private-mode storage errors.
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") return "INR";
  } catch {
    // Ignore missing Intl support.
  }

  const language = window.navigator.language || "";
  if (/(^|-)IN$/i.test(language)) return "INR";

  return "USD";
}

export function persistPricingCurrency(currency: PricingCurrency): void {
  try {
    window.localStorage.setItem(PRICING_CURRENCY_KEY, currency);
  } catch {
    // Ignore private-mode storage errors.
  }
}

export function formatInr(amount: number): string {
  return formatMoney(amount, "INR");
}
