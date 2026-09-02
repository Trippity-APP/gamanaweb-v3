import { Suspense } from 'react';
import { Compass } from 'lucide-react';
import HeroHeader from '@/components/navigation/hero-header';
import { HeroEyebrow } from '@/components/HeroEyebrow';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import Footer from '@/components/navigation/footer';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { MarketplaceHeroSearch } from '@/components/marketplace/MarketplaceHeroSearch';
import { MarketplaceSignedInHeroExtras } from '@/components/marketplace/MarketplaceSignedInHeroExtras';
import { fetchPublicTours } from '@/lib/marketplace-api';
import type { Tour } from '@/lib/marketplace-data';

/**
 * Unified marketplace page — live catalog from public storylists, personalized greeting
 * when signed in, and the same browsing surface for all visitors.
 */
export default async function MarketplacePage() {
  let initialTours: Tour[] = [];
  try {
    initialTours = await fetchPublicTours();
  } catch (error) {
    console.error('Failed to prefetch explore catalog', error);
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden h-[62vh] sm:h-[68vh] flex flex-col">
        <div className="absolute inset-0">
          <HeroSlideshow
            images={[
              "/taj-mahal-sunrise-reflection-central-pool-agra.jpg",
              "/buckingham-palace-morning-audio-tour-london.png",
              "/kerala-alleppey-houseboat-backwaters-golden-hour.jpg",
              "/dubai-marina-walk-golden-hour-self-guided-audio-tour.png",
              "/hampi-vittala-temple-chariot-golden-hour-boulder-landscape.jpg",
            ]}
          />
          {/* Minimal hero treatment, consistent sitewide: a light brand tint for colour
              identity plus a small neutral scrim purely so white text stays readable. */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B6E4F]/25 via-[#159895]/20 to-[#1A5F7A]/20" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <HeroHeader transparent={true} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-32 sm:pb-28 flex-1 flex flex-col justify-center">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <div className="animate-fade-in">
              <HeroEyebrow icon={Compass} label="Explore your World" />
            </div>
            <div className="inline-block w-fit">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>Travel with Confidence</h1>
              <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
              Audio tours and storylists from narrators who know these cities.
            </p>
            <MarketplaceSignedInHeroExtras />
            <div className="opacity-0 animate-fade-in pt-2" style={{ animationDelay: "750ms" }}>
              <Suspense fallback={null}>
                <MarketplaceHeroSearch catalog={initialTours} />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* MarketplaceBrowser reads the ?q= (or legacy ?city=) param client-side (useSearchParams), which
          needs a Suspense boundary to keep this route statically exportable. */}
      <Suspense fallback={null}>
        <MarketplaceBrowser initialTours={initialTours} />
      </Suspense>

      <Footer />
    </div>
  );
}
