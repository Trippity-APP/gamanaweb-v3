"use client";

import { JourneyGreeting } from "@/components/JourneyGreeting";
import { JourneyCTA } from "@/components/marketplace/JourneyCTA";
import { useAccount } from "@/lib/account-context";

export function MarketplaceSignedInHeroExtras() {
  const { account } = useAccount();

  if (!account) return null;

  return (
    <>
      <div className="opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
        <JourneyGreeting />
      </div>
      <div className="flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <JourneyCTA />
      </div>
    </>
  );
}
