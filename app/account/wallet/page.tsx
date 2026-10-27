"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronDown, Gift, Loader2, Lock, RefreshCw, ShoppingBag, Sparkles, Tag } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { toast } from "@/hooks/use-toast";
import { apiFetch, ApiError } from "@/lib/api/client";
import { coinBalanceSchema } from "@/lib/api/schemas/coins";
import {
  fetchPassbookPage,
  groupByMonth,
  redeemPromo,
  type PassbookKind,
  type PassbookRow,
} from "@/lib/account/wallet";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<PassbookKind, typeof ShoppingBag> = {
  purchase: ShoppingBag,
  unlock: Lock,
  reward: Gift,
  refund: RefreshCw,
  promo: Tag,
  other: Sparkles,
};

function formatRowDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatAmount(n: number): string {
  if (n > 0) return `+${n.toLocaleString("en-US")}`;
  if (n < 0) return `\u2212${Math.abs(n).toLocaleString("en-US")}`;
  return "0";
}

export default function WalletPage() {
  const { balance, refreshBalance } = useAuth();
  const [pending, setPending] = useState(0);
  const [rows, setRows] = useState<PassbookRow[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const loadBalance = useCallback(() => {
    apiFetch("/coins/balance", { auth: "required", schema: coinBalanceSchema })
      .then((b) => setPending(Math.floor(Number(b.pending_balance ?? 0))))
      .catch(() => setPending(0));
  }, []);

  const loadFirstPage = useCallback(() => {
    setError(false);
    fetchPassbookPage(1)
      .then((res) => {
        setRows(res.rows);
        setHasNext(res.hasNext);
        setPage(1);
      })
      .catch(() => {
        setRows([]);
        setError(true);
      });
  }, []);

  useEffect(() => {
    loadBalance();
    loadFirstPage();
  }, [loadBalance, loadFirstPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await fetchPassbookPage(page + 1);
      setRows((prev) => [...(prev ?? []), ...res.rows]);
      setHasNext(res.hasNext);
      setPage(page + 1);
    } catch {
      toast({ title: "Couldn't load more activity", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoadingMore(false);
    }
  };

  const onRedeemed = () => {
    void refreshBalance();
    loadBalance();
    loadFirstPage();
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Wallet</h1>

      <section aria-labelledby="wallet-balance" className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <p id="wallet-balance" className="eyebrow">Your balance</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3">
              <GamanaCoinIcon className="h-10 w-10" aria-hidden />
              {balance === null ? (
                <Skeleton className="h-12 w-24 rounded-xl" />
              ) : (
                <span className="font-display text-5xl font-extrabold leading-none text-ink">
                  {balance.toLocaleString("en-US")}
                </span>
              )}
              <span className="self-end pb-1 text-ink-soft">coins</span>
            </p>
            {pending > 0 && <p className="mt-2 text-sm text-ink-soft">+{pending} pending</p>}
          </div>
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/pricing/">
              Get coins <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        <p className="mt-6 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Coins are shared with your Gamana app. Spend them on premium stories and audio tours.
        </p>
      </section>

      <PromoRedeem onRedeemed={onRedeemed} />

      <section aria-labelledby="wallet-history" className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <h2 id="wallet-history" className="text-h3 text-ink">
          History
        </h2>

        {rows === null ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 rounded-2xl bg-sand-50 p-5 text-sm text-ink-soft" role="alert">
            Couldn&apos;t load your coin activity.{" "}
            <button type="button" onClick={loadFirstPage} className="focus-ring rounded font-semibold text-brand-700">
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-sand-50 p-5 text-sm text-ink-soft">No coin activity yet.</p>
        ) : (
          <>
            <div className="mt-4">
              {groupByMonth(rows).map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <h3 className="sticky top-16 z-10 -mx-2 bg-white/95 px-2 py-2 text-xs font-bold uppercase tracking-wider text-ink-muted backdrop-blur">
                    {group.label}
                  </h3>
                  <ul className="divide-y divide-sand-100">
                    {group.rows.map((row) => {
                      const Icon = KIND_ICON[row.kind];
                      return (
                        <li key={row.id} className="flex items-center gap-4 py-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                            <Icon className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{row.description}</p>
                            <p className="text-xs text-ink-muted">{formatRowDate(row.createdAt)}</p>
                          </div>
                          {row.status !== "completed" && row.status !== "success" && (
                            <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-ink-soft">
                              {row.status}
                            </span>
                          )}
                          <span
                            className={cn(
                              "shrink-0 font-display text-base font-bold tabular-nums",
                              row.amount > 0 ? "text-forest" : "text-ink",
                            )}
                          >
                            {formatAmount(row.amount)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
            {hasNext && (
              <div className="mt-5 flex justify-center">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="h-11 rounded-full px-6">
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PromoRedeem({ onRedeemed }: { onRedeemed: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const panelId = useId();
  const errorId = useId();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter a promo code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const message = await redeemPromo(code);
      toast({ title: "Promo code applied", description: message || "Coins added to your wallet." });
      setCode("");
      setOpen(false);
      onRedeemed();
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : "Couldn't apply that code. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white shadow-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex min-h-[56px] w-full items-center justify-between gap-3 rounded-3xl px-6 py-4 text-left sm:px-8"
      >
        <span className="flex items-center gap-3 font-semibold text-ink">
          <Tag className="h-5 w-5 text-brand-700" aria-hidden />
          Have a promo code?
        </span>
        <ChevronDown className={cn("h-5 w-5 text-ink-soft transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div id={panelId} hidden={!open} className="px-6 pb-6 sm:px-8">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start" noValidate>
          <div className="flex-1">
            <Label htmlFor={`${panelId}-code`} className="sr-only">
              Promo code
            </Label>
            <Input
              id={`${panelId}-code`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              autoComplete="off"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="h-11 rounded-full px-5 uppercase tracking-wider"
            />
          </div>
          <Button type="submit" disabled={busy} className="h-11 rounded-full px-6">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Apply
          </Button>
        </form>
        <p id={errorId} aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm text-red-700">
          {error}
        </p>
      </div>
    </section>
  );
}
