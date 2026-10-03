import type { Metadata } from 'next';
import { Suspense } from 'react';
import SiteHeader from '@/components/navigation/site-header';
import { JsonLd } from '@/components/site/JsonLd';
import { DownloadBand } from '@/components/site/DownloadBand';
import { RelatedRail } from '@/components/marketplace/detail/RelatedRail';
import { breadcrumbJsonLd } from '@/lib/seo';
import type { Tour } from '@/lib/marketplace-data';
import Footer from '@/components/navigation/footer';
import { ExploreStoryDetailClient } from '@/components/marketplace/ExploreStoryDetailClient';
import {
  clearMarketplaceCache,
  fetchPublicStoryDetailById,
  tourMatchesCity,
} from '@/lib/marketplace-api';
import { fetchPublicStoriesCatalog } from '@/lib/places-api';
import { STATIC_SPA_PARAM, isStaticSpaParam } from '@/lib/static-spa';

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (isStaticSpaParam(id)) {
    return {
      title: 'Audio Story | Gamana',
      description: 'Explore this audio story with Gamana.',
    };
  }

  const story = await fetchPublicStoryDetailById(id);

  if (!story) {
    return {
      title: 'Story not found | Gamana',
    };
  }

  return {
    title: `${story.title} | Gamana`,
    description: story.subtitle ?? story.description,
    alternates: {
      canonical: `https://www.gamana.app/marketplace/story/${id}/`,
    },
    openGraph: {
      title: `${story.title} | Audio Story`,
      description: story.subtitle ?? story.description,
      url: `https://www.gamana.app/marketplace/story/${id}/`,
      images: story.image ? [{ url: story.image }] : undefined,
    },
  };
}

export default async function ExploreStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const storyId = isStaticSpaParam(id) ? null : id;

  const story = storyId ? await fetchPublicStoryDetailById(storyId) : null;

  const city = story?.location.split(',')[0]?.trim() ?? '';
  let related: Tour[] = [];
  if (story && city) {
    try {
      const stories = await fetchPublicStoriesCatalog();
      related = stories.filter((item) => item.id !== story.id && tourMatchesCity(item, city)).slice(0, 10);
    } catch {
      related = [];
    }
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <SiteHeader variant="solid" />
      <main>
        {story && (
          <JsonLd
            data={breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Explore', path: '/marketplace/' },
              { name: 'Audio Stories', path: '/marketplace/story/' },
              { name: story.title, path: `/marketplace/story/${id}/` },
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
          <ExploreStoryDetailClient storyId={id} story={story} />
        </Suspense>
        <RelatedRail title={city ? `More audio stories in ${city}` : 'More audio stories'} tours={related} />
        <DownloadBand
          title="Hear every story in the Gamana app"
          lead="Download once, then listen offline as you explore, with narration in the language you prefer."
          source="audio_story_detail_band"
          keyword="audio tour app"
        />
      </main>
      <Footer />
    </div>
  );
}
