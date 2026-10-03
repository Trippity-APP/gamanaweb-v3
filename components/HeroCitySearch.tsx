"use client";

import { ExploreHeroSearch } from "@/components/marketplace/ExploreHeroSearch";
import type { SearchTour } from "@/lib/marketplace-data";

/**
 * Home page hero search — same unified UI as Explore, but navigates directly to
 * story/walk detail pages (or /marketplace?q= for city-only searches).
 */
export function HeroCitySearch({
  catalog,
  size = "md",
  placeholder,
  containerClassName = "relative w-full max-w-xl mx-auto lg:mx-0",
}: {
  catalog?: SearchTour[];
  size?: "sm" | "md" | "lg" | "xl";
  placeholder?: string;
  containerClassName?: string;
}) {
  return (
    <ExploreHeroSearch
      catalog={catalog}
      variant="home"
      size={size}
      placeholder={placeholder}
      containerClassName={containerClassName}
    />
  );
}
