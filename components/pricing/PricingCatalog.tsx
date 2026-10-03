"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Check, Lock, Shield, Sparkles, Wallet } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import {
  coinPacks,
  detectPricingCurrency,
  formatMoney,
  packPrice,
  persistPricingCurrency,
  type PricingCurrency,
} from "@/lib/coin-pricing";

const CURRENCIES = ["INR", "USD"] as const;

export function PricingCatalog() {
  const [currency, setCurrency] = useState<PricingCurrency>("USD");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrency(detectPricingCurrency());
    setReady(true);
  }, []);

  const chooseCurrency = (next: PricingCurrency) => {
    setCurrency(next);
    persistPricingCurrency(next);
  };

  return (
    <section className="section bg-sand-50">
      <div className="container-site">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-h2 text-ink">Choose a pack</h2>
            <p className="mt-2 text-ink-soft" aria-live="polite">
              {ready ? `Showing prices in ${currency}. Switch anytime.` : "Loading prices for your location…"}
            </p>
          </div>
          <div
            role="group"
            aria-label="Currency"
            className="relative inline-grid w-fit grid-cols-2 rounded-full border border-ink/10 bg-white p-1 text-sm font-semibold shadow-card"
          >
            <span
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-700 shadow-sm transition-transform duration-500 ease-spring",
                currency === "USD" && "translate-x-full"
              )}
              aria-hidden
            />
            {CURRENCIES.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={currency === option}
                onClick={() => chooseCurrency(option)}
                className={cn(
                  "focus-ring relative z-10 rounded-full px-6 py-2 transition-colors duration-300",
                  currency === option ? "text-white" : "text-ink-soft hover:text-ink"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          {coinPacks.map((pack, i) => {
            const price = formatMoney(packPrice(pack, currency), currency);
            const popular = Boolean(pack.popular);

            return (
              <Reveal key={pack.id} delay={i * 80} className={cn("h-full", popular && "xl:-mt-4")}>
                <div
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-500 ease-out-expo hover:-translate-y-1",
                    popular
                      ? "bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white shadow-lift ring-2 ring-sunset-400/70"
                      : "border border-ink/10 bg-white text-ink shadow-card hover:shadow-lift"
                  )}
                >
                  {popular && (
                    <>
                      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset-400/25 blur-2xl" aria-hidden />
                      <p className="relative flex items-center justify-center gap-1.5 bg-sunset-400 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-ink">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        Most popular with travelers
                      </p>
                    </>
                  )}
                  <div className={cn("relative flex flex-1 flex-col p-7", !popular && "pt-[3.75rem]")}>
                    <span
                      className={cn(
                        "grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110",
                        popular ? "bg-white/15" : "bg-brand-50"
                      )}
                    >
                      <GamanaCoinIcon className="h-6 w-6" aria-hidden />
                    </span>
                    <p className="mt-5 flex items-baseline gap-2">
                      <span className="font-display text-5xl font-extrabold leading-none">{pack.coins}</span>
                      <span className={cn("text-sm", popular ? "text-white/75" : "text-ink-muted")}>Coins</span>
                    </p>
                    <p
                      key={currency}
                      className="mt-3 animate-fade-in font-display text-3xl font-bold"
                    >
                      {price}
                    </p>
                    <p className={cn("mt-3 text-sm leading-relaxed", popular ? "text-white/80" : "text-ink-soft")}>
                      {pack.blurb}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5">
                      {pack.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className={cn("flex gap-2.5 text-sm", popular ? "text-white/90" : "text-ink-soft")}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                              popular ? "bg-sunset-400 text-ink" : "bg-brand-700 text-white"
                            )}
                          >
                            <Check className="h-2.5 w-2.5" aria-hidden />
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className={cn(
                        "mt-7 w-full cursor-not-allowed rounded-full px-5 py-3 text-sm font-semibold",
                        popular ? "bg-white text-brand-800 opacity-95" : "bg-ink text-white opacity-85"
                      )}
                    >
                      Buy {pack.coins} coins · {price}
                    </button>
                    <p className={cn("mt-2 text-center text-xs", popular ? "text-white/65" : "text-ink-muted")}>
                      Checkout coming soon
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shield, text: <>Secure checkout with Razorpay when payments go live.</> },
            { icon: Lock, text: <>One-time packs. Not a subscription. Unused coins stay in your wallet.</> },
            {
              icon: Wallet,
              text: (
                <>
                  Questions? Write to{" "}
                  <a href="mailto:support@gamana.app" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
                    support@gamana.app
                  </a>
                  .
                </>
              ),
            },
          ].map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-ink/5 bg-white px-5 py-4 shadow-card">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
              <p className="text-sm text-ink-soft">{text}</p>
            </li>
          ))}
        </ul>

        <Reveal className="mt-8">
          <div className="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-lift sm:p-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                  <Building2 className="h-6 w-6 text-brand-200" aria-hidden />
                </span>
                <h2 className="text-h3 mt-5">Enterprise</h2>
                <p className="mt-3 leading-relaxed text-white/75">
                  Need more than 25 coins? Teams, partners, and bulk purchases go through Enterprise. We will set a
                  volume that matches how you travel or work with Gamana.
                </p>
              </div>
              <Link
                href="/contact/"
                className="focus-ring group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-ink transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-95"
              >
                Contact us
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
