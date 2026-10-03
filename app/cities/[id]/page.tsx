import type { Metadata } from "next";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { CityDetailPageClient } from "@/components/cities/CityDetailPageClient";
import {
    fetchAllActiveCities,
    fetchCityById,
    type ApiCity,
} from "@/lib/services/cityService";
import type { Tour } from "@/lib/marketplace-data";
import { fetchPublicTours, tourMatchesCity } from "@/lib/marketplace-api";
import { STATIC_SPA_PARAM, isStaticSpaParam } from "@/lib/static-spa";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd, touristDestinationJsonLd } from "@/lib/seo";
import { getCityFallbackImage } from "@/lib/city-image";
import { getDestinationImage } from "@/lib/data/destination-images";

export async function generateStaticParams() {
    try {
        const cities = await fetchAllActiveCities();
        if (cities.length > 0) {
            return [...cities.map((city) => ({ id: city.id })), { id: STATIC_SPA_PARAM }];
        }
    } catch {
        // Build-time API may be unavailable.
    }

    return [{ id: STATIC_SPA_PARAM }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    if (isStaticSpaParam(id)) {
        return { title: "City | Gamana" };
    }

    const city = await fetchCityById(id);
    if (!city) {
        return { title: "City not found | Gamana" };
    }

    const title = `${city.name} Audio Tours | Gamana`;
    const description = `Explore ${city.name} with Gamana's self-guided audio tours. Walk at your own pace and listen to stories across ${city.country_name}.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://www.gamana.app/cities/${city.id}/`,
        },
        openGraph: {
            title,
            description,
            url: `https://www.gamana.app/cities/${city.id}/`,
            siteName: "Gamana",
            type: "website",
        },
    };
}

/** Same-country cities first (popular ones leading), topped up with popular cities elsewhere. */
function getRelatedCities(city: ApiCity, allCities: ApiCity[]): ApiCity[] {
    const others = allCities.filter((item) => item.id !== city.id && item.active);
    const byPopularity = (a: ApiCity, b: ApiCity) => Number(Boolean(b.is_popular)) - Number(Boolean(a.is_popular));
    const sameCountry = others.filter((item) => item.country_code === city.country_code).sort(byPopularity);
    const popularElsewhere = others.filter((item) => item.country_code !== city.country_code && item.is_popular);
    return [...sameCountry, ...popularElsewhere].slice(0, 10);
}

export default async function CityPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cityId = isStaticSpaParam(id) ? null : id;
    const city = cityId ? await fetchCityById(cityId) : null;

    let tours: Tour[] = [];
    let relatedCities: ApiCity[] = [];

    if (city) {
        const [allTours, allCities] = await Promise.all([
            fetchPublicTours(),
            fetchAllActiveCities(),
        ]);
        tours = allTours.filter((tour) => tourMatchesCity(tour, city.name)).slice(0, 12);
        relatedCities = getRelatedCities(city, allCities);
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
            {city && (
                <JsonLd
                    data={[
                        breadcrumbJsonLd([
                            { name: "Home", path: "/" },
                            { name: "Cities", path: "/cities/" },
                            { name: city.name, path: `/cities/${city.id}/` },
                        ]),
                        touristDestinationJsonLd({
                            name: city.name,
                            path: `/cities/${city.id}/`,
                            image: getDestinationImage(city.id)?.wide?.src ?? getCityFallbackImage(city).src,
                            description: `Explore ${city.name} with Gamana self-guided audio tours across ${city.country_name}.`,
                        }),
                    ]}
                />
            )}
            <CityDetailPageClient
                cityId={id}
                city={city}
                tours={tours}
                relatedCities={relatedCities}
            />
            <Footer />
        </main>
    );
}
