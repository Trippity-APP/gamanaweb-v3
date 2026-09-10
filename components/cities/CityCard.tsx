"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, MapPin, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { City } from "@/lib/data/cities";
import { ApiCity, getCityHref } from "@/lib/services/cityService";
import { cn } from "@/lib/utils";

interface CityCardProps {
    city: City | ApiCity;
}

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&fit=crop";

export const CityCard = ({ city }: CityCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Normalize data
    const cityName = city.name;
    const countryName = 'country' in city ? city.country : city.country_name;
    const description = 'description' in city ? city.description : `${cityName} in ${countryName}`;
    const tags = 'tags' in city ? city.tags : [];
    const isNew = 'isNew' in city ? city.isNew : (city as ApiCity).is_new;
    const isPopular = 'isPopular' in city ? city.isPopular : (city as ApiCity).is_popular;
    const imageUrl = 'image' in city ? city.image : (city.images && city.images.length > 0 ? city.images[0] : FALLBACK_IMAGE);
    
    const details = 'details' in city ? city.details : {
        intro: `Explore the beautiful city of ${cityName}.`,
        highlights: [city.state_name, countryName].filter(Boolean),
        languages: ["English"] // Default
    };

    const cityHref = "id" in city && city.id ? getCityHref(city as ApiCity) : null;
    const [imgSrc, setImgSrc] = useState(imageUrl);

    const handleImgError = () => setImgSrc(FALLBACK_IMAGE);

    const titleBlock = (
        <>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    {countryName}
                </span>
                {isNew && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-[#1A5F7A] to-[#159895] text-white border-0 text-[10px] h-5 px-1.5 shadow-sm">
                        NEW
                    </Badge>
                )}
                {isPopular && (
                    <Badge variant="secondary" className="bg-[#0B6E4F] text-white hover:bg-[#0B6E4F]/90 border-0 text-[10px] h-5 px-1.5 shadow-sm">
                        POPULAR
                    </Badge>
                )}
            </div>
            <h3 className="text-2xl font-bold leading-tight drop-shadow-md">{cityName}</h3>
        </>
    );

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card text-card-foreground transition-all duration-300 hover:border-[#159895]/50",
                isExpanded ? "ring-2 ring-[#159895] shadow-lg border-[#159895]" : "hover:shadow-md border-muted"
            )}
        >
            {/* Card Header / Image Area */}
            <div
                className="relative h-48 w-full cursor-pointer overflow-hidden"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imgSrc}
                    alt={cityName}
                    onError={handleImgError}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-white">
                    {cityHref ? (
                        <Link href={cityHref} className="block hover:opacity-95 transition-opacity">
                            {titleBlock}
                        </Link>
                    ) : (
                        titleBlock
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[40px]">
                    {description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal text-muted-foreground bg-slate-50">
                            {tag}
                        </Badge>
                    ))}
                    {tags.length > 3 && (
                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground bg-slate-50">
                            +{tags.length - 3}
                        </Badge>
                    )}
                </div>

                <Button
                    variant={isExpanded ? "secondary" : "default"}
                    className={cn(
                        "w-full justify-between transition-all duration-300 rounded-xl",
                        !isExpanded && "bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] text-white border-0 shadow-md hover:shadow-lg"
                    )}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? "Close" : "Open"}
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {/* Expanded Content */}
                <div
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-[#159895]/20" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-[#1A5F7A]">
                            <MapPin className="h-4 w-4 text-[#159895]" />
                            What Gamana covers
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            {details.intro}
                        </p>

                        <h4 className="font-semibold mb-2 text-sm text-[#1A5F7A]">Highlights</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                            {details.highlights.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#159895]/60 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col gap-3">
                            <div className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">Languages: </span>
                                {details.languages.join(", ")}
                            </div>


                            {/* Routes into Explore pre-filtered to this city rather than out
                                to the app store, MarketplaceBrowser reads ?city= client-side
                                and seeds both the Tours and Experiences filters from it. */}
                            {cityHref && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full rounded-xl"
                                >
                                    <Link href={cityHref}>View city page</Link>
                                </Button>
                            )}

                            <Button
                                asChild
                                className="w-full bg-gradient-to-r from-[#1A5F7A] to-[#159895] text-white hover:opacity-90 shadow-md rounded-xl"
                            >
                                <Link href={`/explore?city=${encodeURIComponent(cityName)}`}>
                                    <Play className="mr-2 h-4 w-4 fill-current" />
                                    Explore this City
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
