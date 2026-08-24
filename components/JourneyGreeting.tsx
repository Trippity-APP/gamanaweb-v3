"use client";

import { useEffect, useState } from "react";

interface SavedJourney {
  homeLocation?: string;
  corridor?: "inbound" | "domestic" | "outbound" | null;
  groupType?: string | null;
  interestLabels?: string[];
  savedAt?: string;
}

/**
 * Reads the lightweight personalization signal saved by /start-your-journey
 * (localStorage key "gamanaJourney") and, if present, renders a short greeting.
 * Prototype stand-in for real account-based personalization — once accounts and a
 * backend profile exist, this should read from the server instead of localStorage.
 */
export function JourneyGreeting() {
  const [journey, setJourney] = useState<SavedJourney | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("gamanaJourney");
      if (raw) setJourney(JSON.parse(raw));
    } catch {
      // Private browsing or storage disabled — fall back to the generic hero.
    }
  }, []);

  if (!journey || (!journey.interestLabels?.length && !journey.groupType)) return null;

  const interestText = journey.interestLabels?.length
    ? ` picked for your interest in ${journey.interestLabels.join(", ")}`
    : "";
  const groupText = journey.groupType ? `, traveling as ${journey.groupType.toLowerCase()}` : "";

  return (
    <p className="text-sm text-white/85">
      Welcome back{groupText} — here&apos;s what&apos;s{interestText || " picked for you"}.
    </p>
  );
}
