"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  RefreshCw,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { AppHandoffSheet } from "@/components/handoff/AppHandoffSheet";
import { Reveal } from "@/components/motion/Reveal";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { detectPricingCurrency, formatMoney, persistPricingCurrency, type PricingCurrency } from "@/lib/coin-pricing";
import { webCoinCheckoutEnabled, webStripeCheckoutEnabled } from "@/lib/flags";
import { fetchWebPacks, snapshotPacks, type WebPack } from "@/lib/pricing/packages";
import { createPackOrder, openPackCheckout, verifyPackPayment } from "@/lib/pricing/razorpay";
import {
  STRIPE_CANCELLED_PARAM,
  STRIPE_SESSION_PARAM,
  createStripeCheckout,
  isStripeSessionId,
  redirectToStripe,
  verifyStripeSession,
} from "@/lib/pricing/stripe";

const CURRENCIES = ["INR", "USD"] as const;

function packPriceLabel(pack: WebPack, currency: PricingCurrency): string {
  if (currency === "USD" && pack.amountUsd != null) return formatMoney(pack.amountUsd, "USD");
  return formatMoney(pack.amountInr, "INR");
}

function packBullets(pack: WebPack): string[] {
  const bullets: string[] = [];
  if (pack.poiRange) bullets.push(`Unlock ${pack.poiRange} stories`);
  if (pack.tourRange) bullets.push(`Or ${pack.tourRange} audio tours`);
  bullets.push("Unused coins stay in your wallet");
  return bullets;
}

type PayResult =
  | { kind: "success"; coins: number; balance: number | null }
  | { kind: "pending" }
  | { kind: "cancelled" }
  | { kind: "failed"; message: string; pack: WebPack }
  | { kind: "notice"; title: string; message: string };

function PayResultCard({
  result,
  balance,
  onRetry,
  onDismiss,
}: {
  result: PayResult;
  balance: number | null;
  onRetry: (pack: WebPack) => void;
  onDismiss: () => void;
}) {
  const tone =
    result.kind === "success"
      ? { box: "border-brand-100 bg-brand-50", icon: "text-brand-700", Icon: CheckCircle2 }
      : result.kind === "failed"
        ? { box: "border-sunset-100 bg-sunset-100/60", icon: "text-sunset-700", Icon: AlertCircle }
        : { box: "border-ink/5 bg-sand-100", icon: "text-ink-soft", Icon: Clock };
  const shownBalance = result.kind === "success" ? (result.balance ?? balance) : null;

  let title: string;
  let body: string;
  switch (result.kind) {
    case "success":
      title = `${result.coins} coins added to your wallet`;
      body =
        shownBalance != null
          ? `Your balance is now ${shownBalance.toLocaleString("en-US")} coins. They're in the Gamana app too.`
          : "They're in the Gamana app too.";
      break;
    case "pending":
      title = "Payment received";
      body = "Your coins will appear in your wallet within a few minutes. If they don't, write to support@gamana.app.";
      break;
    case "cancelled":
      title = "Payment cancelled";
      body = "You weren't charged. Pick a pack whenever you're ready.";
      break;
    case "failed":
      title = "Payment didn't go through";
      body = result.message;
      break;
    case "notice":
      title = result.title;
      body = result.message;
      break;
  }

  return (
    <div className={cn("flex items-start gap-3 rounded-3xl border px-5 py-4 shadow-card", tone.box)}>
      <tone.Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tone.icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink-soft">{body}</p>
        {result.kind === "success" && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
            <Link href="/account/wallet/" className="focus-ring inline-flex min-h-11 items-center rounded text-brand-700 hover:text-brand-800">
              View wallet
            </Link>
            <Link href="/marketplace/" className="focus-ring inline-flex min-h-11 items-center rounded text-brand-700 hover:text-brand-800">
              Explore stories and tours
            </Link>
          </div>
        )}
        {result.kind === "failed" && (
          <button
            type="button"
            onClick={() => onRetry(result.pack)}
            className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="focus-ring -mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-soft hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function PricingCatalog() {
  const { status, balance, user, requireAuth, refreshBalance } = useAuth();
  const [packs, setPacks] = useState<WebPack[]>(snapshotPacks);
  const [preferred, setPreferred] = useState<PricingCurrency>("USD");
  const [ready, setReady] = useState(false);
  const [buying, setBuying] = useState<WebPack | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState("");
  const [result, setResult] = useState<PayResult | null>(null);
  const [queued, setQueued] = useState<WebPack | null>(null);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    setPreferred(detectPricingCurrency());
    setReady(true);
    let cancelled = false;
    fetchWebPacks()
      .then((live) => !cancelled && live.length > 0 && setPacks(live))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const hasUsd = packs.some((p) => p.amountUsd != null);
  const currency: PricingCurrency = hasUsd ? preferred : "INR";

  const chooseCurrency = (next: PricingCurrency) => {
    setPreferred(next);
    persistPricingCurrency(next);
  };

  const paysWithStripe = (pack: WebPack) => webStripeCheckoutEnabled && currency === "USD" && pack.amountUsd != null;

  const stripeCheckout = async (pack: WebPack) => {
    setPaying(pack.id);
    setResult(null);
    setPayStatus(`Taking you to secure payment for ${pack.coins + pack.bonusCoins} coins…`);
    try {
      const session = await createStripeCheckout(pack.id);
      track("pricing_checkout_redirect", { pack: pack.id, provider: "stripe" });
      redirectToStripe(session);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      track("pricing_purchase_failed", { pack: pack.id, reason: "order", provider: "stripe" });
      setPayStatus("");
      setResult({ kind: "failed", message, pack });
      setPaying(null);
    }
  };

  const confirmStripe = async (sessionId: string) => {
    setPaying(sessionId);
    setResult(null);
    setPayStatus("Payment received. Adding your coins…");
    try {
      const verified = await verifyStripeSession(sessionId);
      track("pricing_purchase_success", { coins: verified.coins_credited, currency: "USD", provider: "stripe" });
      setResult({
        kind: "success",
        coins: Math.floor(verified.coins_credited),
        balance: verified.new_balance != null ? Math.floor(verified.new_balance) : null,
      });
      void refreshBalance();
      toast({ title: "Coins added", description: `${Math.floor(verified.coins_credited)} coins are in your wallet.` });
    } catch (err) {
      track("pricing_purchase_failed", { reason: "verify", provider: "stripe" });
      if (err instanceof ApiError && err.status === 409 && /review/i.test(err.message)) {
        setResult({ kind: "notice", title: "Payment under review", message: err.message });
      } else if (err instanceof ApiError && [400, 403, 404].includes(err.status)) {
        setResult({ kind: "notice", title: "We couldn't confirm this payment", message: err.message });
      } else {
        setResult({ kind: "pending" });
        window.setTimeout(() => void refreshBalance(), 15000);
      }
    } finally {
      setPayStatus("");
      setPaying(null);
    }
  };
  const confirmStripeRef = useRef(confirmStripe);
  confirmStripeRef.current = confirmStripe;

  // Stripe sends the buyer back to /pricing/?stripe_session=… (or ?stripe_cancelled=1).
  const [returnedSession, setReturnedSession] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get(STRIPE_SESSION_PARAM);
    const cancelled = params.has(STRIPE_CANCELLED_PARAM);
    if (!sessionId && !cancelled) return;
    params.delete(STRIPE_SESSION_PARAM);
    params.delete(STRIPE_CANCELLED_PARAM);
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    if (cancelled) {
      track("pricing_checkout_dismissed", { provider: "stripe" });
      setResult({ kind: "cancelled" });
    } else if (isStripeSessionId(sessionId)) {
      setReturnedSession(sessionId);
    }
  }, []);

  useEffect(() => {
    if (!returnedSession || status === "loading") return;
    const sessionId = returnedSession;
    setReturnedSession(null);
    requireAuth(() => void confirmStripeRef.current(sessionId), "to add your coins");
  }, [returnedSession, status, requireAuth]);

  // Coming back from Stripe with the browser's Back button restores this page from cache mid-redirect.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setPaying(null);
      setPayStatus("");
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const checkout = async (pack: WebPack) => {
    if (paysWithStripe(pack)) {
      await stripeCheckout(pack);
      return;
    }
    const coins = pack.coins + pack.bonusCoins;
    setPaying(pack.id);
    setResult(null);
    setPayStatus(`Opening secure payment for ${coins} coins…`);
    let paid = false;
    try {
      const order = await createPackOrder(pack.id);
      const current = userRef.current;
      const outcome = await openPackCheckout(order, {
        name: [current?.firstName, current?.lastName].filter(Boolean).join(" ") || undefined,
        email: current?.email || undefined,
        contact: current?.phone ? `${current.countryCode}${current.phone}` : undefined,
      });
      if (outcome.kind === "dismissed") {
        track("pricing_checkout_dismissed", { pack: pack.id });
        setPayStatus("");
        setResult({ kind: "cancelled" });
        return;
      }
      if (outcome.kind === "failed") {
        track("pricing_purchase_failed", { pack: pack.id, reason: outcome.message });
        setPayStatus("");
        setResult({ kind: "failed", message: outcome.message, pack });
        return;
      }
      paid = true;
      setPayStatus("Payment received. Adding your coins…");
      const verified = await verifyPackPayment(outcome.result);
      track("pricing_purchase_success", { pack: pack.id, coins: verified.coins_credited, value: pack.amountInr, currency: "INR" });
      setPayStatus("");
      setResult({
        kind: "success",
        coins: Math.floor(verified.coins_credited),
        balance: verified.new_balance != null ? Math.floor(verified.new_balance) : null,
      });
      void refreshBalance();
      toast({ title: "Coins added", description: `${Math.floor(verified.coins_credited)} coins are in your wallet.` });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      track("pricing_purchase_failed", { pack: pack.id, reason: paid ? "verify" : "order" });
      setPayStatus("");
      if (paid) {
        setResult({ kind: "pending" });
        window.setTimeout(() => void refreshBalance(), 15000);
      } else {
        setResult({ kind: "failed", message, pack });
      }
    } finally {
      setPaying(null);
    }
  };
  const checkoutRef = useRef(checkout);
  checkoutRef.current = checkout;

  // A returning user's session may still be restoring; wait for it instead of showing the login sheet.
  useEffect(() => {
    if (status === "loading" || !queued) return;
    const pack = queued;
    setQueued(null);
    requireAuth(() => void checkoutRef.current(pack), "to buy coins");
  }, [status, queued, requireAuth]);

  const buy = (pack: WebPack) => {
    track("pricing_buy_click", { pack: pack.id, currency });
    if (!webCoinCheckoutEnabled) {
      setBuying(pack);
      return;
    }
    if (paying || queued) return;
    if (status === "loading") {
      setQueued(pack);
      return;
    }
    requireAuth(() => void checkout(pack), "to buy coins");
  };

  return (
    <section className="section bg-sand-50">
      <div className="container-site">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-h2 text-ink">Choose a pack</h2>
            <p className="mt-2 text-ink-soft" aria-live="polite">
              {!ready
                ? "Loading prices for your location…"
                : hasUsd
                  ? `Showing prices in ${currency}. Switch anytime.`
                  : "Prices shown in INR."}
            </p>
          </div>
          {hasUsd && (
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
                    "focus-ring relative z-10 min-h-[44px] rounded-full px-6 py-2 transition-colors duration-300",
                    currency === option ? "text-white" : "text-ink-soft hover:text-ink"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {status === "authenticated" && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/5 bg-white px-5 py-3 shadow-card">
            <p className="flex items-center gap-2 text-sm text-ink">
              Your balance:
              <GamanaCoinIcon className="h-5 w-5" aria-hidden />
              <span className="font-display text-lg font-bold">{balance === null ? "…" : balance.toLocaleString("en-US")}</span>
            </p>
            <Link href="/account/wallet/" className="focus-ring rounded text-sm font-semibold text-brand-700 hover:text-brand-800">
              View wallet
            </Link>
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {payStatus}
        </p>

        <div role="status" aria-live="polite" className={cn(result && "mb-8")}>
          {result && (
            <PayResultCard
              result={result}
              balance={balance}
              onRetry={(pack) => {
                setResult(null);
                buy(pack);
              }}
              onDismiss={() => setResult(null)}
            />
          )}
        </div>

        {packs.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-ink-soft shadow-card">
            Coin packs are available in the Gamana app.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 xl:items-stretch">
            {packs.map((pack, i) => {
              const price = packPriceLabel(pack, currency);
              const viaStripe = paysWithStripe(pack);
              const chargeLabel = webCoinCheckoutEnabled && !viaStripe ? formatMoney(pack.amountInr, "INR") : price;
              const featured = pack.highlighted;
              const isPaying = paying === pack.id || queued?.id === pack.id;
              const chargedInInr = webCoinCheckoutEnabled && !viaStripe && currency !== "INR";

              return (
                <Reveal
                  key={pack.id}
                  delay={i * 80}
                  className={cn(
                    "h-full w-full sm:w-[calc(50%-0.625rem)] xl:w-[calc(25%-0.9375rem)]",
                    featured && "xl:-mt-4"
                  )}
                >
                  <div
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-3xl transition-all duration-500 ease-out-expo hover:-translate-y-1",
                      featured
                        ? "bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white shadow-lift ring-2 ring-sunset-400/70"
                        : "border border-ink/10 bg-white text-ink shadow-card hover:shadow-lift"
                    )}
                  >
                    {featured && (
                      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset-400/25 blur-2xl" aria-hidden />
                    )}
                    {pack.badge && (
                      <p
                        className={cn(
                          "relative flex items-center justify-center gap-1.5 py-2 text-center text-[11px] font-bold uppercase tracking-wider",
                          featured ? "bg-sunset-400 text-ink" : "bg-brand-50 text-brand-800"
                        )}
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        {pack.badge}
                      </p>
                    )}
                    <div className={cn("relative flex flex-1 flex-col p-7", !pack.badge && "pt-[3.75rem]")}>
                      <span
                        className={cn(
                          "grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110",
                          featured ? "bg-white/15" : "bg-brand-50"
                        )}
                      >
                        <GamanaCoinIcon className="h-6 w-6" aria-hidden />
                      </span>
                      <p className="mt-5 flex items-baseline gap-2">
                        <span className="font-display text-5xl font-extrabold leading-none">{pack.coins}</span>
                        <span className={cn("text-sm", featured ? "text-white/75" : "text-ink-muted")}>Coins</span>
                      </p>
                      {pack.bonusCoins > 0 && (
                        <p className={cn("mt-2 text-sm font-semibold", featured ? "text-sunset-300" : "text-forest")}>
                          +{pack.bonusCoins} bonus coins
                        </p>
                      )}
                      <p key={currency} className="mt-3 animate-fade-in font-display text-3xl font-bold">
                        {price}
                      </p>
                      {chargedInInr && (
                        <p className={cn("mt-1 text-xs", featured ? "text-white/75" : "text-ink-muted")}>
                          Charged in INR: {formatMoney(pack.amountInr, "INR")}
                        </p>
                      )}
                      {pack.description && (
                        <p className={cn("mt-3 text-sm leading-relaxed", featured ? "text-white/80" : "text-ink-soft")}>
                          {pack.description}
                        </p>
                      )}
                      <ul className="mt-5 flex-1 space-y-2.5">
                        {packBullets(pack).map((bullet) => (
                          <li
                            key={bullet}
                            className={cn("flex gap-2.5 text-sm", featured ? "text-white/90" : "text-ink-soft")}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                                featured ? "bg-sunset-400 text-ink" : "bg-brand-700 text-white"
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
                        onClick={() => buy(pack)}
                        disabled={paying !== null || queued !== null}
                        aria-busy={isPaying || undefined}
                        className={cn(
                          "focus-ring mt-7 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-300 ease-spring hover:-translate-y-0.5 active:scale-95 disabled:pointer-events-none disabled:opacity-70",
                          featured ? "bg-white text-brand-800" : "bg-ink text-white"
                        )}
                      >
                        {isPaying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                        Buy {pack.coins} coins · {chargeLabel}
                      </button>
                      <p className={cn("mt-2 text-center text-xs", featured ? "text-white/65" : "text-ink-muted")}>
                        {viaStripe
                          ? "Secure card payment in USD with Stripe"
                          : webCoinCheckoutEnabled
                            ? "Secure payment in INR · UPI, cards, netbanking"
                            : "Opens the Gamana app"}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Smartphone,
              text: webStripeCheckoutEnabled ? (
                <>Pay securely with Razorpay in INR or Stripe in USD. Coins land in your wallet here and in the Gamana app.</>
              ) : webCoinCheckoutEnabled ? (
                <>Pay securely with Razorpay. Coins land in your wallet here and in the Gamana app.</>
              ) : (
                <>Buy securely in the Gamana app. Coins appear here instantly.</>
              ),
            },
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

      <AppHandoffSheet
        open={buying !== null}
        onOpenChange={(open) => !open && setBuying(null)}
        source="pricing-buy-coins"
        title="Buy coins in the Gamana app"
        steps={["Open Gamana", "Tap your coin balance", "Choose a pack"]}
        note="Coins you buy in the app show up on the website too."
        deepLink="https://www.gamana.app/"
      />
    </section>
  );
}
