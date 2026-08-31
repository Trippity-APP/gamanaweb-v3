import Link from "next/link";
import { ArrowLeft, MapPin, Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { getTourHref } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";
import type { ApiCity } from "@/lib/services/cityService";
import { getCityHref } from "@/lib/services/cityService";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&fit=crop";

type CityDetailProps = {
    city: ApiCity;
    tours: Tour[];
    relatedCities?: ApiCity[];
};

export function CityDetail({ city, tours, relatedCities = [] }: CityDetailProps) {
    const imageUrl = city.images?.[0] ?? FALLBACK_IMAGE;
    const locationLabel = [city.state_name, city.country_name].filter(Boolean).join(", ");

    return (
        <div className="max-w-5xl mx-auto px-4 pb-16">
            <div className="pt-6">
                <Link
                    href="/cities"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#159895] hover:text-[#128a86]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all cities
                </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="relative h-56 sm:h-80 bg-gray-100">
                    <MarketplaceCoverImage
                        src={imageUrl}
                        alt={city.name}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {city.is_new && (
                                <Badge className="bg-gradient-to-r from-[#1A5F7A] to-[#159895] text-white border-0">
                                    NEW
                                </Badge>
                            )}
                            {city.is_popular && (
                                <Badge className="bg-[#0B6E4F] text-white border-0">POPULAR</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold drop-shadow-md">{city.name}</h1>
                        <p className="mt-2 text-sm sm:text-base text-white/90 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {locationLabel}
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-900">Explore {city.name} with Gamana</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Walk {city.name} at your own pace with location-aware audio stories. No tour groups,
                            no rigid schedules — just open the app, arrive at a landmark, and listen.
                        </p>
                    </div>

                    <Button
                        asChild
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1A5F7A] to-[#159895] text-white hover:opacity-90 shadow-md rounded-xl"
                    >
                        <Link href={`/marketplace?city=${encodeURIComponent(city.name)}`}>
                            <Play className="mr-2 h-4 w-4 fill-current" />
                            Browse tours in {city.name}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-10 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {tours.length > 0 ? `Audio tours in ${city.name}` : `Tours coming soon in ${city.name}`}
                </h2>

                {tours.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tours.slice(0, 6).map((tour) => (
                            <Link
                                key={tour.id}
                                href={getTourHref(tour)}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-36 bg-gray-100">
                                    <MarketplaceCoverImage
                                        src={tour.image}
                                        alt={tour.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="p-4 space-y-2">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{tour.title}</p>
                                    <p className="text-xs text-gray-500">{tour.duration}</p>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                        <span className="font-semibold text-gray-900">{tour.rating}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        We&apos;re adding audio tours for {city.name}. Check back soon or explore nearby cities below.
                    </p>
                )}
            </div>

            {relatedCities.length > 0 && (
                <div className="mt-10 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">More in {city.country_name}</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedCities.map((related) => (
                            <Link
                                key={related.id}
                                href={getCityHref(related)}
                                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                            >
                                <p className="text-sm font-semibold text-gray-900">{related.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{related.state_name}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
