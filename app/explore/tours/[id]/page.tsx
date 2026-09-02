import { Suspense } from "react";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { MarketplaceTourDetail } from "@/components/marketplace/MarketplaceTourDetail";
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicTours,
  tourMatchesCity,
} from "@/lib/marketplace-api";
import type { Tour } from "@/lib/marketplace-data";

export async function generateStaticParams() {
  try {
    clearMarketplaceCache();
    const tours = await fetchPublicTours();
    if (tours.length > 0) {
      return tours.map((tour) => ({ id: tour.id }));
    }
  } catch {
    // Build-time API may be unavailable.
  }

  // Catch-all shell for static hosting rewrites (serve.json / vercel.json).
  return [{ id: "[id]" }];
}

export default async function MarketplaceTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tourId = id === "[id]" ? null : id;
  const tour = tourId ? await fetchPublicTourById(tourId) : null;

  let relatedTours: Tour[] = [];
  if (tour) {
    const allTours = await fetchPublicTours();
    const city = tour.location.split(",")[0]?.trim() ?? "";
    relatedTours = allTours
      .filter((item) => item.id !== tour.id && tourMatchesCity(item, city))
      .slice(0, 3);
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
            Loading tour...
          </div>
        }
      >
        <MarketplaceTourDetail
          tourId={id}
          tour={tour}
          relatedTours={relatedTours}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
