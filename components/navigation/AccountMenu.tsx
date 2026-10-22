"use client";

import Link from "next/link";
import { LogIn, LogOut } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CoinChip } from "@/components/account/CoinChip";
import { ACCOUNT_MENU, initialsFor } from "@/lib/account/nav";
import { useAuth } from "@/lib/auth/auth-context";
import { webAccountsEnabled } from "@/lib/flags";

/**
 * Header account control: "Log in" when anonymous; coin chip + avatar menu when logged in.
 * Always occupies a 120px slot so the header doesn't shift while the session restores.
 */
export function AccountMenu() {
  const { status, user, openLogin, logout } = useAuth();

  if (!webAccountsEnabled) return null;

  if (status === "loading") {
    return (
      <div className="flex sm:min-w-[120px] items-center justify-end gap-2" aria-hidden>
        <Skeleton className="hidden h-10 w-16 rounded-full sm:block" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex sm:min-w-[120px] justify-end">
        <button
          type="button"
          onClick={() => openLogin()}
          className="focus-ring inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink hover:text-brand-700"
        >
          <LogIn className="h-4 w-4" aria-hidden />
          Log in
        </button>
      </div>
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return (
    <div className="flex sm:min-w-[120px] items-center justify-end gap-2">
      <CoinChip className="hidden sm:inline-flex" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="focus-ring shrink-0 rounded-full" aria-label="Account menu">
            <Avatar className="h-11 w-11">
              {user.profilePic && <AvatarImage src={user.profilePic} alt="" />}
              <AvatarFallback className="bg-gradient-to-r from-brand-600 to-brand-800 text-xs font-bold text-white">
                {initialsFor(user.firstName, user.lastName, user.email || user.phone)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl">
          <DropdownMenuLabel>
            <p className="truncate text-sm font-semibold text-ink">{displayName || "Your Gamana account"}</p>
            {(user.email || user.phone) && (
              <p className="truncate text-xs font-normal text-ink-soft">{user.email || `${user.countryCode} ${user.phone}`}</p>
            )}
          </DropdownMenuLabel>
          <div className="px-2 pb-2 sm:hidden">
            <CoinChip />
          </div>
          <DropdownMenuSeparator />
          {ACCOUNT_MENU.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="flex min-h-[44px] cursor-pointer items-center gap-2">
                <Icon className="h-4 w-4 text-ink-soft" aria-hidden /> {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void logout()} className="flex min-h-[44px] cursor-pointer items-center gap-2">
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
