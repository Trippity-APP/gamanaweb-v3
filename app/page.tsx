import { getLatestPostSummaries } from "@/lib/blog";
import { fetchPublicTours } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";

import HomeClient from "./home-client";

export default async function HomePage() {
  let catalog: Tour[] = [];
  try {
    catalog = await fetchPublicTours();
  } catch (error) {
    console.error("Failed to prefetch home search catalog", error);
  }

  return <HomeClient latestStories={await getLatestPostSummaries(3)} catalog={catalog} />;
}
