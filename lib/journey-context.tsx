"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Corridor, Depth, TravelerProfile } from "@/lib/personalization";

// Dates are stored as ISO strings rather than Date objects — convert to/from
// react-day-picker's DateRange at the UI layer.
export interface SavedTravelWindow {
  from?: string;
  to?: string;
}

/**
 * Everything the Start Your Gamana Journey wizard collects. Held in memory for the
 * current visit only — never in browser storage. Backed by the backend
 * `personalization.travel_profile` once that lands (B7 / W2.4).
 */
export interface SavedJourney {
  homeLocation?: string;
  corridor?: Corridor;
  groupType?: string | null;
  travelingWithKidsOrElders?: boolean;
  travelWindows?: SavedTravelWindow[];
  travelerProfiles?: TravelerProfile[];
  depth?: Depth;
  walkingTolerance?: string | null;
  heatSensitive?: boolean;
  additionalNotes?: string;
  /** Derived display label list, kept for the marketplace's JourneyGreeting banner. */
  interestLabels?: string[];
  savedAt?: string;
}

interface JourneyContextValue {
  journey: SavedJourney | null;
  updateJourney: (journey: SavedJourney) => void;
}

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, setJourney] = useState<SavedJourney | null>(null);
  return <JourneyContext.Provider value={{ journey, updateJourney: setJourney }}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within a JourneyProvider");
  return ctx;
}

export function hasSavedJourney(journey: SavedJourney | null): boolean {
  return Boolean(
    journey &&
      (journey.homeLocation ||
        journey.corridor ||
        journey.groupType ||
        (journey.interestLabels && journey.interestLabels.length > 0)),
  );
}
