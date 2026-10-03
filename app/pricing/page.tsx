import type { Metadata } from "next";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PricingCatalog } from "@/components/pricing/PricingCatalog";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { FaqAccordion, type FaqItem } from "@/components/site/FaqAccordion";
import { Reveal } from "@/components/motion/Reveal";
import { coinPacks } from "@/lib/coin-pricing";
import { getPhoto } from "@/lib/images";
import { OG_IMAGE } from "@/lib/seo";

const steps = [
  {
    title: "Buy a pack",
    text: "Pick the coins you need for this trip. One payment, no subscription.",
  },
  {
    title: "Coins sit in your wallet",
    text: "They stay with your Gamana account until you spend them.",
  },
  {
    title: "Unlock as you walk",
    text: "Use coins on premium stories and walks. Free stories stay free.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Where do my coins appear?",
    answer:
      "After a successful purchase, coins are credited to your Gamana account. Use them in the app or on the website to unlock premium stories and walks.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Unused coin packs follow our refund policy. If a payment fails or looks wrong, email support@gamana.app and we will help.",
  },
  {
    question: "What if I need more than 25 coins?",
    answer:
      "Volumes above 25 coins are Enterprise. Contact us for teams, partners, and bulk purchases.",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamana.app"),
  title: "Gamana Coins Pricing | Unlock Audio Stories & Walks",
  description:
    "Buy Gamana Coins in INR or USD: 2, 10, 15, or 25 coins. Unlock premium audio stories and walks. Larger volumes are Enterprise — contact us.",
  alternates: {
    canonical: "https://www.gamana.app/pricing/",
  },
  openGraph: {
    title: "Gamana Coins Pricing | Gamana",
    description:
      "Pay once. Hear the city as you walk. Packs from 2 to 25 coins. India sees INR; everyone else sees USD. Need more than 25? Talk to us about Enterprise.",
    url: "https://www.gamana.app/pricing/",
    siteName: "Gamana",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamana Coins Pricing | Gamana",
    description:
      "Pay once. Hear the city as you walk. Packs from 2 to 25 coins. India sees INR; everyone else sees USD. Need more than 25? Talk to us about Enterprise.",
    images: [OG_IMAGE.url],
  },
};

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Gamana Coins",
    itemListElement: coinPacks.flatMap((pack, index) => [
      {
        "@type": "Offer",
        position: index * 2 + 1,
        name: `${pack.coins} Gamana Coins`,
        price: pack.priceInr,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        position: index * 2 + 2,
        name: `${pack.coins} Gamana Coins`,
        price: pack.priceUsd,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ]),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroHeader transparent />
      <main>
        <PageHero
          image={getPhoto("hero-pricing")}
          imageAlt=""
          eyebrow="Gamana Coins"
          breadcrumbs={[{ label: "Pricing", href: "/pricing/" }]}
          heading="Pay once. Hear the city as you walk."
          subtitle="Coins unlock premium audio stories and walks. Free stories stay free. Prices show in INR if you are in India, USD everywhere else — switch anytime."
        />

        <PricingCatalog />

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader align="left" title="How it works" />
            <div className="relative">
            <div
              className="absolute left-8 right-8 top-8 hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 sm:block"
              aria-hidden
            />
            <ol className="relative grid gap-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 120} className="relative">
                  <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 font-display text-xl font-bold text-white shadow-lift">
                    {index + 1}
                  </span>
                  <p className="eyebrow mt-6">Step {index + 1}</p>
                  <h3 className="text-h3 mt-2 text-ink">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{step.text}</p>
                </Reveal>
              ))}
            </ol>
            </div>
          </div>
        </section>

        <section className="section bg-sand-50">
          <div className="container-site max-w-3xl">
            <SectionHeader title="Questions" />
            <FaqAccordion items={faqs} withSchema />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
