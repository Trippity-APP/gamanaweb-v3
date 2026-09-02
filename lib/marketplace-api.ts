import type { Tour, TourStop, WalkDetail, StoryDetail } from "@/lib/marketplace-data";
import { getCatalogFetchInit, getMarketplaceApiBaseUrl } from "@/lib/api-base-url";
import { mergeStoryDetailPlaceholders } from "@/lib/story-detail-placeholders";
import {
  clearPublicPlacesCache,
  buildPlaceAudioDurationLookup,
  fetchPublicStoriesCatalog,
  fetchPublicStoryDetailByPlaceId,
} from "@/lib/places-api";

const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";
export const DEFAULT_TOUR_IMAGE = "/taj-mahal-sunrise-reflection-central-pool-agra.jpg";

export function getDefaultTourImage(): string {
  return DEFAULT_TOUR_IMAGE;
}

export { getMarketplaceApiBaseUrl } from "@/lib/api-base-url";

type ApiPlace = {
  id?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  name?: string | null;
  description?: string | null;
  images?: string[] | null;
  poi_tier?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
};

type ApiStartingPoint = {
  object_id?: string | null;
  name?: string | null;
  position?: number | null;
  coordinates?: [number, number] | null;
  duration_to_next_seconds?: number | null;
  duration_text?: string | null;
  place?: ApiPlace | null;
};

export type ApiStorylist = {
  _id?: string;
  id?: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  city?: string | null;
  country?: string | null;
  coins_price?: number | null;
  stops_count?: number | null;
  estimated_duration?: number | null;
  total_duration_seconds?: number | null;
  total_audio_duration?: number | null;
  route_type?: string | null;
  is_walking_tour?: boolean | null;
  tags?: string[] | null;
  category?: string | null;
  creator_name?: string | null;
  purchase_count?: number | null;
  starting_points?: ApiStartingPoint[] | null;
  type?: string | null;
  is_recommended?: boolean | string | null;
};

type ApiListResponse = {
  success: boolean;
  data: ApiStorylist[];
  pagination?: {
    skip: number;
    limit: number;
    total: number;
  };
};

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

const GENERIC_TAGS = new Set([
  "storylist",
  "historical",
  "heritage",
  "tourism",
  "tour",
  "audio",
  "walking",
  "culture",
  "food",
  "nature",
]);

let cachedStorylists: ApiStorylist[] | null = null;
let cachePromise: Promise<ApiStorylist[]> | null = null;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function storylistId(storylist: ApiStorylist): string {
  return storylist.id || storylist._id || "";
}

export function slugifyTourTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "tour"
  );
}

function assignTourSlugs(tours: Tour[]): Tour[] {
  const seen = new Map<string, number>();

  // Stable order so slug suffixes never change when the API returns a different order.
  return [...tours].sort((a, b) => a.id.localeCompare(b.id)).map((tour) => {
    const base = slugifyTourTitle(tour.title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const slug = count === 0 ? base : `${base}-${count + 1}`;
    return { ...tour, slug };
  });
}

export function getTourHref(tour: Pick<Tour, "id" | "contentKind">): string {
  if ((tour.contentKind ?? "walk") === "story") {
    return `/explore/story/${tour.id}`;
  }
  return `/explore/tours/${tour.id}`;
}

function extractCityCountry(storylist: ApiStorylist): { city: string; country: string } {
  if (storylist.city) {
    return {
      city: storylist.city,
      country: storylist.country || "India",
    };
  }

  for (const point of storylist.starting_points ?? []) {
    const place = point.place;
    if (place?.city) {
      return {
        city: place.city,
        country: place.country || "India",
      };
    }
  }

  const tagCity = (storylist.tags ?? []).find(
    (tag) => !GENERIC_TAGS.has(tag.toLowerCase())
  );
  if (tagCity) {
    return { city: tagCity, country: storylist.country || "India" };
  }

  return { city: "India", country: "India" };
}

function sortedStartingPoints(storylist: ApiStorylist): ApiStartingPoint[] {
  return [...(storylist.starting_points ?? [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );
}

/** Audio walk cover: first story/stop only — never cover_image or a later stop. */
export function extractFirstStopImageUrl(storylist: ApiStorylist): string | undefined {
  const firstStop = sortedStartingPoints(storylist)[0];
  return firstStop?.place?.images?.find((url) => url?.trim());
}

function extractFirstStopImage(storylist: ApiStorylist): string {
  return extractFirstStopImageUrl(storylist) ?? DEFAULT_TOUR_IMAGE;
}

function extractImage(storylist: ApiStorylist): string {
  const cover = storylist.cover_image?.trim();
  if (cover) return cover;

  for (const point of sortedStartingPoints(storylist)) {
    const image = point.place?.images?.find((url) => url?.trim());
    if (image) return image;
  }

  return DEFAULT_TOUR_IMAGE;
}

function extractHighlights(storylist: ApiStorylist): string[] {
  const stops = (storylist.starting_points ?? [])
    .map((point) => point.place?.name || point.name)
    .filter((name): name is string => Boolean(name));

  if (stops.length > 0) {
    return stops.slice(0, 5);
  }

  return (storylist.tags ?? [])
    .filter((tag) => !GENERIC_TAGS.has(tag.toLowerCase()))
    .slice(0, 3);
}

function mapCategory(storylist: ApiStorylist): string {
  if (storylist.category) return storylist.category;

  const tag = (storylist.tags ?? []).find((value) =>
    ["Historical", "Heritage", "Food", "Art & Culture", "Architecture", "Music & Arts"].some(
      (known) => known.toLowerCase() === value.toLowerCase()
    )
  );
  if (tag) return tag;

  return "Historical";
}

function mapTier(storylist: ApiStorylist, coinsPrice: number): Tour["tier"] {
  const poiTier = storylist.starting_points?.[0]?.place?.poi_tier;
  if (poiTier === "silver" || poiTier === "gold" || poiTier === "platinum") {
    return poiTier;
  }

  if (coinsPrice === 0) return "silver";
  if (coinsPrice >= 10) return "platinum";
  return "gold";
}

function formatDuration(minutes?: number | null, stops?: number | null): string {
  if (minutes && minutes > 0) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (stops && stops > 0) {
    return `${stops} stop${stops > 1 ? "s" : ""}`;
  }

  return "Self-paced";
}

function buildSearchTerms(storylist: ApiStorylist, city: string, country: string): string[] {
  const terms = new Set<string>();

  const add = (value?: string | null) => {
    if (!value) return;
    terms.add(normalizeText(value));
  };

  add(city);
  add(country);
  add(storylist.title);

  for (const tag of storylist.tags ?? []) add(tag);
  for (const point of storylist.starting_points ?? []) {
    add(point.name);
    add(point.place?.city);
    add(point.place?.state);
    add(point.place?.name);
  }

  const normalizedCity = normalizeText(city);
  for (const alias of CITY_ALIASES[normalizedCity] ?? []) {
    terms.add(alias);
  }

  return Array.from(terms);
}

function mapContentKind(storylist: ApiStorylist): 'story' | 'walk' {
  const type = normalizeText(storylist.type ?? '');
  if (type.includes('story') && !type.includes('walk')) return 'story';
  if (type.includes('walk') || type.includes('route') || type.includes('tour')) return 'walk';
  const stops = storylist.stops_count ?? 0;
  return stops > 1 ? 'walk' : 'story';
}

function mapIsRecommended(value: ApiStorylist['is_recommended']): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'yes' || normalized === 'true' || normalized === '1' || normalized === 'recommended') {
      return true;
    }
    if (
      normalized === 'no' ||
      normalized === 'false' ||
      normalized === '0' ||
      normalized === 'not recommended'
    ) {
      return false;
    }
  }
  return false;
}

/** Audio Walks catalog: only items flagged recommended in the CMS/database. */
export function isWalkCatalogVisible(tour: Pick<Tour, 'contentKind' | 'isRecommended'>): boolean {
  if ((tour.contentKind ?? 'walk') !== 'walk') return true;
  return tour.isRecommended === true;
}

/** @deprecated Use isWalkCatalogVisible */
export function isCatalogRecommendedWalk(tour: Pick<Tour, 'contentKind' | 'isRecommended'>): boolean {
  return isWalkCatalogVisible(tour);
}

export function mapStorylistToTour(storylist: ApiStorylist): Tour | null {
  const id = storylistId(storylist);
  if (!id) return null;

  const { city, country } = extractCityCountry(storylist);
  const coinsPrice = Math.round(Number(storylist.coins_price ?? 0));
  const tier = mapTier(storylist, coinsPrice);
  const placeRating = storylist.starting_points?.[0]?.place?.rating;
  const placeReviews = storylist.starting_points?.[0]?.place?.reviews_count;
  const contentKind = mapContentKind(storylist);

  return {
    id,
    title: storylist.title,
    description: storylist.description?.trim() || "Explore this curated audio tour.",
    location: country && city !== country ? `${city}, ${country}` : city,
    duration: formatDuration(
      contentKind === "walk"
        ? resolveWalkAudioDurationMinutes(storylist)
        : storylist.estimated_duration,
      storylist.stops_count,
    ),
    price: coinsPrice,
    rating: placeRating && placeRating > 0 ? placeRating : 4.7,
    reviews: placeReviews && placeReviews > 0 ? placeReviews : storylist.purchase_count ?? 0,
    tier,
    category: mapCategory(storylist),
    image:
      contentKind === 'walk'
        ? extractFirstStopImageUrl(storylist) ?? DEFAULT_TOUR_IMAGE
        : extractImage(storylist),
    highlights: extractHighlights(storylist),
    narrator: storylist.creator_name?.trim() || "Gamana narrator",
    isPremium: tier !== "silver",
    searchTerms: buildSearchTerms(storylist, city, country),
    contentKind,
    isRecommended: mapIsRecommended(storylist.is_recommended),
  };
}

function resolveWalkAudioDurationMinutes(storylist: ApiStorylist): number | undefined {
  if (storylist.total_audio_duration && storylist.total_audio_duration > 0) {
    return Math.max(1, Math.round(storylist.total_audio_duration / 60));
  }
  if (storylist.estimated_duration && storylist.estimated_duration > 0) {
    return storylist.estimated_duration;
  }
  if (storylist.total_duration_seconds && storylist.total_duration_seconds > 0) {
    return Math.max(1, Math.round(storylist.total_duration_seconds / 60));
  }
  return undefined;
}

/** @deprecated Use resolveWalkAudioDurationMinutes */
function resolveTotalDurationMinutes(storylist: ApiStorylist): number | undefined {
  return resolveWalkAudioDurationMinutes(storylist);
}

function mapStorylistStops(
  storylist: ApiStorylist,
  placeAudioSecondsById?: Map<string, number>,
): TourStop[] {
  return [...(storylist.starting_points ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((point, index) => {
      const place = point.place;
      const name = place?.name || point.name || `Stop ${index + 1}`;
      const placeIdValue = point.object_id || place?.id;
      const id =
        placeIdValue ||
        `${storylistId(storylist)}-stop-${point.position ?? index}`;

      const audioDurationSeconds =
        (placeIdValue && placeAudioSecondsById?.get(placeIdValue)) || undefined;

      return {
        id,
        position: point.position ?? index,
        name,
        description: place?.description?.trim() || undefined,
        image: place?.images?.[0] || undefined,
        audioDurationSeconds,
      };
    });
}

async function enrichWalkDetailWithPlaceAudio(walk: WalkDetail): Promise<WalkDetail> {
  const placeIds = walk.stops
    .map((stop) => stop.id)
    .filter((id) => id && !id.includes("-stop-"));

  if (placeIds.length === 0) return walk;

  const lookup = await buildPlaceAudioDurationLookup();
  const stops = walk.stops.map((stop) => {
    const seconds = lookup.get(stop.id);
    if (!seconds) return stop;
    return { ...stop, audioDurationSeconds: seconds };
  });

  return {
    ...walk,
    stops,
  };
}

export function mapStorylistToWalkDetail(storylist: ApiStorylist): WalkDetail | null {
  const base = mapStorylistToTour(storylist);
  if (!base) return null;
  if (mapContentKind(storylist) !== "walk") return null;

  const stops = mapStorylistStops(storylist);
  const stopsCount = storylist.stops_count ?? stops.length;
  const totalDurationMinutes = resolveWalkAudioDurationMinutes(storylist);
  const firstStopImage = stops[0]?.image ?? extractFirstStopImageUrl(storylist);
  const totalAudioDurationSeconds =
    storylist.total_audio_duration && storylist.total_audio_duration > 0
      ? storylist.total_audio_duration
      : undefined;

  return {
    ...base,
    contentKind: "walk",
    image: firstStopImage ?? extractFirstStopImageUrl(storylist) ?? base.image,
    stops,
    stopsCount,
    totalDurationMinutes,
    totalAudioDurationSeconds,
    duration: formatDuration(totalDurationMinutes, stopsCount),
  };
}

function mapStoryTypeLabel(storylist: ApiStorylist): string | undefined {
  const category = storylist.category?.trim();
  if (category) return category;

  const tag = (storylist.tags ?? []).find(
    (value) => !GENERIC_TAGS.has(value.toLowerCase()),
  );
  return tag ?? undefined;
}

function resolveAudioDurationMinutes(storylist: ApiStorylist): number | undefined {
  return resolveWalkAudioDurationMinutes(storylist);
}

function mapStoryWhatToNotice(storylist: ApiStorylist, highlights: string[]): string[] {
  const firstStop = sortedStartingPoints(storylist)[0];
  const placeDesc = firstStop?.place?.description?.trim();
  if (placeDesc) {
    const sentences = placeDesc
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    if (sentences.length > 0) {
      return sentences.slice(0, 3);
    }
  }

  const fromHighlights = highlights.filter((h) => h.length > 0);
  if (fromHighlights.length > 0) {
    return fromHighlights.slice(0, 3);
  }

  return [];
}

export function mapStorylistToStoryDetail(storylist: ApiStorylist): StoryDetail | null {
  const base = mapStorylistToTour(storylist);
  if (!base) return null;
  if (mapContentKind(storylist) !== "story") return null;

  const firstStop = sortedStartingPoints(storylist)[0];
  const place = firstStop?.place;
  const firstStopImage = extractFirstStopImageUrl(storylist);
  const audioDurationMinutes = resolveAudioDurationMinutes(storylist);
  const whatToNotice = mapStoryWhatToNotice(storylist, base.highlights);

  const narrators =
    base.narrator && base.narrator !== "Gamana narrator"
      ? [
          {
            id: "primary",
            name: base.narrator.split(/\s+/)[0] ?? base.narrator,
            title: "Narrator",
            description: `Perspective on ${place?.name ?? base.title} from ${base.narrator}.`,
            durationMinutes: audioDurationMinutes,
            isPrimary: true,
          },
        ]
      : [];

  const detail: StoryDetail = {
    ...base,
    contentKind: "story",
    image: firstStopImage ?? base.image,
    placeName: place?.name ?? firstStop?.name ?? undefined,
    placeDescription: place?.description?.trim() || undefined,
    subtitle: base.description,
    coordinates: firstStop?.coordinates ?? undefined,
    audioDurationMinutes,
    storyTypeLabel: mapStoryTypeLabel(storylist),
    duration: audioDurationMinutes
      ? formatDuration(audioDurationMinutes, null)
      : base.duration,
    whatToNotice,
    sources: [],
    languages: [],
    narrators,
    beforeYouVisit: [],
    subTopics: [],
  };

  return mergeStoryDetailPlaceholders(detail);
}

export function formatStoryDurationLabel(
  story: Pick<StoryDetail, "audioDurationMinutes" | "duration">,
): string {
  if (story.audioDurationMinutes && story.audioDurationMinutes > 0) {
    return formatDuration(story.audioDurationMinutes, null);
  }
  return story.duration;
}

export function formatAudioDuration(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min audio`;
}

export function formatWalkDurationLabel(
  walk: Pick<WalkDetail, "totalDurationMinutes" | "totalAudioDurationSeconds" | "stopsCount" | "duration">,
): string {
  if (walk.totalAudioDurationSeconds && walk.totalAudioDurationSeconds > 0) {
    return formatDuration(Math.max(1, Math.round(walk.totalAudioDurationSeconds / 60)), null);
  }
  if (walk.totalDurationMinutes && walk.totalDurationMinutes > 0) {
    return formatDuration(walk.totalDurationMinutes, null);
  }
  return walk.duration;
}

export function tourMatchesCity(tour: Tour, cityQuery: string): boolean {
  const query = normalizeText(cityQuery);
  if (!query) return true;

  const terms = tour.searchTerms ?? [
    normalizeText(tour.location),
    normalizeText(tour.title),
  ];

  if (terms.some((term) => term.includes(query) || query.includes(term))) {
    return true;
  }

  const aliases = CITY_ALIASES[query] ?? [];
  return aliases.some((alias) => terms.some((term) => term.includes(alias)));
}

export function getExploreSearchQuery(params: URLSearchParams | { get(name: string): string | null }): string {
  return (params.get("q") ?? params.get("city") ?? "").trim();
}

export function tourMatchesSearch(tour: Tour, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  if (tourMatchesCity(tour, q)) return true;

  if (normalizeText(tour.title).includes(q)) return true;
  if (normalizeText(tour.location).includes(q)) return true;
  if (normalizeText(tour.description).includes(q)) return true;
  if (normalizeText(tour.narrator).includes(q)) return true;
  if (normalizeText(tour.category).includes(q)) return true;

  const terms = tour.searchTerms ?? [];
  return terms.some((term) => term.includes(q));
}

type ApiDetailResponse = {
  success: boolean;
  data: ApiStorylist;
};

async function fetchStorylistDetailById(id: string): Promise<ApiStorylist | null> {
  const baseUrl = getMarketplaceApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/marketplace/tours/${id}`, getCatalogFetchInit());
    if (response.ok) {
      const payload = (await response.json()) as ApiDetailResponse;
      if (payload.data) return payload.data;
    }
  } catch {
    // Fall through to list cache below.
  }

  const storylists = await fetchAllPublicStorylists();
  return storylists.find((item) => storylistId(item) === id) ?? null;
}

async function enrichCatalogStorylist(storylist: ApiStorylist): Promise<ApiStorylist> {
  const isWalk = mapContentKind(storylist) === "walk";
  const isRecommended = mapIsRecommended(storylist.is_recommended);
  if (!isWalk || !isRecommended) return storylist;

  // Always hydrate from detail so first-stop images use fresh SAS URLs and full place data.
  const detail = await fetchStorylistDetailById(storylistId(storylist));
  return detail ?? storylist;
}

async function fetchToursPage(skip: number, limit: number, city?: string): Promise<ApiListResponse> {
  const baseUrl = getMarketplaceApiBaseUrl();
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  if (city?.trim()) {
    params.set("city", city.trim());
  }
  const url = `${baseUrl}/marketplace/tours?${params.toString()}`;

  const response = await fetch(url, getCatalogFetchInit());
  if (!response.ok) {
    throw new Error(`Marketplace API failed (${response.status})`);
  }

  return response.json() as Promise<ApiListResponse>;
}

export async function fetchAllPublicStorylists(): Promise<ApiStorylist[]> {
  if (cachedStorylists) return cachedStorylists;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const storylists: ApiStorylist[] = [];
    let skip = 0;
    const limit = 100;
    let total = Number.POSITIVE_INFINITY;

    while (skip < total) {
      const page = await fetchToursPage(skip, limit);
      const batch = page.data ?? [];
      storylists.push(...batch);

      total = page.pagination?.total ?? batch.length;
      if (batch.length === 0) break;
      skip += batch.length;
    }

    cachedStorylists = storylists;
    return storylists;
  })();

  try {
    return await cachePromise;
  } catch (error) {
    cachePromise = null;
    throw error;
  }
}

export async function fetchPublicWalksCatalog(): Promise<Tour[]> {
  const storylists = await fetchAllPublicStorylists();
  const enriched = await Promise.all(storylists.map(enrichCatalogStorylist));
  return enriched
    .map(mapStorylistToTour)
    .filter((tour): tour is Tour => Boolean(tour))
    .filter(isWalkCatalogVisible)
    .filter((tour) => (tour.contentKind ?? "walk") === "walk");
}

export async function fetchPublicTours(): Promise<Tour[]> {
  const [storiesResult, walksResult] = await Promise.allSettled([
    fetchPublicStoriesCatalog(),
    fetchPublicWalksCatalog(),
  ]);

  const stories = storiesResult.status === "fulfilled" ? storiesResult.value : [];
  const walks = walksResult.status === "fulfilled" ? walksResult.value : [];

  return assignTourSlugs([...stories, ...walks]);
}

export async function fetchPublicTourById(id: string): Promise<Tour | null> {
  const storylist = await fetchStorylistDetailById(id);
  return storylist ? mapStorylistToTour(storylist) : null;
}

export async function fetchPublicWalkDetailById(id: string): Promise<WalkDetail | null> {
  const storylist = await fetchStorylistDetailById(id);
  if (!storylist) return null;
  const walk = mapStorylistToWalkDetail(storylist);
  if (!walk) return null;
  return enrichWalkDetailWithPlaceAudio(walk);
}

export async function fetchPublicStoryDetailById(id: string): Promise<StoryDetail | null> {
  const fromPlace = await fetchPublicStoryDetailByPlaceId(id);
  if (fromPlace) return fromPlace;

  const storylist = await fetchStorylistDetailById(id);
  return storylist ? mapStorylistToStoryDetail(storylist) : null;
}

export async function fetchPublicTourBySlug(slug: string): Promise<Tour | null> {
  const tours = await fetchPublicTours();
  const normalized = slug.trim().toLowerCase();

  const bySlug = tours.find((tour) => tour.slug?.toLowerCase() === normalized);
  if (bySlug) return bySlug;

  // Backward compatibility for old /explore/tours/{id} and /marketplace/tours/{id} links.
  const byId = tours.find((tour) => tour.id === slug);
  if (byId) return byId;

  if (/^[a-f0-9]{24}$/i.test(slug)) {
    const fromApi = await fetchPublicTourById(slug);
    if (fromApi) {
      const [withSlug] = assignTourSlugs([fromApi]);
      return withSlug ?? fromApi;
    }
  }

  return null;
}

export async function fetchPublicStorylistById(id: string): Promise<ApiStorylist | null> {
  const storylists = await fetchAllPublicStorylists();
  return storylists.find((item) => storylistId(item) === id) ?? null;
}

export function clearMarketplaceCache(): void {
  cachedStorylists = null;
  cachePromise = null;
  clearPublicPlacesCache();
}
