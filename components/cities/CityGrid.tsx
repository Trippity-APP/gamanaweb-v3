"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CityCard } from "./CityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCities, ApiCity, FetchCitiesParams } from "@/lib/services/cityService";
import { loadSearchCatalog } from "@/lib/search-catalog";
import { CityGridSkeleton } from "@/components/ui/list-skeletons";
import { StoreBadges } from "@/components/site/StoreBadges";

const chipClass = (active: boolean) =>
    `focus-ring inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
        active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink hover:border-ink/30"
    }`;

type FilterType = "all" | "popular" | "new" | "country";

interface CityGridProps {
    isPreview?: boolean;
    showSearch?: boolean;
}

export const CityGrid = ({ isPreview = false, showSearch = false }: CityGridProps) => {
    // Static export has no server to read a query string, so `?q=` from the Home hero
    // search (see components/HeroCitySearch.tsx) is read client-side here instead of
    // passed down as a server prop — this component is already "use client".
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("q") ?? "";

    const [cities, setCities] = useState<ApiCity[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCities, setTotalCities] = useState(0);
    const [totalTours, setTotalTours] = useState(0);
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const effectiveShowSearch = showSearch || Boolean(initialSearch);
    const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);

    // Derive the country filter list from cities that are actually active/published,
    // instead of a static hardcoded list — otherwise the dropdown offers countries
    // (or omits ones) that don't reflect what's really live on the platform.
    useEffect(() => {
        let cancelled = false;

        const loadCountries = async () => {
            try {
                const collected: ApiCity[] = [];
                let page = 1;
                let totalPages = 1;

                do {
                    const res = await fetchCities({ active: true, page, page_size: 200 });
                    if (!res.success) break;
                    collected.push(...res.data.cities);
                    totalPages = res.data.total_pages;
                    page++;
                } while (page <= totalPages);

                const byCode = new Map<string, string>();
                collected.forEach((c) => {
                    if (c.country_code && c.country_name) {
                        byCode.set(c.country_code, c.country_name);
                    }
                });

                const list = Array.from(byCode.entries())
                    .map(([code, name]) => ({ code, name }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                if (!cancelled) setCountries(list);
            } catch (err) {
                // Non-fatal: dropdown just falls back to "By Country" with no options.
                console.error("Failed to load countries for filter", err);
            }
        };

        loadCountries();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const tours = await loadSearchCatalog();
                if (!cancelled) setTotalTours(tours.length);
            } catch {
                if (!cancelled) setTotalTours(0);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadCities = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setPage(1);
            }

            const currentPage = isLoadMore ? page + 1 : 1;
            const pageSize = isPreview ? 8 : 12;

            const params: FetchCitiesParams = {
                page: currentPage,
                page_size: pageSize,
                active: true,
                search: searchQuery || undefined,
            };

            if (activeFilter === "popular") params.filter = "Popular";
            if (activeFilter === "new") params.filter = "New";
            if (activeFilter === "country" && selectedCountry) {
                params.country_code = selectedCountry;
            }

            const response = await fetchCities(params);

            if (response.success) {
                if (isLoadMore) {
                    setCities(prev => [...prev, ...response.data.cities]);
                    setPage(currentPage);
                } else {
                    setCities(response.data.cities);
                    setTotalCities(response.data.total);
                }
                setHasMore(response.data.page < response.data.total_pages);
            } else {
                if (!isLoadMore) {
                    setCities([]);
                    setTotalCities(0);
                }
                setHasMore(false);
            }
        } catch {
            if (!isLoadMore) {
                setCities([]);
                setTotalCities(0);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeFilter, isPreview, page, searchQuery, selectedCountry]);

    // Initial fetch and on filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadCities();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [activeFilter, searchQuery, selectedCountry, loadCities]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadCities(true);
        }
    };

    return (
        <section id="city-grid" className={isPreview ? "py-16 md:py-20" : "py-12 md:py-16"}>
            <div className="container-site">
            <div className="mb-8 flex flex-col gap-6 md:mb-10 xl:flex-row xl:items-end xl:justify-between">
                {isPreview && (
                    <div className="max-w-2xl">
                        <p className="eyebrow mb-3">Destinations</p>
                        <h2 className="text-h2 text-ink">
                            Travel Destinations <span className="text-brand-600">Covered by Gamana</span>
                        </h2>
                        <p className="text-lead mt-4 text-ink-soft">
                            Gamana covers a growing range of travel destinations where you can experience cities through immersive audio stories, local history, cultural insights, and walking experiences. From historic streets to iconic landmarks, each destination offers a hands-free way to experience more as you walk.
                        </p>
                    </div>
                )}

                <div className={`flex w-full flex-col gap-3 md:flex-row md:items-center ${isPreview ? "xl:w-auto xl:justify-end" : ""}`}>
                    {effectiveShowSearch && (
                        <Input
                            type="search"
                            aria-label="Search cities"
                            placeholder="Search cities..."
                            className="h-10 w-full rounded-full border-ink/10 bg-white pl-4 shadow-card md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}

                    <div role="group" aria-label="Filter cities" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
                        {([
                            ["all", "All"],
                            ["popular", "Popular"],
                            ["new", "New"],
                        ] as const).map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={activeFilter === value}
                                onClick={() => {
                                    setActiveFilter(value);
                                    setSelectedCountry(null);
                                }}
                                className={chipClass(activeFilter === value)}
                            >
                                {label}
                            </button>
                        ))}
                        <select
                            aria-label="Filter by country"
                            className={`${chipClass(activeFilter === "country")} appearance-none pr-8 bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat`}
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%235F6E7A%27 stroke-width=%272.5%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E\")" }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setActiveFilter("country");
                                    setSelectedCountry(e.target.value);
                                } else {
                                    setActiveFilter("all");
                                    setSelectedCountry(null);
                                }
                            }}
                            value={activeFilter === "country" ? selectedCountry || "" : ""}
                        >
                            <option value="">By country</option>
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && !loadingMore ? (
                <CityGridSkeleton count={isPreview ? 8 : 12} />
            ) : cities.length === 0 ? (
                <div className="py-16 text-center text-ink-soft md:py-20 text-sm sm:text-base">
                    {searchQuery || activeFilter !== "all" || selectedCountry
                        ? "No cities found matching your criteria."
                        : "No cities available."}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                        {cities.map((city) => (
                            <CityCard key={city.id} city={city} />
                        ))}
                    </div>
                </>
            )}

            {/* Preview Mode CTA */}
            {isPreview && !loading && cities.length > 0 && (
                <div className="mt-10 md:mt-12 text-center space-y-6">
                    <div className="border-t border-ink/10 pt-6 md:pt-8">
                        <p className="mb-6 text-ink-soft text-sm sm:text-base">
                            We have{" "}
                            <strong className="text-ink">
                                {totalTours > 0 ? `${totalTours} audio tours` : "audio tours"}
                            </strong>{" "}
                            across{" "}
                            <strong className="text-ink">
                                {totalCities > 0 ? `${totalCities} cities` : "cities worldwide"}
                            </strong>
                            .
                        </p>
                        <StoreBadges source="cities_grid" keyword="travel guide app" className="justify-center" />
                    </div>
                </div>
            )}

            {/* Full Mode Pagination (Load More) */}
            {!isPreview && hasMore && !loading && cities.length > 0 && (
                <div className="mt-10 md:mt-12 text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="min-w-[200px] rounded-full border-ink/15 px-8 text-ink hover:border-ink hover:bg-ink hover:text-white"
                    >
                        {loadingMore ? "Loading..." : "Load More Cities"}
                    </Button>
                </div>
            )}
            </div>
        </section>
    );
};

