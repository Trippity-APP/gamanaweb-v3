import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { getLatestPostSummaries } from "@/lib/blog";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { JsonLd } from "@/components/site/JsonLd";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { AppSpotlight } from "@/components/home/AppSpotlight";
import { SectionHeader } from "@/components/site/SectionHeader";
import { TrustBar } from "@/components/site/TrustBar";
import { NarratorRail } from "@/components/site/NarratorRail";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { DownloadBand } from "@/components/site/DownloadBand";
import { HomeHero, HOME_HERO_SEARCH_ID } from "@/components/home/HomeHero";
import { OfferBanners } from "@/components/home/OfferBanners";
import { LatestStories } from "@/components/home/LatestStories";
import {
  CityRailSection,
  FeaturesBento,
  HowItWorks,
  PartnerCard,
  ToursGrid,
} from "@/components/home/HomeSections";
import { HOME_FAQS } from "@/lib/data/home";
import { OG_IMAGE, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const HOME_TITLE = "Travel Guide App with Immersive Audio Guides | Gamana";
const HOME_DESCRIPTION =
  "Gamana is your personal travel guide app for immersive audio guides and self-guided tours across 50+ cities, with 700+ stories in 7 languages.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "https://www.gamana.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.gamana.app",
    siteName: "Gamana",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE.url],
    creator: "@gamana",
  },
};

const primaryButton =
  "focus-ring group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-4 text-base font-semibold text-white shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-95";

export default async function HomePage() {
  const latestStories = await getLatestPostSummaries(3);

  return (
    <>
      <SiteHeader variant="solid" searchAnchorId={HOME_HERO_SEARCH_ID} />

      <main>
        <HomeHero />
        <CategoryTiles />

        <CityRailSection />

        <div className="border-y border-ink/5 bg-sand-50 py-6">
          <TrustBar className="container-site" />
        </div>
        <AppSpotlight />

        <section className="section bg-sand-50">
          <div className="container-site">
            <SectionHeader
              eyebrow="Discover & Explore"
              title={
                <>
                  Discover Self-Guided Tours and <span className="text-brand-700">Audio Stories</span>
                </>
              }
              lead="Find self-guided tours, audio stories, and local experiences designed to help you enjoy each destination at your own pace."
            />
            <ToursGrid />
            <div className="mt-10 text-center">
              <Link href="/marketplace/" className={primaryButton}>
                Explore More Tours
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
            <div className="mt-14">
              <OfferBanners />
            </div>
          </div>
        </section>

        <FeaturesBento />

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader
              eyebrow="Virtual Travel Guides"
              title={
                <>
                  Explore Personalized Audio Guides with <span className="text-brand-700">Virtual Travel Narrators</span>
                </>
              }
              lead="Choose a narrator that matches your travel style and enjoy engaging audio guides featuring history, culture, and local stories as you explore each destination."
            />
            <NarratorRail source="home" />
          </div>
        </section>

        <HowItWorks />

        {latestStories.length > 0 && (
          <section className="section bg-sand-50">
            <div className="container-site">
              <SectionHeader
                eyebrow="From the blog"
                title={
                  <>
                    Travel Tips, Stories &amp; <span className="text-brand-700">Audio Travel Guides</span>
                  </>
                }
                lead="Read practical travel tips, destination stories, and audio travel guides to help you explore new places and make every journey more meaningful."
              />
              <LatestStories initialStories={latestStories} />
              <div className="mt-10 text-center">
                <Link href="/blog/" className={primaryButton}>
                  Explore More Blogs
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="section bg-white">
          <div className="container-site max-w-3xl">
            <SectionHeader
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              lead="Everything you need to know about Gamana"
            />
            <FaqAccordion items={HOME_FAQS} withSchema />
            <div className="mt-10 text-center">
              <Link href="/faq/" className={primaryButton}>
                Read More FAQs
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <DownloadBand
          title={
            <>
              Ready to Explore with a <span className="text-sunset-300">Tour Guide App?</span>
            </>
          }
          lead="Explore cities with a tour guide app featuring immersive stories, helpful audio guides, and local insights wherever your journey takes you."
          source="home_closing"
          keyword="tour guide app"
          aside={<PartnerCard />}
        />
      </main>
      <Footer />
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "Gamana",
          url: "https://www.gamana.app/",
          applicationCategory: "TravelApplication",
          operatingSystem: "iOS, Android",
          description: HOME_DESCRIPTION,
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
        }}
      />
    </>
  );
}
