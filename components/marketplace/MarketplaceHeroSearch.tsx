"use client";

import { useSearchParams } from "next/navigation";
import { ExploreHeroSearch } from "@/components/marketplace/ExploreHeroSearch";
import { getExploreSearchQuery } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";

/** Explore page hero search — filters catalog via ?q= on the same page. */
export function MarketplaceHeroSearch({ catalog = [] }: { catalog?: Tour[] }) {
  const searchParams = useSearchParams();
  const urlQuery = getExploreSearchQuery(searchParams);

  return <ExploreHeroSearch catalog={catalog} variant="explore" urlQuery={urlQuery} />;
}
