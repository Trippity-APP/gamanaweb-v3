"use client";

import { ExploreHeroSearch } from "@/components/marketplace/ExploreHeroSearch";
import type { Tour } from "@/lib/marketplace-data";

/**
 * Home page hero search — same unified UI as Explore, but navigates directly to
 * story/walk detail pages (or /explore?q= for city-only searches).
 */
export function HeroCitySearch({ catalog = [] }: { catalog?: Tour[] }) {
  return (
    <ExploreHeroSearch
      catalog={catalog}
      variant="home"
      containerClassName="relative w-full max-w-xl mx-auto lg:mx-0"
    />
  );
}
