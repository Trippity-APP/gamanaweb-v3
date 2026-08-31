import { getLatestPostSummaries } from "@/lib/blog";

import HomeClient from "./home-client";

export default async function HomePage() {
  return <HomeClient latestStories={await getLatestPostSummaries(3)} />;
}
