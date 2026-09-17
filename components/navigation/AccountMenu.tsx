"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, ShoppingBag, Sparkles, Settings, LogOut, User as UserIcon, Coins } from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAccount } from "@/lib/account-context";

function initialsFor(name: string | undefined, email: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email[0]?.toUpperCase() || "?";
}

/**
 * Header account control. Uses the same Gamana backend auth as the mobile app
 * (phone OTP or email/password).
 */
export function AccountMenu() {
  const { account, coinBalance, logout, isAuthenticated } = useAccount();
  const [loginOpen, setLoginOpen] = useState(false);

  const triggerBase =
    "inline-flex items-center gap-2 text-sm font-medium px-2 py-1.5 rounded-md transition-colors text-gray-700 hover:text-[#1A5F7A] hover:bg-[#57C5B6]/10";

  if (!account || !isAuthenticated) {
    return (
      <>
        <button
          type="button"
          className={triggerBase}
          aria-label="Log in"
          onClick={() => setLoginOpen(true)}
        >
          <LogIn className="h-4 w-4" />
          Log in
        </button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white"
          aria-label="Account menu"
        >
          {initialsFor(account.fullName, account.email)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {account.fullName?.trim() || "Your Gamana account"}
          </p>
          <p className="text-xs text-gray-400 font-normal truncate">
            {account.email}
            {account.phone ? ` · ${account.phone}` : ""}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-amber-700">
            <GamanaCoinIcon className="h-3 w-3" aria-hidden /> {coinBalance.toLocaleString()} Coins
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2 cursor-pointer">
            <UserIcon className="h-4 w-4 text-gray-400" /> Profile & settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account#purchases" className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="h-4 w-4 text-gray-400" />
            Content purchases
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account#coins" className="flex items-center gap-2 cursor-pointer">
            <Coins className="h-4 w-4 text-gray-400" />
            Coin purchases
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account#personalization" className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="h-4 w-4 text-gray-400" /> Update personalization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account#settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-gray-400" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
