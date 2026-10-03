"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Headphones, Languages, MapPin, Play, WifiOff } from "@/components/icons";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { CardRail } from "@/components/site/CardRail";
import { DownloadBand } from "@/components/site/DownloadBand";
import { RelatedRail } from "@/components/marketplace/detail/RelatedRail";
import { CityCard } from "@/components/cities/CityCard";
import type { Tour } from "@/lib/marketplace-data";
import type { ApiCity } from "@/lib/services/cityService";
import { getApiCityImageUrl, getCuratedCityImage, type CityImage } from "@/lib/city-image";
import { NEUTRAL_CITY_WIDE_IMAGE, getDestinationImage } from "@/lib/data/destination-images";

import { IconTile, toneFor } from "@/components/icons/IconTile";
type CityDetailProps = {
    city: ApiCity;
    tours: Tour[];
    relatedCities?: ApiCity[];
};

/** Wide curated photo first, then the city's own API photo, then a neutral wide travel photo. */
function useHeroImage(city: ApiCity): { image: CityImage; onError: () => void } {
    const [failed, setFailed] = useState(false);
    const curatedWide = getDestinationImage(city.id)?.wide;
    const api = getApiCityImageUrl(city);
    const fallback = getCuratedCityImage(city) ?? NEUTRAL_CITY_WIDE_IMAGE;
    const image: CityImage =
        curatedWide ??
        (api && !failed ? { src: api, alt: `${city.name} skyline and landmarks, explored with Gamana audio tours` } : fallback);
    return { image, onError: () => setFailed(true) };
}

export function CityDetail({ city, tours, relatedCities = [] }: CityDetailProps) {
    const { image, onError } = useHeroImage(city);
    const locationLabel = [city.state_name, city.country_name].filter(Boolean).join(", ");
    const exploreHref = `/marketplace/?q=${encodeURIComponent(city.name)}`;

    return (
        <>
            <section className="relative isolate flex min-h-[420px] items-end overflow-hidden bg-ink sm:min-h-[480px] lg:min-h-[540px]">
                {image.photo ? (
                    <ResponsiveImage
                        image={image.photo}
                        alt={image.alt}
                        title={image.title}
                        fill
                        priority
                        sizes="100vw"
                        className="-z-20"
                    />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image.src}
                        alt={image.alt}
                        fetchPriority="high"
                        onError={onError}
                        className="absolute inset-0 -z-20 h-full w-full object-cover"
                    />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10" aria-hidden />

                <div className="container-site w-full pb-10 pt-24 sm:pb-14">
                    <nav aria-label="Breadcrumb" className="mb-5">
                        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/80">
                            <li>
                                <Link href="/" className="focus-ring rounded hover:text-white">Home</Link>
                            </li>
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                            <li>
                                <Link href="/cities" className="focus-ring rounded hover:text-white">Cities</Link>
                            </li>
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                            <li aria-current="page" className="font-semibold text-white">{city.name}</li>
                        </ol>
                    </nav>

                    <div className="flex flex-wrap items-center gap-2">
                        {city.is_popular && (
                            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink">Popular</span>
                        )}
                        {city.is_new && (
                            <span className="rounded-full bg-sunset-500 px-3 py-1 text-xs font-bold text-white">New</span>
                        )}
                    </div>
                    <h1 className="text-display mt-3 text-balance text-white drop-shadow-sm">
                        {city.name}
                    </h1>
                    {locationLabel && (
                        <p className="mt-3 flex items-center gap-2 text-base text-white/85 sm:text-lg">
                            <MapPin className="h-4 w-4" aria-hidden />
                            {locationLabel}
                        </p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={exploreHref}
                            className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 px-6 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none"
                        >
                            <Play className="h-4 w-4 fill-current" aria-hidden />
                            Browse tours in {city.name}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section-tight">
                <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
                    <div>
                        <p className="eyebrow mb-3">Self-guided audio</p>
                        <h2 className="text-h2 text-ink">Explore {city.name} with Gamana</h2>
                        <p className="text-lead mt-4 max-w-2xl text-ink-soft">
                            Walk {city.name} at your own pace with location-aware audio stories. No tour groups,
                            no rigid schedules, just open the app, arrive at a landmark, and listen.
                        </p>
                    </div>
                    <ul className="grid grid-cols-3 gap-3 rounded-4xl border border-ink/5 bg-white p-5 shadow-card">
                        {[
                            { icon: Headphones, value: tours.length >= 12 ? "12+" : tours.length > 0 ? String(tours.length) : "Soon", label: "Audio tours" },
                            { icon: Languages, value: "7", label: "Languages" },
                            { icon: WifiOff, value: "Offline", label: "Ready" },
                        ].map(({ icon: Icon, value, label }, i) => (
                            <li key={label} className="text-center">
                                <IconTile icon={Icon} tone={toneFor(i)} size="sm" className="mx-auto mb-2 h-10 w-10" />
                                <p className="font-display text-lg font-bold text-ink">{value}</p>
                                <p className="text-xs text-ink-muted">{label}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {tours.length > 0 ? (
                <RelatedRail title={`Audio tours in ${city.name}`} tours={tours} />
            ) : (
                <section className="section-tight border-t border-ink/5 bg-white">
                    <div className="container-site">
                        <h2 className="text-h3 text-ink">Tours coming soon in {city.name}</h2>
                        <p className="mt-3 max-w-2xl text-ink-soft">
                            We&apos;re adding audio tours for {city.name}. Check back soon or explore nearby cities below.
                        </p>
                    </div>
                </section>
            )}

            {relatedCities.length > 0 && (
                <section className="section-tight">
                    <div className="container-site">
                        <h2 className="text-h3 mb-6 text-ink">More cities in {city.country_name}</h2>
                        <CardRail label={`More cities in ${city.country_name}`}>
                            {relatedCities.map((related) => (
                                <div key={related.id} className="w-[15rem] sm:w-[17rem]">
                                    <CityCard city={related} />
                                </div>
                            ))}
                        </CardRail>
                    </div>
                </section>
            )}

            <DownloadBand
                title={<>Hear {city.name} come alive in the Gamana app</>}
                lead="Download free, pick a walk, and let the stories play as you reach each landmark."
                source="city_detail"
                keyword="city audio guide app"
            />
        </>
    );
}
