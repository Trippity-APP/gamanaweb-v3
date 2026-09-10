"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CityCard } from "./CityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCities, ApiCity, FetchCitiesParams } from "@/lib/services/cityService";
import { fetchPublicTours } from "@/lib/marketplace-api";
import { CityGridSkeleton } from "@/components/ui/list-skeletons";

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
                const tours = await fetchPublicTours();
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col xl:flex-row items-end xl:items-center justify-between mb-8 md:mb-10 gap-4 md:gap-6">
                {isPreview && (
                    <div className="w-full xl:w-auto">
                        <p className="text-sm font-semibold text-[#1A5F7A] uppercase tracking-wider mb-2">
                            Destinations
                        </p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-foreground leading-tight">
                            Explore <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Our Cities</span>
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
                            Find your next audio adventure.
                        </p>
                    </div>
                )}

                {/* Search & Filters */}
                <div className={`flex flex-col md:flex-row gap-4 w-full ${isPreview ? "xl:w-auto xl:justify-end" : ""}`}>
                    {/* Search Input - shown when explicitly requested, or when arriving with ?q= */}
                    {effectiveShowSearch && (
                        <div className="relative w-full md:w-64">
                            <Input
                                placeholder="Search cities..."
                                className="pl-4 rounded-full bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={activeFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setActiveFilter("all");
                                setSelectedCountry(null);
                            }}
                            className="rounded-full shadow-sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={activeFilter === "popular" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setActiveFilter("popular");
                                setSelectedCountry(null);
                            }}
                            className="rounded-full shadow-sm"
                        >
                            Popular
                        </Button>
                        <Button
                            variant={activeFilter === "new" ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setActiveFilter("new");
                                setSelectedCountry(null);
                            }}
                            className="rounded-full shadow-sm"
                        >
                            New
                        </Button>

                        <select
                            className="h-9 w-[140px] rounded-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-white"
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
                            <option value="">By Country</option>
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
                <div className="text-center py-16 md:py-20 text-muted-foreground text-sm sm:text-base">
                    {searchQuery || activeFilter !== "all" || selectedCountry
                        ? "No cities found matching your criteria."
                        : "No cities available."}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {cities.map((city) => (
                            <CityCard key={city.id} city={city} />
                        ))}
                    </div>
                </>
            )}

            {/* Preview Mode CTA */}
            {isPreview && !loading && cities.length > 0 && (
                <div className="mt-10 md:mt-12 text-center space-y-6">
                    <div className="pt-6 md:pt-8 border-t border-border">
                        <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                            We have{" "}
                            <strong className="text-foreground">
                                {totalTours > 0 ? `${totalTours} audio tours` : "audio tours"}
                            </strong>{" "}
                            across{" "}
                            <strong className="text-foreground">
                                {totalCities > 0 ? `${totalCities} cities` : "cities worldwide"}
                            </strong>
                            .
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:scale-105 transition-transform"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Download Gamana on Android"
                                    className="h-12 w-auto"
                                />
                            </a>
                            <a
                                href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:scale-105 transition-transform"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                    alt="Download Gamana on iOS"
                                    className="h-12 w-auto"
                                />
                            </a>
                        </div>
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
                        className="rounded-full px-8 shadow-sm border-[#159895] text-[#1A5F7A] hover:bg-gradient-to-r hover:from-[#159895] hover:to-[#1A5F7A] hover:text-white hover:border-transparent min-w-[200px]"
                    >
                        {loadingMore ? "Loading..." : "Load More Cities"}
                    </Button>
                </div>
            )}
            </div>
        </section>
    );
};

