"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAccount } from "@/lib/account-context";

/**
 * "Start Your Gamana Journey" only makes sense for a signed-in visitor who hasn't
 * personalized yet — showing it to someone who already has saved preferences implies
 * they haven't done something they have. Once a journey exists, this renders nothing:
 * "Update your preferences" already lives one click away in the account menu
 * (components/navigation/AccountMenu.tsx → /account#personalization), so repeating it
 * as a floating hero button was a redundant second entry point to the same settings
 * screen, not a genuine hero-level action.
 */
export function JourneyCTA() {
  const { journey } = useAccount();

  const hasJourney = Boolean(
    journey &&
      (journey.homeLocation ||
        journey.corridor ||
        journey.groupType ||
        (journey.interestLabels && journey.interestLabels.length > 0))
  );

  if (hasJourney) {
    return null;
  }

  return (
    <Link href="/start-your-journey">
      <Button size="sm" variant="secondary" className="bg-white text-[#1A5F7A] hover:bg-white/90 rounded-full gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Start Your Gamana Journey
      </Button>
    </Link>
  );
}
