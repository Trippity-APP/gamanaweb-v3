import { getLatestPostSummaries } from "@/lib/blog";

import HomeClient from "./home-client";

export default function HomePage() {
  return <HomeClient latestStories={getLatestPostSummaries(3)} />;
}
