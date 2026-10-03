import type { ApiCity } from "@/lib/services/cityService";
import type { SearchTour } from "@/lib/marketplace-data";
import { isWalkCatalogVisible, tourMatchesCity, tourMatchesSearch } from "@/lib/marketplace-api";

export type ExploreCitySuggestion = {
  kind: "city";
  label: string;
  sublabel?: string;
};

export type ExploreTourSuggestion<T extends SearchTour = SearchTour> = {
  kind: "story" | "walk";
  tour: T;
};

export type ExploreSuggestions<T extends SearchTour = SearchTour> = {
  cities: ExploreCitySuggestion[];
  stories: ExploreTourSuggestion<T>[];
  walks: ExploreTourSuggestion<T>[];
};

const SUGGESTION_LIMIT = 5;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function tourSearchScore(tour: SearchTour, query: string): number {
  const q = normalizeText(query);
  const title = normalizeText(tour.title);
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  return 40;
}

function rankTours<T extends SearchTour>(tours: T[], query: string): T[] {
  return [...tours]
    .sort((a, b) => tourSearchScore(b, query) - tourSearchScore(a, query))
    .slice(0, SUGGESTION_LIMIT);
}

function filterCatalog<T extends SearchTour>(catalog: T[], query: string, kind: "story" | "walk"): T[] {
  const q = query.trim();
  if (!q) return [];

  return catalog.filter(
    (tour) =>
      (tour.contentKind ?? "walk") === kind &&
      isWalkCatalogVisible(tour) &&
      tourMatchesSearch(tour, q),
  );
}

export function buildExploreSuggestions<T extends SearchTour>(
  query: string,
  catalog: T[],
  cities: ApiCity[],
): ExploreSuggestions<T> {
  const q = query.trim();
  if (!q) {
    return { cities: [], stories: [], walks: [] };
  }

  const normalizedQuery = normalizeText(q);

  const citySuggestions: ExploreCitySuggestion[] = cities
    .filter((city) => normalizeText(city.name).includes(normalizedQuery))
    .slice(0, SUGGESTION_LIMIT)
    .map((city) => ({
      kind: "city" as const,
      label: city.name,
      sublabel: city.country_name,
    }));

  const storyTours = rankTours(filterCatalog(catalog, q, "story"), q);
  const walkTours = rankTours(filterCatalog(catalog, q, "walk"), q);

  return {
    cities: citySuggestions,
    stories: storyTours.map((tour) => ({ kind: "story" as const, tour })),
    walks: walkTours.map((tour) => ({ kind: "walk" as const, tour })),
  };
}

export type SearchRowSelect<T extends SearchTour = SearchTour> =
  | { type: "city"; value: string }
  | { type: "tour"; tour: T }
  | { type: "href"; href: string };

/** One row of the visual search dropdown; rows form a single ranked list for keyboard navigation. */
export type SearchRow<T extends SearchTour = SearchTour> = {
  key: string;
  kind: "city" | "collection" | "story" | "walk";
  title: string;
  subtitle: string;
  /** City photo or tour cover; collections render an icon tile instead. */
  image?: string;
  contentKind?: "story" | "walk";
  select: SearchRowSelect<T>;
};

const ROW_LIMIT = 8;
const CITY_ROW_LIMIT = 3;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function tourSubtitle(tour: SearchTour): string {
  const kind = (tour.contentKind ?? "walk") === "story" ? "Audio story" : "Audio walk";
  const extra = (tour.contentKind ?? "walk") === "story" ? tour.duration : tour.price > 0 ? `${tour.price} coins` : "Free";
  return [kind, tour.location, extra].filter(Boolean).join(" · ");
}

export function buildSearchRows<T extends SearchTour>(
  query: string,
  catalog: T[],
  cities: (ApiCity & { image: string })[],
): SearchRow<T>[] {
  const q = query.trim();
  if (!q) return [];
  const nq = normalizeText(q);
  const visible = catalog.filter((tour) => isWalkCatalogVisible(tour));

  const matchedCities = cities
    .filter((city) => normalizeText(city.name).includes(nq))
    .sort((a, b) => Number(normalizeText(b.name).startsWith(nq)) - Number(normalizeText(a.name).startsWith(nq)))
    .slice(0, CITY_ROW_LIMIT);

  const rows: SearchRow<T>[] = [];
  matchedCities.forEach((city, index) => {
    const inCity = visible.filter((tour) => tourMatchesCity(tour, city.name));
    rows.push({
      key: `city-${city.id}`,
      kind: "city",
      title: city.name,
      subtitle: [`City in ${city.country_name}`, inCity.length ? plural(inCity.length, "audio tour") : ""].filter(Boolean).join(" · "),
      image: city.image,
      select: { type: "city", value: city.name },
    });
    if (index > 0) return;
    for (const contentKind of ["walk", "story"] as const) {
      const count = inCity.filter((tour) => (tour.contentKind ?? "walk") === contentKind).length;
      if (!count) continue;
      const walk = contentKind === "walk";
      const noun = walk ? (count === 1 ? "audio walk" : "audio walks") : count === 1 ? "audio story" : "audio stories";
      rows.push({
        key: `collection-${contentKind}-${city.id}`,
        kind: "collection",
        contentKind,
        title: `${walk ? "Audio walks" : "Audio stories"} in ${city.name}`,
        subtitle: `${count} ${noun} · ${city.name}, ${city.country_name}`,
        select: {
          type: "href",
          href: `${contentKind === "walk" ? "/marketplace/tours/" : "/marketplace/story/"}?q=${encodeURIComponent(city.name)}`,
        },
      });
    }
  });

  const tours = visible
    .filter((tour) => tourMatchesSearch(tour, q))
    .sort((a, b) => tourSearchScore(b, q) - tourSearchScore(a, q))
    .slice(0, Math.max(ROW_LIMIT - rows.length, 3));

  for (const tour of tours) {
    rows.push({
      key: `tour-${tour.id}`,
      kind: (tour.contentKind ?? "walk") === "story" ? "story" : "walk",
      title: tour.title,
      subtitle: tourSubtitle(tour),
      image: tour.image,
      select: { type: "tour", tour },
    });
  }
  return rows;
}

export function countSearchResults(
  catalog: SearchTour[],
  query: string,
  kind: "story" | "walk",
): number {
  return filterCatalog(catalog, query, kind).length;
}

/** Best matching tour for home-page search submit — prefers exact/prefix title matches. */
export function findBestTourMatch<T extends SearchTour>(query: string, catalog: T[]): T | null {
  const q = query.trim();
  if (!q) return null;

  const stories = rankTours(filterCatalog(catalog, q, "story"), q);
  const walks = rankTours(filterCatalog(catalog, q, "walk"), q);
  const candidates = [...stories, ...walks].sort(
    (a, b) => tourSearchScore(b, q) - tourSearchScore(a, q),
  );

  return candidates[0] ?? null;
}

export type ExploreCatalogTab = "stories" | "walks" | "recommended";

export function getExploreCatalogPath(tab: ExploreCatalogTab): string {
  if (tab === "walks") return "/marketplace/tours";
  if (tab === "stories") return "/marketplace/story";
  return "/marketplace";
}

export function getExploreTabFromPathname(pathname: string): ExploreCatalogTab | null {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (path === "/marketplace/tours" || path === "/explore/tours") return "walks";
  if (path === "/marketplace/story" || path === "/explore/story") return "stories";
  return null;
}

export function getExploreBackHref(pathname: string): string {
  if (pathname.includes("/marketplace/tours") || pathname.includes("/explore/tours")) {
    return "/marketplace/tours";
  }
  if (pathname.includes("/marketplace/story") || pathname.includes("/explore/story")) {
    return "/marketplace/story";
  }
  return "/marketplace";
}
