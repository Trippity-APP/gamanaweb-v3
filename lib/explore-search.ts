import type { ApiCity } from "@/lib/services/cityService";
import type { Tour } from "@/lib/marketplace-data";
import { isWalkCatalogVisible, tourMatchesSearch } from "@/lib/marketplace-api";

export type ExploreCitySuggestion = {
  kind: "city";
  label: string;
  sublabel?: string;
};

export type ExploreTourSuggestion = {
  kind: "story" | "walk";
  tour: Tour;
};

export type ExploreSuggestions = {
  cities: ExploreCitySuggestion[];
  stories: ExploreTourSuggestion[];
  walks: ExploreTourSuggestion[];
};

const SUGGESTION_LIMIT = 5;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function tourSearchScore(tour: Tour, query: string): number {
  const q = normalizeText(query);
  const title = normalizeText(tour.title);
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  return 40;
}

function rankTours(tours: Tour[], query: string): Tour[] {
  return [...tours]
    .sort((a, b) => tourSearchScore(b, query) - tourSearchScore(a, query))
    .slice(0, SUGGESTION_LIMIT);
}

function filterCatalog(catalog: Tour[], query: string, kind: "story" | "walk"): Tour[] {
  const q = query.trim();
  if (!q) return [];

  return catalog.filter(
    (tour) =>
      (tour.contentKind ?? "walk") === kind &&
      isWalkCatalogVisible(tour) &&
      tourMatchesSearch(tour, q),
  );
}

export function buildExploreSuggestions(
  query: string,
  catalog: Tour[],
  cities: ApiCity[],
): ExploreSuggestions {
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

export function countSearchResults(
  catalog: Tour[],
  query: string,
  kind: "story" | "walk",
): number {
  return filterCatalog(catalog, query, kind).length;
}

/** Best matching tour for home-page search submit — prefers exact/prefix title matches. */
export function findBestTourMatch(query: string, catalog: Tour[]): Tour | null {
  const q = query.trim();
  if (!q) return null;

  const stories = rankTours(filterCatalog(catalog, q, "story"), q);
  const walks = rankTours(filterCatalog(catalog, q, "walk"), q);
  const candidates = [...stories, ...walks].sort(
    (a, b) => tourSearchScore(b, q) - tourSearchScore(a, q),
  );

  return candidates[0] ?? null;
}
