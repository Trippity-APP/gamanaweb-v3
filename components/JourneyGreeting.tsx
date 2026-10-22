"use client";

import { useJourney } from "@/lib/journey-context";

/** Short greeting built from what the traveller told Start Your Gamana Journey this visit. */
export function JourneyGreeting() {
  const { journey } = useJourney();

  if (!journey || (!journey.interestLabels?.length && !journey.groupType)) return null;

  const interestText = journey.interestLabels?.length
    ? ` picked for your interest in ${journey.interestLabels.join(", ")}`
    : "";
  const groupText = journey.groupType ? `, traveling as ${journey.groupType.toLowerCase()}` : "";

  return (
    <p className="text-sm text-white/85">
      Welcome back{groupText}, here&apos;s what&apos;s{interestText || " picked for you"}.
    </p>
  );
}
