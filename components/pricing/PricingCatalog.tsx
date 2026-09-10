"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Check, Lock, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import {
  coinPacks,
  detectPricingCurrency,
  formatMoney,
  packPrice,
  persistPricingCurrency,
  type PricingCurrency,
} from "@/lib/coin-pricing";

const steps = [
  {
    title: "Buy a pack",
    text: "Pick the coins you need for this trip. One payment, no subscription.",
  },
  {
    title: "Coins sit in your wallet",
    text: "They stay with your Gamana account until you spend them.",
  },
  {
    title: "Unlock as you walk",
    text: "Use coins on premium stories and walks. Free stories stay free.",
  },
];

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

  const faqs = [
    {
      question: "Where do my coins appear?",
      answer:
        "After a successful purchase, coins are credited to your Gamana account. Use them in the app or on the website to unlock premium stories and walks.",
    },
    {
      question: "Can I get a refund?",
      answer:
        "Unused coin packs follow our refund policy. If a payment fails or looks wrong, email support@gamana.app and we will help.",
    },
    {
      question: "What if I need more than 25 coins?",
      answer:
        "Volumes above 25 coins are Enterprise. Contact us for teams, partners, and bulk purchases.",
    },
  ];

  return (
    <>
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose a pack</h2>
              <p className="mt-1 text-sm text-gray-500">
                {ready
                  ? `Showing prices in ${currency}. Switch anytime.`
                  : "Loading prices for your location…"}
              </p>
            </div>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-sm font-semibold">
              {(["INR", "USD"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseCurrency(option)}
                  className={`rounded-full px-4 py-1.5 transition-colors ${
                    currency === option
                      ? "bg-[#159895] text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
            {coinPacks.map((pack) => {
              const price = formatMoney(packPrice(pack, currency), currency);
              const popular = Boolean(pack.popular);

              return (
                <Card
                  key={pack.id}
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ${
                    popular
                      ? "border-transparent shadow-lg ring-2 ring-[#159895] xl:-mt-2"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  {popular && (
                    <p className="bg-[#159895] py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
                      Most popular with travelers
                    </p>
                  )}
                  <CardHeader className="space-y-3 p-6 pb-2">
                    {!popular && <div className="h-6" />}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FBFA]">
                      <GamanaCoinIcon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-4xl font-bold leading-none text-gray-900">{pack.coins}</p>
                      <p className="mt-1 text-sm text-gray-500">Coins</p>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{price}</p>
                    <p className="text-sm leading-relaxed text-gray-500">{pack.blurb}</p>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 pb-2">
                    <ul className="space-y-2">
                      {pack.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2 text-sm text-gray-600">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#159895]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2 p-6 pt-4">
                    <Button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className={
                        popular
                          ? "w-full bg-[#159895] text-white opacity-90 hover:bg-[#159895]"
                          : "w-full bg-gray-900 text-white opacity-80 hover:bg-gray-900"
                      }
                    >
                      Buy {pack.coins} coins · {price}
                    </Button>
                    <p className="text-center text-xs text-gray-400">Checkout coming soon</p>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#159895]" />
              <p className="text-sm text-gray-600">
                Secure checkout with Razorpay when payments go live.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#159895]" />
              <p className="text-sm text-gray-600">
                One-time packs. Not a subscription. Unused coins stay in your wallet.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#159895]" />
              <p className="text-sm text-gray-600">
                Questions? Write to{" "}
                <a href="mailto:support@gamana.app" className="font-medium text-[#159895]">
                  support@gamana.app
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-[#159895]/20 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FBFA]">
                  <Building2 className="h-5 w-5 text-[#1A5F7A]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Enterprise</h2>
                <p className="text-base leading-relaxed text-gray-600">
                  Need more than 25 coins? Teams, partners, and bulk purchases go through
                  Enterprise. We will set a volume that matches how you travel or work with
                  Gamana.
                </p>
              </div>
              <Button
                asChild
                className="h-11 shrink-0 bg-[#1A5F7A] px-6 font-semibold text-white hover:bg-[#164e63]"
              >
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#159895]">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-bold text-gray-900">Questions</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-b border-gray-100 pb-6">
                <dt className="font-semibold text-gray-900">{faq.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
