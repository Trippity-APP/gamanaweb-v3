import { Metadata } from "next";
import { Suspense } from "react";
import { Compass } from "lucide-react";
import SiteHeader from "@/components/navigation/site-header";
import { HeroEyebrow } from "@/components/HeroEyebrow";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import Footer from "@/components/navigation/footer";
import { JourneyGreeting } from "@/components/JourneyGreeting";
import { JourneyCTA } from "@/components/marketplace/JourneyCTA";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { MarketplaceHeroSearch } from "@/components/marketplace/MarketplaceHeroSearch";

// Personalized to the signed-in visitor, so it stays out of the search index like
// /account — this isn't a "not live" caveat, it's the same reasoning any profile-scoped
// page uses.
export const metadata: Metadata = {
  title: "Explore — Gamana",
  description: "Gamana's marketplace, personalized to what you told us about your travel style.",
  robots: { index: false, follow: false },
};

export default function MarketplaceRedesignPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader variant="transparent" />

      {/*
        Matches the sitewide photo-hero standard (min-h-[62vh] sm:min-h-[68vh]) used on
        About/Contact/Ecosystem/Cities/Features/Blog, per explicit request — previously a
        deliberately slim strip to get a returning visitor to Tours/Combos/Experiences
        faster, but that tradeoff has been set aside in favor of matching the rest of the
        site.
      */}
      <section className="relative overflow-hidden h-[62vh] sm:h-[68vh] flex items-center">
        <div className="absolute inset-0">
          <HeroSlideshow
            images={[
              "/varanasi ghats golden hour river boats temple spires panoramic view.jpg",
              "/traveller-jama-masjid-courtyard-self-guided-audio-tour-delhi.png",
              "/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png",
              "/taj-mahal-sunrise-reflection-central-pool-agra.jpg",
              "/dubai-marina-walk-golden-hour-self-guided-audio-tour.png",
            ]}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B6E4F]/25 via-[#159895]/20 to-[#1A5F7A]/20" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 sm:pt-32 sm:pb-28 w-full">
          <div className="max-w-5xl mx-auto text-center space-y-3">
            <div className="animate-fade-in pb-1">
              <HeroEyebrow icon={Compass} label="Explore your World" />
            </div>
            <div className="inline-block w-fit">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>Travel with Confidence</h1>
              <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
            </div>
            <div className="opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
              <JourneyGreeting />
            </div>
            {/* Only renders for a signed-in visitor who hasn't personalized yet — null
                once a journey is saved, so this stays invisible in the common "Welcome
                Back" case shown above. */}
            <div className="flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <JourneyCTA />
            </div>
            <div className="opacity-0 animate-fade-in pt-2" style={{ animationDelay: "750ms" }}>
              <Suspense fallback={null}>
                <MarketplaceHeroSearch />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      <Suspense fallback={null}>
        <MarketplaceBrowser />
      </Suspense>

      <Footer />
    </main>
  );
}
