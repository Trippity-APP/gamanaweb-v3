import { Suspense } from "react";
import MarketplaceTourRedirectPage from "./redirect-client";
import {
  clearMarketplaceCache,
  fetchPublicTours,
} from "@/lib/marketplace-api";
import { STATIC_SPA_PARAM } from "@/lib/static-spa";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    clearMarketplaceCache();
    const tours = await fetchPublicTours();
    if (tours.length > 0) {
      return [...tours.map((tour) => ({ id: tour.id })), { id: STATIC_SPA_PARAM }];
    }
  } catch {
    // Build-time API may be unavailable.
  }

  return [{ id: STATIC_SPA_PARAM }];
}

export default async function MarketplaceTourRedirect({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to explore...
        </div>
      }
    >
      <MarketplaceTourRedirectPage tourId={id} />
    </Suspense>
  );
}
