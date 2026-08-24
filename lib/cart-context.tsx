"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItemKind = "experience" | "coins";

export interface CartItem {
  id: string;
  kind: CartItemKind;
  title: string;
  image: string;
  /** Real currency (USD) — everything in this cart is real money, never Coins. */
  price: number;
  quantity: number;
  /** Experience items only. */
  operator?: string;
  /** Coin-bundle items only — how many Coins one unit of this line item grants. */
  coinsGranted?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, kind: CartItemKind) => void;
  updateQuantity: (id: string, kind: CartItemKind, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "gamanaCart";

/**
 * The single real-money cart for the marketplace — real-world Experience bookings and
 * Gamana Coin bundle purchases, both paid via Card/RazorPay. Tours, Topics, and Combos
 * never appear here: they're digital content, unlocked directly against a traveler's Coin
 * balance (see lib/account-context.tsx's unlockItem), with no cart step at all. Coin
 * bundles bought here are the only way real money converts into Coins.
 *
 * Prototype cart — persisted to localStorage, not a real backend. Once a real payment
 * integration exists (likely via Bókun for Experiences, per the draft operator
 * partnership, plus a real IAP/payment-gateway flow for Coin bundles), this is the seam
 * where it would slot in.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.kind === item.kind);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.kind === item.kind ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id, kind) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.kind === kind)));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (id, kind, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => !(i.id === id && i.kind === kind));
      return prev.map((i) => (i.id === id && i.kind === kind ? { ...i, quantity } : i));
    });
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
