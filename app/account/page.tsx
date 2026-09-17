"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Sparkles,
  ShoppingBag,
  LogOut,
  Pencil,
  Wallet,
} from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { useAccount } from "@/lib/account-context";
import { PersonalizationEditor } from "@/components/account/PersonalizationEditor";
import { WalletSummary } from "@/components/account/WalletSummary";
import { PurchaseHistoryList } from "@/components/account/PurchaseHistoryList";
import { CoinPurchaseHistoryList } from "@/components/account/CoinPurchaseHistoryList";
import {
  fetchCoinPurchaseHistory,
  fetchMyPurchases,
  updateUserProfile,
  type CoinPurchaseEntry,
  type ContentPurchase,
} from "@/lib/profile-api";
import { useToast } from "@/hooks/use-toast";

/**
 * Account page backed by the same mobile APIs: profile, wallet balance,
 * content purchases, and coin purchase (passbook) history.
 */
export default function AccountPage() {
  const {
    account,
    coinBalance,
    orders,
    updateProfile,
    logout,
    refreshFromApi,
    isAuthenticated,
  } = useAccount();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameDraft, setNameDraft] = useState(account?.fullName || "");
  const [walletLoading, setWalletLoading] = useState(false);

  const [purchases, setPurchases] = useState<ContentPurchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  const [coinPurchases, setCoinPurchases] = useState<CoinPurchaseEntry[]>([]);
  const [coinPurchasesLoading, setCoinPurchasesLoading] = useState(false);
  const [coinPurchasesError, setCoinPurchasesError] = useState<string | null>(null);

  useEffect(() => {
    setNameDraft(account?.fullName || "");
  }, [account?.fullName]);

  useEffect(() => {
    if (!account?.accessToken || !isAuthenticated) return;

    let cancelled = false;

    (async () => {
      setWalletLoading(true);
      setPurchasesLoading(true);
      setCoinPurchasesLoading(true);
      setPurchasesError(null);
      setCoinPurchasesError(null);

      try {
        await refreshFromApi();
      } finally {
        if (!cancelled) setWalletLoading(false);
      }

      try {
        const result = await fetchMyPurchases({
          accessToken: account.accessToken,
          limit: 50,
        });
        if (!cancelled) setPurchases(result.purchases);
      } catch (err) {
        if (!cancelled) {
          setPurchasesError(
            err instanceof Error ? err.message : "Could not load purchases."
          );
        }
      } finally {
        if (!cancelled) setPurchasesLoading(false);
      }

      try {
        const result = await fetchCoinPurchaseHistory({
          accessToken: account.accessToken,
          limit: 50,
        });
        if (!cancelled) {
          if (result.entries.length > 0) {
            setCoinPurchases(result.entries);
          } else {
            // Passbook empty — show recent web Razorpay buys from local cache.
            const localCoinBuys: CoinPurchaseEntry[] = orders
              .filter((order) => order.kind === "coins-purchase")
              .map((order) => ({
                transactionId: order.id,
                transactionType: "purchase",
                status: "completed",
                coinAmount:
                  order.items.reduce((sum, item) => {
                    const match = item.title.match(/(\d+)\s+Gamana Coins/i);
                    return sum + (match ? Number(match[1]) : 0);
                  }, 0) || 0,
                fiatAmount: order.total,
                fiatCurrency: order.currency ?? "INR",
                description: order.items.map((i) => i.title).join(", "),
                timestamp: order.placedAt,
              }))
              .filter((entry) => entry.coinAmount > 0);
            setCoinPurchases(localCoinBuys);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const localCoinBuys: CoinPurchaseEntry[] = orders
            .filter((order) => order.kind === "coins-purchase")
            .map((order) => ({
              transactionId: order.id,
              transactionType: "purchase",
              status: "completed",
              coinAmount:
                order.items.reduce((sum, item) => {
                  const match = item.title.match(/(\d+)\s+Gamana Coins/i);
                  return sum + (match ? Number(match[1]) : 0);
                }, 0) || 0,
              fiatAmount: order.total,
              fiatCurrency: order.currency ?? "INR",
              description: order.items.map((i) => i.title).join(", "),
              timestamp: order.placedAt,
            }))
            .filter((entry) => entry.coinAmount > 0);

          if (localCoinBuys.length > 0) {
            setCoinPurchases(localCoinBuys);
            setCoinPurchasesError(null);
          } else {
            setCoinPurchasesError(
              err instanceof Error ? err.message : "Could not load coin purchases."
            );
          }
        }
      } finally {
        if (!cancelled) setCoinPurchasesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account?.accessToken, isAuthenticated, refreshFromApi, orders]);

  if (!account || !isAuthenticated) {
    return (
      <>
        <SiteHeader variant="solid" />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm space-y-3">
            <h1 className="text-xl font-semibold text-gray-900">You&apos;re not logged in</h1>
            <p className="text-sm text-gray-500">
              Log in from the menu in the top right to see your profile, wallet, and purchase
              history.
            </p>
            <Link href="/start-your-journey">
              <Button className="bg-gradient-to-r from-[#159895] to-[#1A5F7A]">
                Start your Gamana journey
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const saveProfile = async () => {
    const trimmed = nameDraft.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    setSaving(true);
    try {
      const updated = await updateUserProfile(
        { firstName, lastName },
        account.accessToken
      );
      updateProfile({
        fullName: updated.fullName || trimmed || undefined,
        email: updated.email || account.email,
      });
      setEditing(false);
      toast({ title: "Profile updated" });
    } catch (err) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Profile, wallet, and purchase history from your Gamana account.
          </p>
        </div>

        <section id="settings" className="space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-[#159895]" /> Profile
            </h2>
            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(account.fullName || "");
                  setEditing(true);
                }}
                className="text-sm font-semibold text-[#159895] hover:text-[#128a86] flex items-center gap-1"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-5">
            {editing ? (
              <div className="grid gap-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="acct-name">Full name</Label>
                  <Input
                    id="acct-name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Email and phone are managed through your Gamana login.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-gradient-to-r from-[#159895] to-[#1A5F7A]"
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">
                  {account.fullName?.trim() || "No name on file yet"}
                </p>
                {account.email?.includes("@") && (
                  <p className="text-sm text-gray-500">{account.email}</p>
                )}
                {account.phone && (
                  <p className="text-sm text-gray-500">{account.phone}</p>
                )}
                <p className="text-xs text-gray-400 capitalize">
                  Signed in via {account.method === "otp" ? "phone OTP" : account.method}
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="wallet" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#159895]" /> Wallet
          </h2>
          <WalletSummary balance={coinBalance} loading={walletLoading} />
        </section>

        <section id="purchases" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#159895]" /> Content purchases
          </h2>
          <PurchaseHistoryList
            purchases={purchases}
            loading={purchasesLoading}
            error={purchasesError}
          />
        </section>

        <section id="coins" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GamanaCoinIcon className="h-5 w-5 text-[#159895]" /> Coin purchases
          </h2>
          <CoinPurchaseHistoryList
            entries={coinPurchases}
            loading={coinPurchasesLoading}
            error={coinPurchasesError}
          />
        </section>

        <section id="personalization" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#159895]" /> Personalization
          </h2>
          <PersonalizationEditor />
        </section>

        <section className="pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
