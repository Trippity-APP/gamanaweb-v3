"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, ShoppingBag, Sparkles, Settings, LogOut, User as UserIcon } from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAccount } from "@/lib/account-context";

function initialsFor(name: string | undefined, email: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  return email[0]?.toUpperCase() || "?";
}

/**
 * Header account control. Logged-out: a "Log in" trigger with the same mock
 * Google/Apple/email options used at checkout (PersonalizeNudge) — no separate login
 * page exists yet, so this is the one real entry point outside of Start Your Journey.
 * Logged-in: standard account dropdown (profile/settings, bookings, personalization,
 * log out) per the founder's explicit request for "standard menu options for a logged
 * in user."
 */
export function AccountMenu() {
  const { account, orders, coinBalance, login, logout } = useAccount();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");

  const triggerBase =
    "inline-flex items-center gap-2 text-sm font-medium px-2 py-1.5 rounded-md transition-colors text-gray-700 hover:text-[#1A5F7A] hover:bg-[#57C5B6]/10";

  if (!account) {
    return (
      <Popover onOpenChange={(open) => !open && setShowEmailForm(false)}>
        <PopoverTrigger asChild>
          <button type="button" className={triggerBase} aria-label="Log in">
            <LogIn className="h-4 w-4" />
            Log in
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-900">Log in to Gamana</p>
            <p className="text-xs text-gray-500">Same account as the app, your bookings and preferences carry over.</p>
          </div>

          {!showEmailForm ? (
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => login("you@gmail.com", "google")}
                className="justify-start gap-3 h-11"
              >
                <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  G
                </span>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => login("you@icloud.com", "apple")}
                className="justify-start gap-3 h-11"
              >
                <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  A
                </span>
                Continue with Apple
              </Button>
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="text-sm font-semibold text-[#159895] hover:text-[#128a86] flex items-center gap-1 justify-center pt-1"
              >
                <LogIn className="h-4 w-4" /> Continue with email
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
              />
              <Button
                type="button"
                onClick={() => {
                  if (!email.trim()) return;
                  login(email.trim(), "email");
                }}
                className="bg-[#159895] hover:bg-[#128a86] shrink-0"
              >
                Log in
              </Button>
            </div>
          )}

          <div className="pt-1 border-t border-gray-100 text-center">
            <Link href="/start-your-journey" className="text-xs text-gray-500 hover:text-[#159895]">
              New here? Start your Gamana journey instead
            </Link>
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            Prototype note: login here doesn&apos;t create a real account yet.
          </p>
        </PopoverContent>
      </Popover>
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
          <p className="text-xs text-gray-400 font-normal truncate">{account.email}</p>
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
          <Link href="/account#bookings" className="flex items-center gap-2 cursor-pointer">
            <ShoppingBag className="h-4 w-4 text-gray-400" />
            My bookings{orders.length > 0 ? ` (${orders.length})` : ""}
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
        <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
