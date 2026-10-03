import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import SiteHeader from '@/components/navigation/site-header';
import { JsonLd } from '@/components/site/JsonLd';
import { DownloadBand } from '@/components/site/DownloadBand';
import { RelatedRail } from '@/components/marketplace/detail/RelatedRail';
import { fetchPublicStoriesCatalog } from '@/lib/places-api';
import { breadcrumbJsonLd } from '@/lib/seo';
import Footer from '@/components/navigation/footer';
import { ExploreTourDetailClient } from '@/components/marketplace/ExploreTourDetailClient';
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicWalkDetailById,
  fetchPublicWalksCatalog,
  fetchPublicWalkStaticIds,
  fetchPublicStoryDetailById,
  getTourHref,
  tourMatchesCity,
} from '@/lib/marketplace-api';
import type { Tour } from '@/lib/marketplace-data';
import { STATIC_SPA_PARAM, isStaticSpaParam } from '@/lib/static-spa';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (isStaticSpaParam(id)) {
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
    alternates: {
      canonical: `https://www.gamana.app/marketplace/tours/${id}/`,
    },
    openGraph: {
      title: tour.title,
      description: tour.description,
      url: `https://www.gamana.app/marketplace/tours/${id}/`,
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
  const tourId = isStaticSpaParam(id) ? null : id;

  const walk = tourId ? await fetchPublicWalkDetailById(tourId) : null;

  if (tourId && !walk) {
    const story = await fetchPublicStoryDetailById(tourId);
    if (story?.contentKind === 'story') {
      redirect(getTourHref(story));
    }
  }

  const tour = walk ?? (tourId ? await fetchPublicTourById(tourId) : null);

  let relatedTours: Tour[] = [];
  let relatedStories: Tour[] = [];
  const city = tour?.location.split(',')[0]?.trim() ?? '';
  if (tour) {
    const [allWalks, allStories] = await Promise.all([
      fetchPublicWalksCatalog(),
      fetchPublicStoriesCatalog().catch(() => [] as Tour[]),
    ]);
    relatedTours = allWalks.filter((item) => item.id !== tour.id && tourMatchesCity(item, city));
    relatedStories = city ? allStories.filter((item) => tourMatchesCity(item, city)) : [];
  }
  const related = [...relatedTours, ...relatedStories].slice(0, 10);

  const isWalk = walk?.contentKind === 'walk';

  return (
    <div className="min-h-screen bg-sand-50">
      <SiteHeader variant="solid" />
      <main>
        {tour && (
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Explore', path: '/marketplace/' },
              { name: 'Audio Walks', path: '/marketplace/tours/' },
              { name: tour.title, path: `/marketplace/tours/${id}/` },
            ])}
          />
        )}
        <Suspense
          fallback={
            <div className="container-site py-16 text-center text-ink-muted">
              Loading...
            </div>
          }
        >
          <ExploreTourDetailClient
            tourId={id}
            walk={walk}
            tour={isWalk ? null : tour}
            relatedTours={relatedTours.slice(0, 3)}
          />
        </Suspense>
        {isWalk && <RelatedRail title={city ? `More to explore in ${city}` : 'More to explore'} tours={related} />}
        <DownloadBand
          title="Take this walk with Gamana"
          lead="Stories play automatically as you reach each stop, even offline."
          source="audio_walk_detail_band"
          keyword="audio tour app"
        />
      </main>
      <Footer />
    </div>
  );
}
