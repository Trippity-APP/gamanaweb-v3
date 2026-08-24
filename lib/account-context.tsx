"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Corridor, Depth, TravelerProfile } from "@/lib/personalization";

export type AuthMethod = "google" | "apple" | "email";

export interface Account {
  email: string;
  method: AuthMethod;
  fullName?: string;
}

// Dates are stored as ISO strings (JSON-safe) rather than Date objects — convert to/from
// react-day-picker's DateRange at the UI layer.
export interface SavedTravelWindow {
  from?: string;
  to?: string;
}

/**
 * Full mirror of everything the Start Your Gamana Journey wizard collects (app/
 * start-your-journey/page.tsx's `Answers`, minus the account/auth fields which live on
 * `Account` instead). This is what the /account Personalization editor reads and writes,
 * so it needs to carry every variable the wizard asks for — not just a flattened summary.
 */
export interface SavedJourney {
  homeLocation?: string;
  corridor?: Corridor;
  groupType?: string | null;
  travelingWithKidsOrElders?: boolean;
  travelWindows?: SavedTravelWindow[];
  travelerProfiles?: TravelerProfile[];
  depth?: Depth;
  walkingTolerance?: string | null;
  heatSensitive?: boolean;
  additionalNotes?: string;
  /** Derived display label list, kept for the marketplace's JourneyGreeting banner. */
  interestLabels?: string[];
  savedAt?: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  /**
   * "unlock" orders are Coins-denominated (a Tour/Combo unlocked with Coins — see
   * unlockItem). Every other kind is real-currency (USD), placed through the cart:
   * "experience" (real-world bookings), "coins-purchase" (bought a Coin bundle), or
   * "mixed" (a cart checkout with both in it).
   */
  kind: "unlock" | "experience" | "coins-purchase" | "mixed";
  items: OrderLineItem[];
  total: number;
  placedAt: string;
}

/** A digital item (Tour or Combo) unlocked directly against the Coins balance — no cart. */
export interface UnlockedItem {
  id: string;
  type: "tour" | "combo";
  title: string;
  priceCoins: number;
  unlockedAt: string;
}

interface AccountContextValue {
  account: Account | null;
  journey: SavedJourney | null;
  orders: Order[];
  coinBalance: number;
  unlockedItems: UnlockedItem[];
  welcomeCoinsClaimed: boolean;
  login: (email: string, method: AuthMethod, fullName?: string) => void;
  logout: () => void;
  addOrder: (order: Order) => void;
  updateProfile: (patch: Partial<Pick<Account, "fullName" | "email">>) => void;
  updateJourney: (journey: SavedJourney) => void;
  /** Credits Coins to the balance — the only way Coins enter an account, from a real-money bundle purchase. */
  addCoins: (amount: number) => void;
  /** Deducts the item's price from the Coins balance and marks it unlocked. Fails (no-op) if the balance is short. */
  unlockItem: (item: { id: string; type: "tour" | "combo"; title: string; priceCoins: number }) => boolean;
  isUnlocked: (id: string, type: "tour" | "combo") => boolean;
  claimWelcomeCoins: () => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

const ACCOUNT_KEY = "gamanaAccount";
const JOURNEY_KEY = "gamanaJourney";
const ORDERS_KEY = "gamanaOrders";
const COIN_BALANCE_KEY = "gamanaCoinBalance";
const UNLOCKED_ITEMS_KEY = "gamanaUnlockedItems";
const WELCOME_COINS_KEY = "gamanaWelcomeCoinsClaimed";

/**
 * Mock session layer for the prototype — no real auth backend exists yet. Reads/writes
 * localStorage so "logged in" state and personalization status persist across pages, and
 * is what /marketplace's checkout nudges check before purchase. Once real accounts exist,
 * this is the seam to swap for a real session.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [journey, setJourney] = useState<SavedJourney | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [unlockedItems, setUnlockedItems] = useState<UnlockedItem[]>([]);
  const [welcomeCoinsClaimed, setWelcomeCoinsClaimed] = useState(false);

  useEffect(() => {
    try {
      const rawAccount = window.localStorage.getItem(ACCOUNT_KEY);
      if (rawAccount) setAccount(JSON.parse(rawAccount));
      const rawJourney = window.localStorage.getItem(JOURNEY_KEY);
      if (rawJourney) setJourney(JSON.parse(rawJourney));
      const rawOrders = window.localStorage.getItem(ORDERS_KEY);
      if (rawOrders) setOrders(JSON.parse(rawOrders));
      const rawBalance = window.localStorage.getItem(COIN_BALANCE_KEY);
      if (rawBalance) setCoinBalance(JSON.parse(rawBalance));
      const rawUnlocked = window.localStorage.getItem(UNLOCKED_ITEMS_KEY);
      if (rawUnlocked) setUnlockedItems(JSON.parse(rawUnlocked));
      const rawWelcome = window.localStorage.getItem(WELCOME_COINS_KEY);
      if (rawWelcome) setWelcomeCoinsClaimed(JSON.parse(rawWelcome));
    } catch {
      // ignore
    }

    // Keep in sync if another tab (e.g. start-your-journey) updates these keys.
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCOUNT_KEY) {
        try {
          setAccount(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          // ignore
        }
      }
      if (e.key === JOURNEY_KEY) {
        try {
          setJourney(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          // ignore
        }
      }
      if (e.key === ORDERS_KEY) {
        try {
          setOrders(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore
        }
      }
      if (e.key === COIN_BALANCE_KEY) {
        try {
          setCoinBalance(e.newValue ? JSON.parse(e.newValue) : 0);
        } catch {
          // ignore
        }
      }
      if (e.key === UNLOCKED_ITEMS_KEY) {
        try {
          setUnlockedItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore
        }
      }
      if (e.key === WELCOME_COINS_KEY) {
        try {
          setWelcomeCoinsClaimed(e.newValue ? JSON.parse(e.newValue) : false);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (email: string, method: AuthMethod, fullName?: string) => {
    setAccount((prev) => {
      // Don't clobber a name collected earlier (e.g. at account creation) with a blank
      // one from a later login() call (e.g. checkout's implicit login).
      const next: Account = { email, method, fullName: fullName || prev?.fullName };
      try {
        window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const logout = () => {
    setAccount(null);
    try {
      window.localStorage.removeItem(ACCOUNT_KEY);
    } catch {
      // ignore
    }
  };

  const updateProfile = (patch: Partial<Pick<Account, "fullName" | "email">>) => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const updateJourney = (nextJourney: SavedJourney) => {
    setJourney(nextJourney);
    try {
      window.localStorage.setItem(JOURNEY_KEY, JSON.stringify(nextJourney));
    } catch {
      // ignore
    }
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => {
      const next = [order, ...prev];
      try {
        window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const addCoins = (amount: number) => {
    if (amount <= 0) return;
    setCoinBalance((prev) => {
      const next = prev + amount;
      try {
        window.localStorage.setItem(COIN_BALANCE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const isUnlocked = (id: string, type: "tour" | "combo") =>
    unlockedItems.some((u) => u.id === id && u.type === type);

  const unlockItem: AccountContextValue["unlockItem"] = (item) => {
    if (isUnlocked(item.id, item.type)) return true;
    if (coinBalance < item.priceCoins) return false;

    setCoinBalance((prev) => {
      const next = prev - item.priceCoins;
      try {
        window.localStorage.setItem(COIN_BALANCE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    setUnlockedItems((prev) => {
      const next = [
        { id: item.id, type: item.type, title: item.title, priceCoins: item.priceCoins, unlockedAt: new Date().toISOString() },
        ...prev,
      ];
      try {
        window.localStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addOrder({
      id: `GMN-${Math.floor(100000 + Math.random() * 900000)}`,
      kind: "unlock",
      items: [{ title: item.title, quantity: 1, price: item.priceCoins }],
      total: item.priceCoins,
      placedAt: new Date().toISOString(),
    });

    return true;
  };

  const claimWelcomeCoins = () => {
    if (welcomeCoinsClaimed) return;
    addCoins(5);
    setWelcomeCoinsClaimed(true);
    try {
      window.localStorage.setItem(WELCOME_COINS_KEY, JSON.stringify(true));
    } catch {
      // ignore
    }
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        journey,
        orders,
        coinBalance,
        unlockedItems,
        welcomeCoinsClaimed,
        login,
        logout,
        addOrder,
        updateProfile,
        updateJourney,
        addCoins,
        unlockItem,
        isUnlocked,
        claimWelcomeCoins,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within an AccountProvider");
  return ctx;
}
