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

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});

export function narratorLanguages(doc: PersonalizationDoc | null): string[] {
  const languages = (doc?.narrators?.languages as { codes?: unknown } | undefined)?.codes;
  return Array.isArray(languages) ? languages.filter((c): c is string => typeof c === "string") : [];
}

/** The app's voice choice: `narrators.voice_preferences.default.voice_codes` (TTS voice codes). */
export function narratorVoiceCodes(doc: PersonalizationDoc | null): string[] {
  const codes = obj(obj(obj(doc?.narrators).voice_preferences).default).voice_codes;
  return Array.isArray(codes) ? codes.filter((c): c is string => typeof c === "string") : [];
}

/**
 * `narrators` is replaced as one object and only keeps `languages` + `voice_preferences`, so build it
 * from the live doc. `languages` is always sent (without it the server resets to English) and carries
 * codes only, because stored `labels` would win over the edited codes.
 */
export function buildNarrators(live: PersonalizationDoc | null, codes: string[], voiceCode: string | null): Obj {
  const vp = obj(obj(live?.narrators).voice_preferences);
  const defaults = obj(vp.default);
  return {
    languages: { codes },
    voice_preferences: { ...vp, default: { ...defaults, voice_codes: voiceCode ? [voiceCode] : [] } },
  };
}

/** The UI keeps display labels; the backend `TravelProfile` only accepts these enum values. */
const GROUP_TYPE_VALUES: Record<string, string> = {
  "Just me": "solo",
  "A couple": "couple",
  "Family with kids": "family",
  "Multi-generational group": "group",
  Friends: "friends",
};

const WALKING_TOLERANCE_VALUES: Record<string, string> = {
  "Short strolls only": "low",
  "Comfortable with a few hours on foot": "medium",
  "Happy to walk all day": "high",
};

function toEnum(map: Record<string, string>, label: string | null | undefined): string | null {
  if (!label) return null;
  return map[label] ?? (Object.values(map).includes(label) ? label : null);
}

function toLabel(map: Record<string, string>, value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return Object.keys(map).find((label) => map[label] === value) ?? (value in map ? value : null);
}

/** `TravelWindow` fields are calendar dates; the UI stores the local-midnight instant as ISO. */
function toCalendarDate(iso: string | undefined): string | null {
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromCalendarDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toISOString();
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

/** `home_city` is a `{ name, country, latitude, longitude }` object; older docs stored a plain string. */
export function travelProfileHomeCity(tp: Record<string, unknown> | undefined | null): string | null {
  const home = tp?.home_city;
  if (typeof home === "string") return home.trim() || null;
  if (home && typeof home === "object") {
    const name = (home as { name?: unknown }).name;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  }
  return null;
}

const inRange = (n: number | undefined, limit: number): n is number => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= limit;

function homeCityObject(name: string, geo: SavedJourney["homeCityGeo"]): Record<string, unknown> {
  const out: Record<string, unknown> = { name: name.slice(0, 120) };
  if (geo?.country) out.country = geo.country.slice(0, 120);
  if (inRange(geo?.latitude, 90) && inRange(geo?.longitude, 180)) {
    out.latitude = geo.latitude;
    out.longitude = geo.longitude;
  }
  return out;
}

function homeCityGeoOf(tp: Record<string, unknown>): SavedJourney["homeCityGeo"] {
  const home = tp.home_city;
  if (!home || typeof home !== "object") return undefined;
  const { country, latitude, longitude } = home as Record<string, unknown>;
  const geo = {
    country: typeof country === "string" && country ? country : undefined,
    latitude: typeof latitude === "number" ? latitude : undefined,
    longitude: typeof longitude === "number" ? longitude : undefined,
  };
  return geo.country || geo.latitude !== undefined ? geo : undefined;
}

/** Wizard/editor shape → backend `travel_profile` (spec W2.4 mapping, field names per the API's `TravelProfile`). */
export function journeyToTravelProfile(journey: SavedJourney, homeCity?: string | null): Record<string, unknown> {
  const city = (homeCity ?? journey.homeCity ?? "").trim();
  return {
    home_location: (journey.homeLocation ?? "").slice(0, 200),
    corridor: journey.corridor ?? null,
    group_type: toEnum(GROUP_TYPE_VALUES, journey.groupType),
    travelling_with_kids_or_elders: journey.travelingWithKidsOrElders ?? false,
    travel_windows: (journey.travelWindows ?? [])
      .map((w) => ({ from: toCalendarDate(w.from), to: toCalendarDate(w.to) }))
      .filter((w) => w.from || w.to)
      .slice(0, 12),
    travellers: (journey.travelerProfiles ?? []).slice(0, 20).map((t) => ({
      name: t.name.slice(0, 80),
      interests: t.interests.slice(0, 30),
      sub_interests: t.subInterests.slice(0, 60),
      dietary: t.dietary.slice(0, 200),
      religious_observance: t.religiousObservance.slice(0, 200),
      allergies: t.allergies.slice(0, 200),
    })),
    depth: journey.depth ?? null,
    walking_tolerance: toEnum(WALKING_TOLERANCE_VALUES, journey.walkingTolerance),
    heat_sensitive: journey.heatSensitive ?? false,
    notes: (journey.additionalNotes ?? "").slice(0, 2000),
    home_city: city ? homeCityObject(city, journey.homeCityGeo) : null,
    updated_at: new Date().toISOString(),
  };
}

export function travelProfileToJourney(tp: Record<string, unknown> | undefined | null): SavedJourney | null {
  if (!tp || Object.keys(tp).length === 0) return null;
  const rawTravellers = Array.isArray(tp.travellers) ? (tp.travellers as Record<string, unknown>[]) : [];
  const travellers: TravelerProfile[] = rawTravellers.map((t) => ({
    name: str(t.name),
    interests: strList(t.interests),
    subInterests: strList(t.sub_interests ?? t.subInterests),
    dietary: str(t.dietary),
    religiousObservance: str(t.religious_observance ?? t.religiousObservance),
    allergies: str(t.allergies),
  }));
  const windows = (tp.travel_windows ?? tp.travelWindows) as { from?: unknown; to?: unknown }[] | undefined;
  return {
    homeLocation: str(tp.home_location),
    corridor: (tp.corridor as SavedJourney["corridor"]) ?? null,
    groupType: toLabel(GROUP_TYPE_VALUES, tp.group_type),
    travelingWithKidsOrElders: Boolean(tp.travelling_with_kids_or_elders ?? tp.travelingWithKidsOrElders),
    travelWindows: Array.isArray(windows)
      ? windows.map((w) => ({ from: fromCalendarDate(w.from), to: fromCalendarDate(w.to) }))
      : [],
    travelerProfiles: travellers,
    depth: (tp.depth as SavedJourney["depth"]) ?? null,
    walkingTolerance: toLabel(WALKING_TOLERANCE_VALUES, tp.walking_tolerance ?? tp.walkingTolerance),
    heatSensitive: Boolean(tp.heat_sensitive ?? tp.heatSensitive),
    additionalNotes: str(tp.notes),
    homeCity: travelProfileHomeCity(tp) ?? undefined,
    homeCityGeo: homeCityGeoOf(tp),
    savedAt: (tp.updated_at as string) ?? undefined,
  };
}

export function saveTravelProfile(journey: SavedJourney): Promise<PersonalizationDoc> {
  return patchPersonalization({ travel_profile: journeyToTravelProfile(journey) });
}
