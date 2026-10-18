import type { Metadata } from "next";
import { Suspense } from "react";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PageHero } from "@/components/site/PageHero";
import { ExperienceHeroSearch } from "@/components/experiences/ExperienceHeroSearch";
import { ExperiencesBrowser } from "@/components/experiences/ExperiencesBrowser";
import { getPhoto } from "@/lib/images";
import { OG_IMAGE } from "@/lib/seo";

const title = "Book Local Experiences & Tours";
const description =
  "Hand-picked tours and activities, paired with Gamana audio stories. Check live availability and book local experiences in India and around the world.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamana.app"),
  title,
  description,
  alternates: { canonical: "https://www.gamana.app/experiences/" },
  openGraph: {
    title,
    description,
    url: "https://www.gamana.app/experiences/",
    siteName: "Gamana",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
};

export default function ExperiencesPage() {
  return (
    <>
      <HeroHeader transparent />
      <main className="bg-sand-50">
        <PageHero
          size="md"
          image={getPhoto("hero-explore-tours")}
          imageAlt=""
          eyebrow="Experiences"
          breadcrumbs={[{ label: "Experiences", href: "/experiences/" }]}
          heading="Book local experiences. Hear the story first."
          subtitle="Hand-picked tours and activities, paired with Gamana audio stories."
        >
          <Suspense fallback={<div className="h-14 w-full max-w-xl rounded-full bg-white/90" />}>
            <ExperienceHeroSearch />
          </Suspense>
        </PageHero>
        <Suspense fallback={null}>
          <ExperiencesBrowser />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
