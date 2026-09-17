import { getLatestPostSummaries } from "@/lib/blog";
import { fetchPublicTours } from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";

import HomeClient from "./home-client";

export default async function HomePage() {
  let catalog: Tour[] = [];
  let latestStories: Awaited<ReturnType<typeof getLatestPostSummaries>> = [];

  try {
    catalog = await fetchPublicTours();
  } catch (error) {
    console.error("Failed to prefetch home search catalog", error);
  }

  try {
    latestStories = await getLatestPostSummaries(3);
  } catch (error) {
    console.error("Failed to prefetch home latest stories", error);
  }

  return <HomeClient latestStories={latestStories} catalog={catalog} />;
}
