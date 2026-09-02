"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Minus, Plus, X, Check, CreditCard, Smartphone as UpiIcon, Smartphone, MapPin, Coins as CoinsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart, type CartItemKind } from "@/lib/cart-context";
import { useAccount } from "@/lib/account-context";
import { PersonalizeNudge } from "@/components/PersonalizeNudge";
import { useStoreUrl } from "@/hooks/use-store-url";
import { trackStoreClick } from "@/lib/analytics";

type PaymentMethod = "card" | "upi";

/**
 * The single real-money cart for the marketplace — real-world Experience bookings and
 * Gamana Coin bundle purchases, both paid in real currency (Card/RazorPay). Tours, Topics,
 * and Combos never pass through here: they're unlocked directly against a traveler's Coin
 * balance with a single click, no cart involved. A Coin-bundle purchase here is the only
 * way real money converts into Coins — completing checkout credits the balance instantly.
 */
export function Cart() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart();
  const { account, journey, addOrder, addCoins } = useAccount();
  const { url: storeUrl, platform } = useStoreUrl();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"nudge" | "payment" | "confirmed">("payment");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bookingNumber, setBookingNumber] = useState("");
  const [coinsCredited, setCoinsCredited] = useState(0);

  const hasCoinItems = items.some((i) => i.kind === "coins");
  const hasExperienceItems = items.some((i) => i.kind === "experience");

  const openCheckout = () => {
    setCartOpen(false);
    setCheckoutStep(!account || !journey ? "nudge" : "payment");
    setPaymentMethod(null);
    setCheckoutOpen(true);
  };

  const placeOrder = () => {
    const id = `GMX-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingNumber(id);

    const kind: "experience" | "coins-purchase" | "mixed" =
      hasCoinItems && hasExperienceItems ? "mixed" : hasCoinItems ? "coins-purchase" : "experience";

    addOrder({
      id,
      kind,
      items: items.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
      total: subtotal,
      placedAt: new Date().toISOString(),
    });

    const totalCoins = items
      .filter((i) => i.kind === "coins")
      .reduce((sum, i) => sum + (i.coinsGranted ?? 0) * i.quantity, 0);
    if (totalCoins > 0) {
      addCoins(totalCoins);
      setCoinsCredited(totalCoins);
    } else {
      setCoinsCredited(0);
    }

    setCheckoutStep("confirmed");
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    if (checkoutStep === "confirmed") clearCart();
  };

  const itemLabel = (kind: CartItemKind) => (kind === "coins" ? "Coin Bundle" : "Experience");

  return (
    <>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Cart ({itemCount})</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-gray-500">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
              <p>Your cart is empty.</p>
              <p className="text-sm text-gray-400">
                Add a real-world Experience or a Coin bundle to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => (
                  <div key={`${item.kind}-${item.id}`} className="flex gap-3 border-b border-gray-100 pb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                      {item.kind === "coins" ? (
                        <CoinsIcon className="h-7 w-7 text-amber-500" />
                      ) : (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.kind === "coins" ? itemLabel(item.kind) : item.operator}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.id, item.kind, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-orange-500 hover:text-orange-500"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.kind, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-orange-500 hover:text-orange-500"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.id, item.kind)}
                      className="text-gray-300 hover:text-red-500 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Paid in real currency. Coin bundles credit your balance instantly on checkout.
                  Tours, Topics, and Combos unlock directly from the catalog, no cart needed.
                </p>
                <Button
                  onClick={openCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  Checkout
                </Button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-xs text-gray-400 hover:text-red-500"
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={(open) => (open ? setCheckoutOpen(true) : closeCheckout())}>
        <DialogContent className="sm:max-w-md">
          {checkoutStep === "nudge" && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Before you check out</DialogTitle>
              </DialogHeader>
              <PersonalizeNudge onContinue={() => setCheckoutStep("payment")} />
            </>
          )}

          {checkoutStep === "payment" && (
            <>
              <DialogHeader>
                <DialogTitle>Pay for your order</DialogTitle>
              </DialogHeader>

              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                {items.map((item) => (
                  <div key={`${item.kind}-${item.id}`} className="flex justify-between text-gray-600">
                    <span className="truncate pr-2">
                      {item.title} {item.quantity > 1 ? `× ${item.quantity}` : ""}
                    </span>
                    <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                <ShoppingBag className="h-3.5 w-3.5" />
                Card / RazorPay
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    paymentMethod === "card" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Credit Card</p>
                    <p className="text-xs text-gray-500">International travelers</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    paymentMethod === "upi" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <UpiIcon className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">RazorPay</p>
                    <p className="text-xs text-gray-500">UPI, cards & netbanking, for travelers in India</p>
                  </div>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 flex items-start gap-1">
                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                Payment method is picked based on where you&apos;re traveling from. Looking to
                unlock a Tour or Topic instead? Those use your Coins balance directly, no
                payment screen needed.
              </p>

              <Button
                onClick={placeOrder}
                disabled={!paymentMethod}
                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Confirm & Pay
              </Button>
              <p className="text-[11px] text-gray-400 text-center">
                Prototype note: no real payment is processed here. A real integration
                (likely via Bókun for Experiences, plus a real payment gateway for Coin
                bundles) would need a backend this static site doesn&apos;t have yet.
              </p>
            </>
          )}

          {checkoutStep === "confirmed" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-green-600" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Order Confirmed</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                Order <span className="font-semibold text-gray-900">{bookingNumber}</span> is set.
              </p>
              {coinsCredited > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 flex items-center gap-2 justify-center">
                  <CoinsIcon className="h-4 w-4 text-amber-500" />
                  {coinsCredited} Coins added, already live in your Gamana app account, ready to unlock Tours and Combos.
                </div>
              )}
              {hasExperienceItems && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 flex items-center gap-2 justify-center">
                  <Smartphone className="h-4 w-4 text-orange-500" />
                  You&apos;ll get your booking details and the operator&apos;s contact in the app.
                </div>
              )}
              <Button
                onClick={closeCheckout}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Done
              </Button>
              <p className="text-xs text-gray-400">
                Don&apos;t have the app yet?{" "}
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "cart-confirmation")}
                  className="font-semibold text-[#159895] hover:text-[#128a86] underline underline-offset-2"
                >
                  Get it free
                </a>
              </p>
              <p className="text-[11px] text-gray-400">
                Prototype note: this order isn&apos;t saved anywhere real yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
