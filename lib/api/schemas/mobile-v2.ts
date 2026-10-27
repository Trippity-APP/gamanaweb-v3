import { z } from "zod";
import { idField, nullish } from "@/lib/api/schemas/common";
import { DEFAULT_TOUR_IMAGE } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";

/** Lean mobile cards from the app's v2 APIs (`backend/app/api/v2/schemas/mobile.py`). */

const num = z.coerce.number();

export const placeCardSchema = z
  .object({
    id: idField,
    name: z.string(),
    description: nullish(z.string()),
    city: nullish(z.string()),
    image_url: nullish(z.string()),
    distance_meters: nullish(num),
    coins_price: nullish(num),
    is_unlocked: nullish(z.boolean()),
    is_featured: nullish(z.boolean()),
    is_verified: nullish(z.boolean()),
    is_legend: nullish(z.boolean()),
    poi_tier: nullish(z.string()),
    latitude: nullish(num),
    longitude: nullish(num),
    primary_audio: nullish(
      z
        .object({
          audio_duration: nullish(num),
          persona_name: nullish(z.string()),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const tourCardSchema = z
  .object({
    id: idField,
    title: z.string(),
    description: nullish(z.string()),
    cover_image_url: nullish(z.string()),
    stop_count: nullish(num),
    estimated_duration_minutes: nullish(num),
    price_coins: nullish(num),
    is_unlocked: nullish(z.boolean()),
    distance_meters: nullish(num),
    is_walking_tour: nullish(z.boolean()),
    category: nullish(z.string()),
  })
  .passthrough();

export const bestPicksSchema = z
  .object({
    city: nullish(z.object({ name: nullish(z.string()), country: nullish(z.string()) }).passthrough()),
    place: nullish(placeCardSchema),
    tour: nullish(tourCardSchema),
    experience: z.unknown().optional(),
  })
  .passthrough();

export type PlaceCard = z.infer<typeof placeCardSchema>;
export type TourCard = z.infer<typeof tourCardSchema>;
export type BestPicks = z.infer<typeof bestPicksSchema>;

/** Drops malformed items instead of failing the whole shelf. */
export function lenientList<T extends z.ZodTypeAny>(item: T) {
  return z.array(z.unknown()).transform((rows) =>
    rows.flatMap((row) => {
      const parsed = item.safeParse(row);
      return parsed.success ? [parsed.data as z.infer<T>] : [];
    }),
  );
}

function formatMinutes(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "Self-paced";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours} hour${hours > 1 ? "s" : ""}`;
}

function tierFor(price: number, poiTier?: string | null): Tour["tier"] {
  if (poiTier === "silver" || poiTier === "gold" || poiTier === "platinum") return poiTier;
  if (price === 0) return "silver";
  return price >= 10 ? "platinum" : "gold";
}

function geoOf(lat?: number | null, lng?: number | null): Tour["geo"] {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return undefined;
  return { lat, lng };
}

export function placeCardToTour(card: PlaceCard, fallbackLocation: string): Tour {
  const price = Math.round(card.coins_price ?? 0);
  const seconds = card.primary_audio?.audio_duration ?? 0;
  const minutes = seconds > 0 ? Math.max(1, Math.round(seconds / 60)) : undefined;
  return {
    id: card.id,
    title: card.name,
    description: card.description?.trim() || `Discover the story of ${card.name}.`,
    location: card.city?.trim() || fallbackLocation,
    duration: formatMinutes(minutes),
    price,
    rating: 4.7,
    reviews: 0,
    tier: tierFor(price, card.poi_tier),
    category: "Story",
    image: card.image_url ?? "",
    highlights: [],
    narrator: card.primary_audio?.persona_name?.trim() || "Gamana narrator",
    isPremium: price > 0,
    contentKind: "story",
    isRecommended: true,
    geo: geoOf(card.latitude, card.longitude),
    durationMinutes: minutes,
    isFeatured: card.is_featured === true,
    isVerified: card.is_verified === true,
    isLegend: card.is_legend === true,
  };
}

export function tourCardToTour(card: TourCard, location: string): Tour {
  const price = Math.round(card.price_coins ?? 0);
  const minutes = card.estimated_duration_minutes ?? undefined;
  const stops = card.stop_count ?? undefined;
  return {
    id: card.id,
    title: card.title,
    description: card.description?.trim() || "Explore this curated audio tour.",
    location,
    duration: minutes ? formatMinutes(minutes) : stops ? `${stops} stop${stops > 1 ? "s" : ""}` : "Self-paced",
    price,
    rating: 4.7,
    reviews: 0,
    tier: tierFor(price),
    category: card.category?.trim() || "Historical",
    image: card.cover_image_url?.trim() || DEFAULT_TOUR_IMAGE,
    highlights: [],
    narrator: "Gamana",
    isPremium: price > 0,
    contentKind: "walk",
    isRecommended: true,
    durationMinutes: minutes,
    stopsCount: stops,
  };
}
