"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { City } from "@/lib/data/cities";
import { ApiCity, getCityHref } from "@/lib/services/cityService";
import { getCityFallbackImage, getCityImage, type CityImage } from "@/lib/city-image";

interface CityCardProps {
    city: City | ApiCity;
}

const SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";
const IMAGE_CLASS = "object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110 motion-reduce:transition-none";

/** Portrait destination tile (same look as the home CityTile) with a local fallback for expired API images. */
export const CityCard = ({ city }: CityCardProps) => {
    const cityName = city.name;
    const countryName = "country" in city ? city.country : city.country_name;
    const isNew = "isNew" in city ? city.isNew : (city as ApiCity).is_new;
    const isPopular = "isPopular" in city ? city.isPopular : (city as ApiCity).is_popular;

    const fallback: CityImage = "image" in city ? { src: city.image, alt: cityName } : getCityFallbackImage(city);
    const primary: CityImage = "image" in city ? fallback : getCityImage(city);
    const [failed, setFailed] = useState(false);
    const image = failed ? fallback : primary;

    const cityHref = "id" in city && city.id ? getCityHref(city as ApiCity) : `/marketplace/?q=${encodeURIComponent(cityName)}`;

    return (
        <Link
            href={cityHref}
            className="focus-ring group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-ink shadow-card transition-shadow duration-500 hover:shadow-lift"
        >
            {image.photo ? (
                <ResponsiveImage image={image.photo} alt={image.alt} title={image.title} sizes={SIZES} fill className={IMAGE_CLASS} />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => !failed && setFailed(true)}
                    className={`absolute inset-0 h-full w-full ${IMAGE_CLASS}`}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" aria-hidden />

            {(isPopular || isNew) && (
                <div className="absolute left-3 top-3 flex gap-1.5">
                    {isPopular && (
                        <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-ink shadow-sm">Popular</span>
                    )}
                    {isNew && (
                        <span className="rounded-full bg-sunset-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">New</span>
                    )}
                </div>
            )}
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100 group-focus-visible:opacity-100">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
            </span>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{cityName}</h3>
                {countryName && <p className="mt-0.5 text-sm text-white/75">{countryName}</p>}
            </div>
        </Link>
    );
};
