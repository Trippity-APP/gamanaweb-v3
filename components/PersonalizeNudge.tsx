"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, LogIn, Check } from "lucide-react";
import { useAccount } from "@/lib/account-context";

/**
 * Shown at checkout time (both the Coins cart and the Experiences cart) when the user
 * hasn't been through Start Your Gamana Journey and/or isn't "logged in" yet. Never
 * blocks the purchase — Continue to Payment always works. Login here is mocked
 * (localStorage via AccountProvider), same prototype caveat as the rest of the flow.
 */
export function PersonalizeNudge({ onContinue }: { onContinue: () => void }) {
  const { account, journey, login } = useAccount();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");

  const needsPersonalization = !journey;
  const needsAccount = !account;

  if (!needsPersonalization && !needsAccount) return null;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-gray-900">Before you check out</p>
        <p className="text-xs text-gray-500">A couple of things could make this better for you — totally optional.</p>
      </div>

      {needsPersonalization && (
        <Link href="/start-your-journey" className="block">
          <Button type="button" variant="outline" className="w-full justify-start gap-3 h-auto py-3">
            <Sparkles className="h-4 w-4 text-[#159895] shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Personalize your recommendations</p>
              <p className="text-xs text-gray-500">A few quick questions about who&apos;s traveling</p>
            </div>
          </Button>
        </Link>
      )}

      {needsAccount ? (
        !showEmailForm ? (
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
        )
      ) : (
        <p className="text-xs text-[#159895] font-medium flex items-center gap-1.5 justify-center">
          <Check className="h-3.5 w-3.5" /> Logged in as {account?.email}
        </p>
      )}

      <Button
        type="button"
        onClick={onContinue}
        className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A]"
      >
        Continue to Payment
      </Button>
      <p className="text-[11px] text-gray-400 text-center">
        Prototype note: login here doesn&apos;t create a real account yet.
      </p>
    </div>
  );
}
