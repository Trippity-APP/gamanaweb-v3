import { Suspense } from "react";
import ExploreTourDetailRedirect from "./redirect-client";
import {
  clearMarketplaceCache,
  fetchPublicWalkStaticIds,
} from "@/lib/marketplace-api";
import { STATIC_SPA_PARAM } from "@/lib/static-spa";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    clearMarketplaceCache();
    const walkIds = await fetchPublicWalkStaticIds();
    if (walkIds.length > 0) {
      return [...walkIds.map((id) => ({ id })), { id: STATIC_SPA_PARAM }];
    }
  } catch {
    // Build-time API may be unavailable.
  }

  return [{ id: STATIC_SPA_PARAM }];
}

export default async function ExploreTourRedirectPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to marketplace...
        </div>
      }
    >
      <ExploreTourDetailRedirect tourId={id} />
    </Suspense>
  );
}
