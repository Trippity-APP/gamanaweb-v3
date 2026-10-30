"use client";

import { JourneyGreeting } from "@/components/JourneyGreeting";
import { useAuth } from "@/lib/auth/auth-context";

export function MarketplaceSignedInHeroExtras() {
  const { status } = useAuth();

  if (status !== "authenticated") return null;

  return (
    <div className="opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
      <JourneyGreeting />
    </div>
  );
}
