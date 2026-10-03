import { DESTINATION_IMAGES, NEUTRAL_CITY_IMAGE } from "@/lib/data/destination-images";
import type { ImageVariant } from "@/lib/images";
import type { ApiCity } from "@/lib/services/cityService";

export type CityImage = { src: string; alt: string; title?: string; photo?: ImageVariant };

/** Curated local photo for a city, matched by API id first, then by name. */
export function getCuratedCityImage(city: Pick<ApiCity, "id" | "name">): CityImage | null {
  const byId = DESTINATION_IMAGES.find((d) => d.cityId === city.id);
  if (byId) return byId.image;
  const name = city.name.trim().toLowerCase();
  const byName = DESTINATION_IMAGES.find((d) => d.names.includes(name));
  return byName?.image ?? null;
}

/** API images are short-lived signed URLs; only absolute https links are usable. */
export function getApiCityImageUrl(city: Pick<ApiCity, "images">): string | null {
  const url = city.images?.find((src) => typeof src === "string" && src.trim().startsWith("https://"));
  return url?.trim() ?? null;
}

/** Local image used when the API image is missing or fails to load. */
export function getCityFallbackImage(city: Pick<ApiCity, "id" | "name">): CityImage {
  return (
    getCuratedCityImage(city) ?? {
      src: NEUTRAL_CITY_IMAGE.src,
      alt: `${city.name} travel guide with self-guided audio tours`,
    }
  );
}

/** Fresh API image first, then the curated local photo, then a neutral travel photo. */
export function getCityImage(city: Pick<ApiCity, "id" | "name" | "images">): CityImage {
  const api = getApiCityImageUrl(city);
  if (api) {
    return { src: api, alt: `${city.name} skyline and landmarks, explored with Gamana audio tours` };
  }
  return getCityFallbackImage(city);
}
