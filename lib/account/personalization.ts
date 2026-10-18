import { apiFetch } from "@/lib/api/client";
import type { SavedJourney } from "@/lib/journey-context";
import type { TravelerProfile } from "@/lib/personalization";

export type PersonalizationDoc = Record<string, unknown> & {
  narrators?: Record<string, unknown>;
  notifications?: { push?: boolean; email?: boolean; sms?: boolean };
  travel_profile?: Record<string, unknown>;
};

/** Top-level keys the web may write. Legacy onboarding placeholders (`language`, `voice`, `intrests`) are never sent. */
type WritableKey = "narrators" | "notifications" | "travel_profile";

export function fetchPersonalization(): Promise<PersonalizationDoc> {
  return apiFetch<PersonalizationDoc>("/personalization/", { auth: "required" }).then((doc) => doc ?? {});
}

export function patchPersonalization(body: Partial<Pick<PersonalizationDoc, WritableKey>>): Promise<PersonalizationDoc> {
  return apiFetch<PersonalizationDoc>("/personalization/update", { method: "PATCH", auth: "required", body });
}

/**
 * Merge rule for `narrators`: start from the stored object, change only the edited keys, send the
 * whole object back so keys the app owns survive.
 */
export function mergeNarrators(current: Record<string, unknown> | undefined, changes: Record<string, unknown>): Record<string, unknown> {
  const base = { ...(current ?? {}) };
  for (const [key, value] of Object.entries(changes)) {
    const existing = base[key];
    base[key] =
      value && typeof value === "object" && !Array.isArray(value) && existing && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>), ...(value as Record<string, unknown>) }
        : value;
  }
  return base;
}

export function narratorLanguages(doc: PersonalizationDoc | null): string[] {
  const languages = (doc?.narrators?.languages as { codes?: unknown } | undefined)?.codes;
  return Array.isArray(languages) ? languages.filter((c): c is string => typeof c === "string") : [];
}

/** The voice persona key as the app stores it; falls back to the common spellings. */
export const VOICE_KEYS = ["voice_persona_id", "voice_persona", "persona_id"] as const;

export function narratorVoice(doc: PersonalizationDoc | null): { key: string; value: string | null } {
  const narrators = doc?.narrators ?? {};
  for (const key of VOICE_KEYS) {
    if (key in narrators) return { key, value: (narrators[key] as string | null) ?? null };
  }
  return { key: VOICE_KEYS[0], value: null };
}

/** Wizard/editor shape → backend `travel_profile` (spec W2.4 mapping). */
export function journeyToTravelProfile(journey: SavedJourney, homeCity?: string | null): Record<string, unknown> {
  return {
    home_location: journey.homeLocation ?? "",
    corridor: journey.corridor ?? null,
    group_type: journey.groupType ?? null,
    travelingWithKidsOrElders: journey.travelingWithKidsOrElders ?? false,
    travelWindows: journey.travelWindows ?? [],
    travellers: journey.travelerProfiles ?? [],
    depth: journey.depth ?? null,
    walkingTolerance: journey.walkingTolerance ?? null,
    heatSensitive: journey.heatSensitive ?? false,
    notes: journey.additionalNotes ?? "",
    home_city: homeCity ?? journey.homeCity ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function travelProfileToJourney(tp: Record<string, unknown> | undefined | null): SavedJourney | null {
  if (!tp || Object.keys(tp).length === 0) return null;
  const travellers = Array.isArray(tp.travellers) ? (tp.travellers as TravelerProfile[]) : [];
  return {
    homeLocation: (tp.home_location as string) ?? "",
    corridor: (tp.corridor as SavedJourney["corridor"]) ?? null,
    groupType: (tp.group_type as string | null) ?? null,
    travelingWithKidsOrElders: Boolean(tp.travelingWithKidsOrElders),
    travelWindows: Array.isArray(tp.travelWindows) ? (tp.travelWindows as SavedJourney["travelWindows"]) : [],
    travelerProfiles: travellers,
    depth: (tp.depth as SavedJourney["depth"]) ?? null,
    walkingTolerance: (tp.walkingTolerance as string | null) ?? null,
    heatSensitive: Boolean(tp.heatSensitive),
    additionalNotes: (tp.notes as string) ?? "",
    homeCity: (tp.home_city as string | null) ?? undefined,
    savedAt: (tp.updated_at as string) ?? undefined,
  };
}

export function saveTravelProfile(journey: SavedJourney): Promise<PersonalizationDoc> {
  return patchPersonalization({ travel_profile: journeyToTravelProfile(journey) });
}
