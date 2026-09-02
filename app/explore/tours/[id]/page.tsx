import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeroHeader from '@/components/navigation/hero-header';
import Footer from '@/components/navigation/footer';
import { ExploreTourDetailClient } from '@/components/marketplace/ExploreTourDetailClient';
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicTours,
  fetchPublicWalkDetailById,
  tourMatchesCity,
} from '@/lib/marketplace-api';
import type { Tour } from '@/lib/marketplace-data';

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

  return [{ id: '[id]' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (id === '[id]') {
    return {
      title: 'Audio Walk | Gamana',
      description: 'Explore this audio walking tour with Gamana.',
    };
  }

  const walk = await fetchPublicWalkDetailById(id);
  const tour = walk ?? (await fetchPublicTourById(id));

  if (!tour) {
    return {
      title: 'Tour not found | Gamana',
    };
  }

  return {
    title: `${tour.title} | Gamana`,
    description: tour.description,
    openGraph: {
      title: tour.title,
      description: tour.description,
      images: tour.image ? [{ url: tour.image }] : undefined,
    },
  };
}

export default async function MarketplaceTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tourId = id === '[id]' ? null : id;

  const walk = tourId ? await fetchPublicWalkDetailById(tourId) : null;
  const tour = walk ?? (tourId ? await fetchPublicTourById(tourId) : null);

  let relatedTours: Tour[] = [];
  if (tour) {
    const allTours = await fetchPublicTours();
    const city = tour.location.split(',')[0]?.trim() ?? '';
    relatedTours = allTours
      .filter((item) => item.id !== tour.id && tourMatchesCity(item, city))
      .slice(0, 3);
  }

  const isWalk = walk?.contentKind === 'walk';

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500 sm:px-6 lg:px-8">
            Loading...
          </div>
        }
      >
        <ExploreTourDetailClient
          tourId={id}
          walk={walk}
          tour={isWalk ? null : tour}
          relatedTours={relatedTours}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
