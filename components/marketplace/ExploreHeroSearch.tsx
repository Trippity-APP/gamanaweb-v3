"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, MapPin, Headphones, Footprints } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { fetchCities, type ApiCity } from "@/lib/services/cityService";
import { getTourHref } from "@/lib/marketplace-api";
import { buildExploreSuggestions, findBestTourMatch } from "@/lib/explore-search";
import type { Tour } from "@/lib/marketplace-data";

export type ExploreHeroSearchVariant = "explore" | "home";

type ExploreHeroSearchProps = {
  catalog?: Tour[];
  variant?: ExploreHeroSearchVariant;
  containerClassName?: string;
  /** Explore variant: sync input from URL search query. */
  urlQuery?: string;
};

/**
 * Unified hero search — cities (API), audio stories, and audio walks (local catalog).
 * - explore: filters the current page via ?q=
 * - home: navigates to story/walk detail pages, or /explore?q= for cities
 */
export function ExploreHeroSearch({
  catalog = [],
  variant = "explore",
  containerClassName = "relative w-full max-w-xl mx-auto",
  urlQuery = "",
}: ExploreHeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (variant === "explore") {
      setQuery(urlQuery);
    }
  }, [urlQuery, variant]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setCities([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetchCities({
          search: q,
          active: true,
          page_size: 8,
        });
        if (!cancelled) {
          setCities(response.data?.cities ?? []);
        }
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const suggestions = useMemo(
    () => buildExploreSuggestions(query, catalog, cities),
    [query, catalog, cities],
  );

  const hasSuggestions =
    suggestions.cities.length > 0 ||
    suggestions.stories.length > 0 ||
    suggestions.walks.length > 0;

  const showSuggestions = open && !!query.trim() && (hasSuggestions || loading);

  const goToExploreSearch = (value: string) => {
    setOpen(false);
    setQuery(value);
    router.push(`/explore?q=${encodeURIComponent(value)}`);
  };

  const goToTour = (tour: Tour) => {
    setOpen(false);
    router.push(getTourHref(tour));
  };

  const applyExploreFilter = (value: string) => {
    setOpen(false);
    setQuery(value);
    router.replace(`${pathname}?q=${encodeURIComponent(value)}`);
  };

  const handleSelectCity = (city: string) => {
    if (variant === "home") {
      goToExploreSearch(city);
    } else {
      applyExploreFilter(city);
    }
  };

  const handleSelectTour = (tour: Tour) => {
    if (variant === "home") {
      goToTour(tour);
    } else {
      applyExploreFilter(tour.title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (variant === "home") {
      const normalized = trimmed.toLowerCase();
      const bestTour = findBestTourMatch(trimmed, catalog);

      if (bestTour) {
        const title = bestTour.title.toLowerCase();
        if (title === normalized || title.startsWith(normalized)) {
          goToTour(bestTour);
          return;
        }
      }

      const topCity = suggestions.cities[0];
      if (topCity) {
        const cityName = topCity.label.toLowerCase();
        if (
          cityName === normalized ||
          cityName.startsWith(normalized) ||
          normalized.startsWith(cityName)
        ) {
          goToExploreSearch(topCity.label);
          return;
        }
      }

      if (bestTour) {
        goToTour(bestTour);
        return;
      }

      if (topCity) {
        goToExploreSearch(topCity.label);
        return;
      }

      goToExploreSearch(trimmed);
      return;
    }

    if (suggestions.cities[0]) {
      applyExploreFilter(suggestions.cities[0].label);
    } else if (suggestions.stories[0]) {
      applyExploreFilter(suggestions.stories[0].tour.title);
    } else if (suggestions.walks[0]) {
      applyExploreFilter(suggestions.walks[0].tour.title);
    } else {
      applyExploreFilter(trimmed);
    }
  };

  return (
    <Popover open={showSuggestions} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={containerClassName}>
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search stories, walks, or cities…"
              className="w-full h-13 rounded-full bg-white/95 backdrop-blur-sm pl-11 pr-24 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:from-[#128a86] hover:to-[#164e63] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align={variant === "home" ? "start" : "center"}
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] max-w-xl rounded-xl border border-gray-100 bg-white p-0 shadow-xl max-h-[min(70vh,420px)] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading && !hasSuggestions ? (
          <div className="px-4 py-3 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : !hasSuggestions ? (
          <p className="px-4 py-3 text-sm text-gray-500">
            {variant === "home"
              ? "No matches found. Press Search to browse Explore."
              : "No matches found. Press Search to try anyway."}
          </p>
        ) : (
          <div className="py-1">
            {suggestions.cities.length > 0 && (
              <div>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Cities
                </p>
                {suggestions.cities.map((city) => (
                  <button
                    key={city.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectCity(city.label)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F0FBFA] transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#159895] shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{city.label}</span>
                    {city.sublabel && (
                      <span className="text-xs text-gray-400">{city.sublabel}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {suggestions.stories.length > 0 && (
              <div>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Audio Stories
                </p>
                {suggestions.stories.map(({ tour }) => (
                  <button
                    key={tour.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectTour(tour)}
                    className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-[#F0FBFA] transition-colors"
                  >
                    <Headphones className="h-3.5 w-3.5 text-[#159895] shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{tour.title}</span>
                      <span className="block text-xs text-gray-400 truncate">{tour.location}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {suggestions.walks.length > 0 && (
              <div>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Audio Walks
                </p>
                {suggestions.walks.map(({ tour }) => (
                  <button
                    key={tour.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectTour(tour)}
                    className="w-full flex items-start gap-2.5 px-4 py-2.5 text-left hover:bg-[#F0FBFA] transition-colors"
                  >
                    <Footprints className="h-3.5 w-3.5 text-[#159895] shrink-0 mt-0.5" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{tour.title}</span>
                      <span className="block text-xs text-gray-400 truncate">{tour.location}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
