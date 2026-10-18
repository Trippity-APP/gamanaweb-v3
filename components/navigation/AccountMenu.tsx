"use client";

import Link from "next/link";
import { LogIn, LogOut, User as UserIcon } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";

function initialsFor(firstName: string, lastName: string, fallback: string) {
  const initials = `${firstName.trim()[0] ?? ""}${lastName.trim()[0] ?? ""}`.toUpperCase();
  return initials || fallback.trim()[0]?.toUpperCase() || "?";
}

/**
 * Header account control, backed by the real web session (lib/auth/auth-context).
 * Hidden entirely while the web accounts flag is off.
 */
export function AccountMenu() {
  const { status, user, balance, openLogin, logout } = useAuth();

  if (!webAccountsEnabled) return null;

  if (status !== "authenticated" || !user) {
    return (
      <button
        type="button"
        onClick={() => openLogin()}
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink hover:text-brand-700"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Log in
      </button>
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-xs font-bold text-white"
          aria-label="Account menu"
        >
          {initialsFor(user.firstName, user.lastName, user.email || user.phone)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold text-ink">{displayName || "Your Gamana account"}</p>
          {(user.email || user.phone) && (
            <p className="truncate text-xs font-normal text-ink-soft">{user.email || `${user.countryCode} ${user.phone}`}</p>
          )}
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-ink">
            <GamanaCoinIcon className="h-3 w-3" aria-hidden /> {(balance ?? 0).toLocaleString()} coins
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account/" className="flex cursor-pointer items-center gap-2">
            <UserIcon className="h-4 w-4 text-ink-soft" /> My account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()} className="flex cursor-pointer items-center gap-2">
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
