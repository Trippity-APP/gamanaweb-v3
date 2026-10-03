import { Suspense } from 'react';
import { Compass } from '@/components/icons';
import SiteHeader from '@/components/navigation/site-header';
import Footer from '@/components/navigation/footer';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { MarketplaceHeroSearch } from '@/components/marketplace/MarketplaceHeroSearch';
import { MarketplaceSignedInHeroExtras } from '@/components/marketplace/MarketplaceSignedInHeroExtras';
import { ResponsiveImage } from '@/components/site/ResponsiveImage';
import { getPhoto, type PhotoKey } from '@/lib/images';
import { fetchPublicTours } from '@/lib/marketplace-api';
import type { Tour } from '@/lib/marketplace-data';

const EXPLORE_SEARCH_ID = 'explore-hero-search';

export async function ExploreCatalogPage({
  heroPhoto = 'hero-pricing',
}: {
  heroPhoto?: PhotoKey;
} = {}) {
  let initialTours: Tour[] = [];
  try {
    initialTours = await fetchPublicTours();
  } catch (error) {
    console.error('Failed to prefetch explore catalog', error);
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <SiteHeader variant="solid" searchAnchorId={EXPLORE_SEARCH_ID} />
      <main>
        <section className="container-site pt-4 sm:pt-6">
          <div className="relative isolate flex min-h-[380px] items-end overflow-hidden rounded-4xl shadow-lift sm:min-h-[420px] lg:min-h-[460px]">
            <ResponsiveImage
              image={getPhoto(heroPhoto)}
              alt="Gamana audio tours and walking experiences"
              title="Gamana Audio Tours and Walking Experiences"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="-z-20"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/10" aria-hidden />
            <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sunset-400/25 blur-3xl" aria-hidden />

            <div className="w-full px-5 pb-8 pt-16 sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                <Compass className="h-3.5 w-3.5" aria-hidden />
                Explore your World
              </p>
              <h1 className="text-display mt-4 max-w-3xl text-balance text-white drop-shadow-sm">
                Audio Tours and Walking Experiences
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                Explore engaging audio stories and walking experiences designed to help you experience cities, landmarks, and destinations at your own pace.
              </p>
              <div className="mt-2 text-white">
                <MarketplaceSignedInHeroExtras />
              </div>
              <div id={EXPLORE_SEARCH_ID} className="mt-6 max-w-3xl">
                <Suspense fallback={<div className="h-14 rounded-2xl bg-white/90 sm:h-16" />}>
                  <MarketplaceHeroSearch catalog={initialTours} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={null}>
          <MarketplaceBrowser initialTours={initialTours} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
