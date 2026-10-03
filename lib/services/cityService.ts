export interface ApiCity {
    id: string;
    name: string;
    state_code: string;
    state_name: string;
    country_code: string;
    country_name: string;
    latitude: string;
    longitude: string;
    images: string[];
    active: boolean;
    is_popular?: boolean;
    is_new?: boolean;
}

export interface CityResponse {
    success: boolean;
    data: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
        count: number;
        cities: ApiCity[];
    };
}

type CityDetailResponse = {
    success: boolean;
    data: ApiCity;
};

export interface FetchCitiesParams {
    country_code?: string;
    state_code?: string;
    search?: string;
    active?: boolean;
    filter?: "Popular" | "New" | "All";
    page?: number;
    page_size?: number;
}

const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";

/**
 * City images are signed URLs that expire after 24h, so the browser must never reuse
 * an old response. Static export builds still need a cacheable fetch; the build script
 * clears `.next/cache/fetch-cache` first so each deploy starts from fresh data.
 */
function cityFetchInit(): RequestInit {
    if (typeof window !== "undefined" || process.env.NODE_ENV === "development") {
        return { cache: "no-store" };
    }
    return { cache: "force-cache" };
}

export function getCityApiBaseUrl(): string {
    return (
        process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
        process.env.NEXT_PUBLIC_BLOG_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.BLOG_API_URL ||
        DEFAULT_API_URL
    ).replace(/\/$/, "");
}

export function getCityHref(city: Pick<ApiCity, "id">): string {
    return `/cities/${city.id}`;
}

export const fetchCities = async (params: FetchCitiesParams = {}): Promise<CityResponse> => {
    const queryParams = new URLSearchParams();

    if (params.country_code) queryParams.append("country_code", params.country_code);
    if (params.state_code) queryParams.append("state_code", params.state_code);
    if (params.search) queryParams.append("search", params.search);
    if (params.active !== undefined) queryParams.append("active", params.active.toString());
    if (params.filter) queryParams.append("filter", params.filter);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size) queryParams.append("page_size", params.page_size.toString());

    const url = `${getCityApiBaseUrl()}/locations/cities?${queryParams.toString()}`;

    const response = await fetch(url, {
        headers: {
            accept: "application/json",
        },
        ...cityFetchInit(),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    return response.json();
};

export async function fetchCityById(id: string): Promise<ApiCity | null> {
    const baseUrl = getCityApiBaseUrl();

    try {
        const response = await fetch(`${baseUrl}/locations/cities/${id}`, {
            headers: { accept: "application/json" },
            ...cityFetchInit(),
        });

        if (!response.ok) return null;

        const payload = (await response.json()) as CityDetailResponse;
        return payload.success ? payload.data : null;
    } catch {
        return null;
    }
}

export async function fetchAllActiveCities(): Promise<ApiCity[]> {
    const cities: ApiCity[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const response = await fetchCities({ active: true, page, page_size: 200 });
        if (!response.success) break;
        cities.push(...response.data.cities);
        totalPages = response.data.total_pages;
        page++;
    } while (page <= totalPages);

    return cities;
}
