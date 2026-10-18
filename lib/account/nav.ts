import { Heart, Library, Settings, Shield, Ticket, User, Home, CreditCard } from "@/components/icons";

export type AccountNavItem = { href: string; label: string; icon: typeof User };

/** Account sections, in the order the account shell shows them. */
export const ACCOUNT_SECTIONS: AccountNavItem[] = [
  { href: "/account/", label: "Overview", icon: Home },
  { href: "/account/profile/", label: "Profile", icon: User },
  { href: "/account/wallet/", label: "Wallet", icon: CreditCard },
  { href: "/account/collection/", label: "My Collection", icon: Library },
  { href: "/account/bookings/", label: "Bookings", icon: Ticket },
  { href: "/account/wishlist/", label: "Wishlist", icon: Heart },
  { href: "/account/preferences/", label: "Preferences", icon: Settings },
  { href: "/account/safety/", label: "Safety", icon: Shield },
];

/** Header dropdown and mobile drawer items (spec W1.4). */
export const ACCOUNT_MENU: AccountNavItem[] = [
  { href: "/account/", label: "My account", icon: User },
  { href: "/account/collection/", label: "My collection", icon: Library },
  { href: "/account/bookings/", label: "Bookings", icon: Ticket },
  { href: "/account/wishlist/", label: "Wishlist", icon: Heart },
  { href: "/account/wallet/", label: "Wallet", icon: CreditCard },
  { href: "/account/preferences/", label: "Preferences", icon: Settings },
];

export function initialsFor(firstName: string, lastName: string, fallback = ""): string {
  const initials = `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase();
  return initials || fallback.trim()[0]?.toUpperCase() || "?";
}
