import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeroHeader from '@/components/navigation/hero-header';
import Footer from '@/components/navigation/footer';
import { ExploreStoryDetailClient } from '@/components/marketplace/ExploreStoryDetailClient';
import {
  clearMarketplaceCache,
  fetchPublicStoryDetailById,
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
    openGraph: {
      title: `${story.title} | Audio Story`,
      description: story.subtitle ?? story.description,
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
        <ExploreStoryDetailClient storyId={id} story={story} />
      </Suspense>
      <Footer />
    </div>
  );
}
