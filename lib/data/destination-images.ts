import type { CityImage } from "@/lib/city-image";
import { getPhoto, type PhotoKey } from "@/lib/images";

export type DestinationImage = {
  /** API city id. */
  cityId: string;
  /** Lowercase names and aliases used when the id differs (e.g. "goa" vs "old goa"). */
  names: string[];
  /** 4:5 card photo. */
  image: CityImage;
  /** 16:9 photo for wide layouts, when one exists. */
  wide?: CityImage;
};

function photo(key: PhotoKey, variant: "hero" | "tile"): CityImage {
  const p = getPhoto(key, variant);
  const medium = p.srcSet.find((s) => s.width >= 800) ?? p;
  return { src: medium.src, alt: p.alt, title: p.title, photo: p };
}

export const DESTINATION_IMAGES: DestinationImage[] = [
  { cityId: "134327", names: ["varanasi", "banaras", "benares", "kashi"], image: photo("dest-varanasi", "tile"), wide: photo("slide-varanasi", "hero") },
  { cityId: "131679", names: ["delhi", "new delhi", "old delhi"], image: photo("dest-delhi", "tile"), wide: photo("slide-delhi", "hero") },
  { cityId: "6a6129112b3d15826864654c", names: ["goa", "old goa", "panaji", "panjim"], image: photo("dest-goa", "tile"), wide: photo("slide-goa", "hero") },
  { cityId: "57933", names: ["bengaluru", "bangalore"], image: photo("dest-bengaluru", "tile") },
  { cityId: "57601", names: ["agra"], image: photo("dest-agra", "tile") },
  { cityId: "132201", names: ["jaipur"], image: photo("dest-jaipur", "tile"), wide: photo("slide-jaipur", "hero") },
  { cityId: "133024", names: ["mumbai", "bombay"], image: photo("dest-mumbai", "tile") },
  { cityId: "131517", names: ["chennai", "madras"], image: photo("dest-chennai", "tile") },
];

export const NEUTRAL_CITY_IMAGE: CityImage = photo("neutral-city", "tile");
export const NEUTRAL_CITY_WIDE_IMAGE: CityImage = photo("neutral-city", "hero");

export function getDestinationImage(cityId: string): DestinationImage | undefined {
  return DESTINATION_IMAGES.find((d) => d.cityId === cityId);
}
