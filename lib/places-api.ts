import { mergeStoryDetailPlaceholders } from "@/lib/story-detail-placeholders";
import type { StoryDetail, StorySubTopic, Tour } from "@/lib/marketplace-data";
import { getMarketplaceApiBaseUrl } from "@/lib/api-base-url";

type ApiPlaceAudioTopic = {
  id?: string;
  name?: string;
  duration?: number;
  audio_duration?: number;
  is_published?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;
};

type ApiPlaceAudio = {
  id?: string;
  is_default?: boolean;
  is_deleted?: boolean;
  audio_language?: string;
  audio_duration?: number;
  persona_name?: string;
  persona_description?: string;
  topics?: ApiPlaceAudioTopic[];
};

export type ApiPublicPlace = {
  _id?: string;
  id?: string;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  location?: {
    type?: string;
    coordinates?: [number, number];
  } | null;
  images?: string[] | null;
  image_urls?: string[] | null;
  tags?: string[] | null;
  place_types?: string[] | null;
  ai_tags?: string[] | null;
  poi_tier?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  coins_price?: number | null;
  is_published?: boolean;
  is_active?: boolean;
  is_deleted?: boolean;
  audios?: ApiPlaceAudio[] | null;
};

type ApiPlacesListResponse = {
  success?: boolean;
  data?: ApiPublicPlace[];
  pagination?: {
    skip: number;
    limit: number;
    total: number;
    has_next?: boolean;
  };
};

let cachedPublicPlaces: ApiPublicPlace[] | null = null;
let cachePromise: Promise<ApiPublicPlace[]> | null = null;

function formatDurationLabel(minutes?: number | null): string {
  if (minutes && minutes > 0) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return "Self-paced";
}

function placeId(place: ApiPublicPlace): string {
  return place.id || place._id || "";
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function resolvePlaceImage(place: ApiPublicPlace): string {
  const sas = place.image_urls?.find((url) => url?.trim());
  if (sas) return sas;
  return "";
}

function defaultAudio(place: ApiPublicPlace): ApiPlaceAudio | undefined {
  const audios = (place.audios ?? []).filter((a) => a.is_deleted !== true);
  return audios.find((a) => a.is_default) ?? audios[0];
}

function audioDurationMinutes(place: ApiPublicPlace): number | undefined {
  const audio = defaultAudio(place);
  if (!audio?.audio_duration || audio.audio_duration <= 0) return undefined;
  return Math.max(1, Math.round(audio.audio_duration / 60));
}

function mapPlaceCategory(place: ApiPublicPlace): string {
  const type = place.place_types?.find((t) => t && t !== "establishment");
  if (type) {
    return type
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return "Story";
}

function mapPlaceTier(place: ApiPublicPlace, coinsPrice: number): Tour["tier"] {
  const tier = place.poi_tier;
  if (tier === "silver" || tier === "gold" || tier === "platinum") return tier;
  if (coinsPrice === 0) return "silver";
  if (coinsPrice >= 10) return "platinum";
  return "gold";
}

const CITY_ALIASES: Record<string, string[]> = {
  bangalore: ["bengaluru"],
  bengaluru: ["bangalore"],
  delhi: ["new delhi"],
  "new delhi": ["delhi"],
  bombay: ["mumbai"],
  mumbai: ["bombay"],
  calcutta: ["kolkata"],
  kolkata: ["calcutta"],
};

function buildPlaceSearchTerms(place: ApiPublicPlace): string[] {
  const terms = new Set<string>();
  const add = (value?: string | null) => {
    if (!value) return;
    terms.add(normalizeText(value));
  };
  add(place.name);
  add(place.city);
  add(place.state);
  add(place.country);
  for (const tag of place.tags ?? []) add(tag);
  for (const tag of place.ai_tags ?? []) add(tag);
  for (const type of place.place_types ?? []) add(type);

  const city = place.city?.trim();
  if (city) {
    const normalizedCity = normalizeText(city);
    for (const alias of CITY_ALIASES[normalizedCity] ?? []) {
      terms.add(alias);
    }
  }

  return Array.from(terms);
}

function formatSubTopicDuration(seconds?: number | null): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function mapPlaceTopicHighlights(place: ApiPublicPlace): string[] {
  const audio = defaultAudio(place);
  const topics = (audio?.topics ?? [])
    .filter((t) => t.is_deleted !== true && t.name?.trim())
    .map((t) => t.name!.trim());
  return topics.slice(0, 3);
}

function mapPlaceSubTopics(place: ApiPublicPlace): StorySubTopic[] {
  const audio = defaultAudio(place);
  return (audio?.topics ?? [])
    .filter(
      (topic) =>
        topic.is_deleted !== true &&
        topic.is_active !== false &&
        topic.is_published !== false &&
        topic.name?.trim(),
    )
    .map((topic, index) => {
      const durationSeconds = topic.audio_duration ?? topic.duration;
      return {
        id: topic.id || `topic-${index}`,
        name: topic.name!.trim(),
        durationSeconds: durationSeconds && durationSeconds > 0 ? durationSeconds : undefined,
        durationLabel: formatSubTopicDuration(durationSeconds),
      };
    });
}

function mapPlaceNarrators(place: ApiPublicPlace, durationMinutes?: number) {
  return (place.audios ?? [])
    .filter((a) => a.is_deleted !== true && (a.persona_name || a.id))
    .map((audio, index) => ({
      id: audio.id || `audio-${index}`,
      name: audio.persona_name?.trim() || "Gamana",
      title: audio.persona_description?.trim() || "Narrator",
      description:
        audio.persona_description?.trim() ||
        `Listen to ${place.name} with ${audio.persona_name || "a Gamana narrator"}.`,
      durationMinutes:
        audio.audio_duration && audio.audio_duration > 0
          ? Math.max(1, Math.round(audio.audio_duration / 60))
          : durationMinutes,
      isPrimary: audio.is_default === true,
    }));
}

function mapPlaceLanguages(place: ApiPublicPlace) {
  const codes = new Set<string>();
  for (const audio of place.audios ?? []) {
    if (audio.audio_language) codes.add(audio.audio_language);
  }
  const labels: Record<string, { label: string; nativeLabel?: string }> = {
    en: { label: "English" },
    kn: { label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
    hi: { label: "Hindi", nativeLabel: "हिन्दी" },
  };
  const primary = defaultAudio(place)?.audio_language ?? "en";
  return Array.from(codes).map((code) => ({
    code,
    label: labels[code]?.label ?? code.toUpperCase(),
    nativeLabel: labels[code]?.nativeLabel,
    isActive: code === primary,
    availableInApp: true,
  }));
}

export function isPlaceCatalogVisible(place: ApiPublicPlace): boolean {
  if (place.is_deleted) return false;
  if (place.is_active === false) return false;
  return Boolean(place.name?.trim());
}

export function mapPublicPlaceToTour(place: ApiPublicPlace): Tour | null {
  const id = placeId(place);
  if (!id || !isPlaceCatalogVisible(place)) return null;

  const coinsPrice = Math.round(Number(place.coins_price ?? 0));
  const tier = mapPlaceTier(place, coinsPrice);
  const durationMinutes = audioDurationMinutes(place);
  const city = place.city?.trim() || "India";
  const country = place.country?.trim() || "India";

  return {
    id,
    title: place.name,
    description: place.description?.trim() || `Discover the story of ${place.name}.`,
    location: country && city !== country ? `${city}, ${country}` : city,
    duration: durationMinutes ? formatDurationLabel(durationMinutes) : "Self-paced",
    price: coinsPrice,
    rating: place.rating && place.rating > 0 ? place.rating : 4.7,
    reviews: place.reviews_count && place.reviews_count > 0 ? place.reviews_count : 0,
    tier,
    category: mapPlaceCategory(place),
    image: resolvePlaceImage(place),
    highlights: mapPlaceTopicHighlights(place),
    narrator: defaultAudio(place)?.persona_name?.trim() || "Gamana narrator",
    isPremium: coinsPrice > 0,
    searchTerms: buildPlaceSearchTerms(place),
    contentKind: "story",
    isRecommended: true,
  };
}

export function mapPublicPlaceToStoryDetail(place: ApiPublicPlace): StoryDetail | null {
  const base = mapPublicPlaceToTour(place);
  if (!base) return null;

  const durationMinutes = audioDurationMinutes(place);
  const coords = place.location?.coordinates;
  const narrators = mapPlaceNarrators(place, durationMinutes);
  const subTopics = mapPlaceSubTopics(place);
  const languages = mapPlaceLanguages(place);

  const detail: StoryDetail = {
    ...base,
    contentKind: "story",
    placeName: place.name,
    placeDescription: place.description?.trim() || undefined,
    subtitle: place.description?.trim() || base.description,
    coordinates: coords ?? undefined,
    audioDurationMinutes: durationMinutes,
    storyTypeLabel: mapPlaceCategory(place),
    whatToNotice: [],
    sources: [],
    languages,
    narrators,
    beforeYouVisit: [],
    subTopics,
    lensesAvailableCount: narrators.length > 0 ? narrators.length : undefined,
  };

  return mergeStoryDetailPlaceholders(detail);
}

async function fetchPublicPlacesPage(
  skip: number,
  limit: number,
  city?: string,
): Promise<ApiPlacesListResponse> {
  const baseUrl = getMarketplaceApiBaseUrl();
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    country: "India",
  });
  if (city?.trim()) params.set("city", city.trim());

  const response = await fetch(`${baseUrl}/places/search/public/location?${params}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Places API failed (${response.status})`);
  }
  return response.json() as Promise<ApiPlacesListResponse>;
}

export async function fetchAllPublicPlaces(): Promise<ApiPublicPlace[]> {
  if (cachedPublicPlaces) return cachedPublicPlaces;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const firstPage = await fetchPublicPlacesPage(0, 100);
    const total = firstPage.pagination?.total ?? firstPage.data?.length ?? 0;
    const limit = 100;
    const places: ApiPublicPlace[] = [...(firstPage.data ?? [])];

    if (total > places.length) {
      const pageOffsets: number[] = [];
      for (let skip = limit; skip < total; skip += limit) {
        pageOffsets.push(skip);
      }

      const pages = await Promise.all(
        pageOffsets.map((skip) => fetchPublicPlacesPage(skip, limit)),
      );
      for (const page of pages) {
        places.push(...(page.data ?? []));
      }
    }

    cachedPublicPlaces = places;
    return places;
  })();

  try {
    return await cachePromise;
  } catch (error) {
    cachePromise = null;
    throw error;
  }
}

export function resolvePlaceAudioDurationSeconds(place: ApiPublicPlace): number | undefined {
  const audio = defaultAudio(place);
  if (audio?.audio_duration && audio.audio_duration > 0) {
    return Math.round(audio.audio_duration);
  }

  const topics = (audio?.topics ?? []).filter(
    (topic) =>
      topic.is_deleted !== true &&
      topic.is_active !== false &&
      topic.is_published !== false &&
      topic.name?.trim(),
  );
  const topicSum = topics.reduce(
    (sum, topic) => sum + (topic.audio_duration ?? topic.duration ?? 0),
    0,
  );
  if (topicSum > 0) return Math.round(topicSum);

  return undefined;
}

export async function buildPlaceAudioDurationLookup(): Promise<Map<string, number>> {
  const places = await fetchAllPublicPlaces();
  const lookup = new Map<string, number>();

  for (const place of places) {
    const id = placeId(place);
    const seconds = resolvePlaceAudioDurationSeconds(place);
    if (id && seconds) {
      lookup.set(id, seconds);
    }
  }

  return lookup;
}

export async function fetchPublicPlaceById(id: string): Promise<ApiPublicPlace | null> {
  const places = await fetchAllPublicPlaces();
  return places.find((place) => placeId(place) === id) ?? null;
}

export async function fetchPublicStoriesCatalog(): Promise<Tour[]> {
  const places = await fetchAllPublicPlaces();
  return places
    .map(mapPublicPlaceToTour)
    .filter((tour): tour is Tour => Boolean(tour));
}

export async function fetchPublicStoryDetailByPlaceId(id: string): Promise<StoryDetail | null> {
  const place = await fetchPublicPlaceById(id);
  return place ? mapPublicPlaceToStoryDetail(place) : null;
}

export function clearPublicPlacesCache(): void {
  cachedPublicPlaces = null;
  cachePromise = null;
}

export function getStoryHref(story: Pick<Tour, "id">): string {
  return `/explore/story/${story.id}`;
}
