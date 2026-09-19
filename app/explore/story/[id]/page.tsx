import { Suspense } from "react";
import ExploreStoryDetailRedirect from "./redirect-client";
import {
  clearMarketplaceCache,
} from "@/lib/marketplace-api";
import { fetchPublicStoriesCatalog } from "@/lib/places-api";
import { STATIC_SPA_PARAM } from "@/lib/static-spa";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    clearMarketplaceCache();
    const stories = await fetchPublicStoriesCatalog();
    if (stories.length > 0) {
      return [...stories.map((story) => ({ id: story.id })), { id: STATIC_SPA_PARAM }];
    }
  } catch {
    // Build-time API may be unavailable.
  }

  return [{ id: STATIC_SPA_PARAM }];
}

export default async function ExploreStoryRedirectPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to marketplace...
        </div>
      }
    >
      <ExploreStoryDetailRedirect storyId={id} />
    </Suspense>
  );
}
