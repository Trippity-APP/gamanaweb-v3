import type { Tour, TourStop, WalkDetail } from "@/lib/marketplace-data";

const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";
const DEFAULT_TOUR_IMAGE = "/taj-mahal-sunrise-reflection-central-pool-agra.jpg";

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

export function getMarketplaceApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BLOG_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, "");
}

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

export function getTourHref(tour: Pick<Tour, "id">): string {
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

function extractImage(storylist: ApiStorylist): string {
  if (storylist.cover_image) return storylist.cover_image;

  for (const point of storylist.starting_points ?? []) {
    const image = point.place?.images?.[0];
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

export function mapStorylistToTour(storylist: ApiStorylist): Tour | null {
  const id = storylistId(storylist);
  if (!id) return null;

  const { city, country } = extractCityCountry(storylist);
  const coinsPrice = Math.round(Number(storylist.coins_price ?? 0));
  const tier = mapTier(storylist, coinsPrice);
  const placeRating = storylist.starting_points?.[0]?.place?.rating;
  const placeReviews = storylist.starting_points?.[0]?.place?.reviews_count;

  return {
    id,
    title: storylist.title,
    description: storylist.description?.trim() || "Explore this curated audio tour.",
    location: country && city !== country ? `${city}, ${country}` : city,
    duration: formatDuration(storylist.estimated_duration, storylist.stops_count),
    price: coinsPrice,
    rating: placeRating && placeRating > 0 ? placeRating : 4.7,
    reviews: placeReviews && placeReviews > 0 ? placeReviews : storylist.purchase_count ?? 0,
    tier,
    category: mapCategory(storylist),
    image: extractImage(storylist),
    highlights: extractHighlights(storylist),
    narrator: storylist.creator_name?.trim() || "Gamana narrator",
    isPremium: tier !== "silver",
    searchTerms: buildSearchTerms(storylist, city, country),
    contentKind: mapContentKind(storylist),
  };
}

function resolveTotalDurationMinutes(storylist: ApiStorylist): number | undefined {
  if (storylist.estimated_duration && storylist.estimated_duration > 0) {
    return storylist.estimated_duration;
  }
  if (storylist.total_duration_seconds && storylist.total_duration_seconds > 0) {
    return Math.round(storylist.total_duration_seconds / 60);
  }
  return undefined;
}

function mapStorylistStops(storylist: ApiStorylist): TourStop[] {
  const stopsCount = storylist.stops_count ?? storylist.starting_points?.length ?? 0;
  const totalAudio = storylist.total_audio_duration ?? 0;
  const perStopAudio =
    totalAudio > 0 && stopsCount > 0 ? Math.round(totalAudio / stopsCount) : undefined;

  return [...(storylist.starting_points ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((point, index) => {
      const place = point.place;
      const name = place?.name || point.name || `Stop ${index + 1}`;
      const id =
        point.object_id ||
        place?.id ||
        `${storylistId(storylist)}-stop-${point.position ?? index}`;

      return {
        id,
        position: point.position ?? index,
        name,
        description: place?.description?.trim() || undefined,
        image: place?.images?.[0] || undefined,
        audioDurationSeconds: perStopAudio,
      };
    });
}

export function mapStorylistToWalkDetail(storylist: ApiStorylist): WalkDetail | null {
  const base = mapStorylistToTour(storylist);
  if (!base) return null;
  if (mapContentKind(storylist) !== "walk") return null;

  const stops = mapStorylistStops(storylist);
  const stopsCount = storylist.stops_count ?? stops.length;
  const totalDurationMinutes = resolveTotalDurationMinutes(storylist);

  return {
    ...base,
    contentKind: "walk",
    stops,
    stopsCount,
    totalDurationMinutes,
    totalAudioDurationSeconds: storylist.total_audio_duration ?? undefined,
    duration: formatDuration(totalDurationMinutes, stopsCount),
  };
}

export function formatAudioDuration(seconds?: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min audio`;
}

export function formatWalkDurationLabel(walk: Pick<WalkDetail, "totalDurationMinutes" | "stopsCount" | "duration">): string {
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

export function tourMatchesSearch(tour: Tour, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  if (tourMatchesCity(tour, q)) return true;

  return (
    normalizeText(tour.title).includes(q) ||
    normalizeText(tour.location).includes(q) ||
    normalizeText(tour.description).includes(q)
  );
}

type ApiDetailResponse = {
  success: boolean;
  data: ApiStorylist;
};

async function fetchStorylistDetailById(id: string): Promise<ApiStorylist | null> {
  const baseUrl = getMarketplaceApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/marketplace/tours/${id}`, {
      cache: "force-cache",
    });
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

  const response = await fetch(url, { cache: "force-cache" });
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

export async function fetchPublicTours(): Promise<Tour[]> {
  const storylists = await fetchAllPublicStorylists();
  return storylists
    .map(mapStorylistToTour)
    .filter((tour): tour is Tour => Boolean(tour));
}

export async function fetchPublicTourById(id: string): Promise<Tour | null> {
  const storylist = await fetchStorylistDetailById(id);
  return storylist ? mapStorylistToTour(storylist) : null;
}

export async function fetchPublicWalkDetailById(id: string): Promise<WalkDetail | null> {
  const storylist = await fetchStorylistDetailById(id);
  return storylist ? mapStorylistToWalkDetail(storylist) : null;
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
}
