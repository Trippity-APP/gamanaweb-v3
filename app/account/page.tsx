"use client";

import { useState } from "react";
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
  CreditCard,
  LogOut,
  Headphones,
  Briefcase,
  Coins,
  Pencil,
} from "lucide-react";
import { useAccount } from "@/lib/account-context";
import { PersonalizationEditor } from "@/components/account/PersonalizationEditor";

/**
 * Prototype account settings page — profile, saved personalization, order/booking
 * history, and mock payment methods. All state is the same localStorage-backed
 * AccountProvider used across the site; nothing here is a real backend yet.
 */
const orderMeta: Record<string, { icon: typeof Headphones; label: string; coinsDenominated: boolean }> = {
  unlock: { icon: Headphones, label: "Audio Tour", coinsDenominated: true },
  experience: { icon: Briefcase, label: "Experience", coinsDenominated: false },
  "coins-purchase": { icon: Coins, label: "Coin Bundle", coinsDenominated: false },
  mixed: { icon: ShoppingBag, label: "Order", coinsDenominated: false },
};

export default function AccountPage() {
  const { account, orders, coinBalance, updateProfile, logout } = useAccount();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(account?.fullName || "");
  const [emailDraft, setEmailDraft] = useState(account?.email || "");

  if (!account) {
    return (
      <>
        <SiteHeader variant="solid" />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm space-y-3">
            <h1 className="text-xl font-semibold text-gray-900">You&apos;re not logged in</h1>
            <p className="text-sm text-gray-500">
              Log in from the menu in the top right, or start your Gamana journey to create an account.
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

  const saveProfile = () => {
    updateProfile({
      fullName: nameDraft.trim() || undefined,
      email: emailDraft.trim() || account.email,
    });
    setEditing(false);
  };

  return (
    <>
      <SiteHeader variant="solid" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your profile, personalization, bookings, and payment details.
          </p>
        </div>

        {/* Profile */}
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
                  setEmailDraft(account.email);
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
                  <Input id="acct-name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acct-email">Email</Label>
                  <Input id="acct-email" type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveProfile} className="bg-gradient-to-r from-[#159895] to-[#1A5F7A]">
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">{account.fullName?.trim() || "No name on file yet"}</p>
                <p className="text-sm text-gray-500">{account.email}</p>
                <p className="text-xs text-gray-400 capitalize">Signed in via {account.method}</p>
              </div>
            )}
          </div>
        </section>

        {/* Personalization */}
        <section id="personalization" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#159895]" /> Personalization
          </h2>
          <PersonalizationEditor />
        </section>

        {/* Bookings */}
        <section id="bookings" className="space-y-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#159895]" /> My bookings
          </h2>
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {orders.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">No bookings yet — your Tours, Combos, and Experiences will show up here.</p>
            ) : (
              orders.map((order) => {
                const meta = orderMeta[order.kind] ?? orderMeta.mixed;
                const Icon = meta.icon;
                return (
                  <div key={order.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 text-[#159895] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">
                          {order.items.map((i) => `${i.title}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.placedAt).toLocaleDateString()} · {meta.label}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {meta.coinsDenominated ? `${order.total} Coins` : `$${order.total.toFixed(2)}`}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Payment methods */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#159895]" /> Payment methods
          </h2>
          <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Coins className="h-4 w-4 text-amber-500" /> Gamana Coins balance
              </div>
              <p className="text-sm font-bold text-amber-800">{coinBalance.toLocaleString()} Coins</p>
            </div>
            <p className="text-xs text-gray-500">
              Buy more Coins from the marketplace — that&apos;s the only way real currency
              converts into Coins. Spending Coins to unlock a Tour or Combo happens instantly
              from the catalog, no separate checkout.
            </p>
            <p className="text-sm text-gray-500">
              No card or UPI details are stored here yet. Real payment methods for Experiences
              (Credit Card / RazorPay) will be manageable from this page once payment
              processing is wired up.
            </p>
          </div>
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
