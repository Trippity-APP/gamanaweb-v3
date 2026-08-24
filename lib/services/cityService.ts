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
    is_popular?: boolean; // Based on common patterns, adding potential fields
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

export interface FetchCitiesParams {
    country_code?: string;
    state_code?: string;
    search?: string;
    active?: boolean;
    filter?: "Popular" | "New" | "All";
    page?: number;
    page_size?: number;
}

const BASE_URL = "https://apidev.gamana.app/api/v1";

export const fetchCities = async (params: FetchCitiesParams = {}): Promise<CityResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.country_code) queryParams.append("country_code", params.country_code);
    if (params.state_code) queryParams.append("state_code", params.state_code);
    if (params.search) queryParams.append("search", params.search);
    if (params.active !== undefined) queryParams.append("active", params.active.toString());
    if (params.filter) queryParams.append("filter", params.filter);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size) queryParams.append("page_size", params.page_size.toString());

    const url = `${BASE_URL}/locations/cities?${queryParams.toString()}`;
    
    const response = await fetch(url, {
        headers: {
            "accept": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    return response.json();
};
