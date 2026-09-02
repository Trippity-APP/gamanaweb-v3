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

export async function generateStaticParams() {
    try {
        const cities = await fetchAllActiveCities();
        if (cities.length > 0) {
            return cities.map((city) => ({ id: city.id }));
        }
    } catch {
        // Build-time API may be unavailable.
    }

    return [{ id: "[id]" }];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    if (id === "[id]") {
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
            canonical: `https://www.gamana.app/cities/${city.id}`,
        },
        openGraph: {
            title,
            description,
            url: `https://www.gamana.app/cities/${city.id}`,
            siteName: "Gamana",
            type: "website",
        },
    };
}

function getRelatedCities(city: ApiCity, allCities: ApiCity[]): ApiCity[] {
    return allCities
        .filter(
            (item) =>
                item.id !== city.id &&
                item.country_code === city.country_code &&
                item.active
        )
        .slice(0, 4);
}

export default async function CityPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cityId = id === "[id]" ? null : id;
    const city = cityId ? await fetchCityById(cityId) : null;

    let tours: Tour[] = [];
    let relatedCities: ApiCity[] = [];

    if (city) {
        const [allTours, allCities] = await Promise.all([
            fetchPublicTours(),
            fetchAllActiveCities(),
        ]);
        tours = allTours.filter((tour) => tourMatchesCity(tour, city.name)).slice(0, 6);
        relatedCities = getRelatedCities(city, allCities);
    }

    return (
        <main className="min-h-screen bg-background">
            <Header />
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
