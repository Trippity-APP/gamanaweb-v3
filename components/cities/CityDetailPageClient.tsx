"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CityDetail } from "@/components/cities/CityDetail";
import { fetchCityById, type ApiCity } from "@/lib/services/cityService";
import { fetchPublicTours, tourMatchesCity } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";
import { isStaticSpaParam } from "@/lib/static-spa";

function resolveCityId(paramId: string): string {
    if (!isStaticSpaParam(paramId)) return paramId;
    if (typeof window === "undefined") return paramId;
    const match = window.location.pathname.match(/\/cities\/([^/]+)/);
    return match?.[1] ?? paramId;
}

type CityDetailPageClientProps = {
    cityId: string;
    city: ApiCity | null;
    tours: Tour[];
    relatedCities: ApiCity[];
};

export function CityDetailPageClient({
    cityId: paramCityId,
    city: initialCity,
    tours: initialTours,
    relatedCities: initialRelatedCities,
}: CityDetailPageClientProps) {
    const [city, setCity] = useState<ApiCity | null>(initialCity);
    const [tours, setTours] = useState<Tour[]>(initialTours);
    const [relatedCities, setRelatedCities] = useState<ApiCity[]>(initialRelatedCities);
    const [loading, setLoading] = useState(isStaticSpaParam(paramCityId) && !initialCity);
    const [error, setError] = useState<string | null>(
        initialCity ? null : isStaticSpaParam(paramCityId) ? null : "This city is not available."
    );

    // Pre-rendered pages carry image URLs signed at build time, which expire after 24h.
    useEffect(() => {
        if (!initialCity) return;
        let cancelled = false;
        void fetchCityById(initialCity.id).then((fresh) => {
            if (!cancelled && fresh?.images?.length) {
                setCity((current) => (current ? { ...current, images: fresh.images } : current));
            }
        });
        return () => {
            cancelled = true;
        };
    }, [initialCity]);

    useEffect(() => {
        if (initialCity || !isStaticSpaParam(paramCityId)) return;

        const resolved = resolveCityId(paramCityId);
        if (isStaticSpaParam(resolved)) return;

        void (async () => {
            setLoading(true);
            setError(null);
            try {
                const detail = await fetchCityById(resolved);
                if (!detail) {
                    setCity(null);
                    setTours([]);
                    setRelatedCities([]);
                    setError("This city is not available.");
                    return;
                }

                const allTours = await fetchPublicTours();
                setCity(detail);
                setTours(allTours.filter((tour) => tourMatchesCity(tour, detail.name)).slice(0, 12));
                setRelatedCities([]);
            } catch {
                setCity(null);
                setTours([]);
                setRelatedCities([]);
                setError("We couldn't load this city right now.");
            } finally {
                setLoading(false);
            }
        })();
    }, [paramCityId, initialCity]);

    if (loading) {
        return (
            <div className="container-site py-24 text-center text-ink-muted" role="status">
                Loading city...
            </div>
        );
    }

    if (error || !city) {
        return (
            <div className="container-site space-y-4 py-24 text-center">
                <p className="text-ink-soft">{error ?? "City not found."}</p>
                <Button asChild variant="outline" className="rounded-full border-ink/15">
                    <Link href="/cities">Back to all cities</Link>
                </Button>
            </div>
        );
    }

    return <CityDetail city={city} tours={tours} relatedCities={relatedCities} />;
}
