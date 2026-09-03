import type { Metadata } from "next";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PricingCatalog } from "@/components/pricing/PricingCatalog";
import { coinPacks } from "@/lib/coin-pricing";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gamana.app"),
  title: "Gamana Coins Pricing | Unlock Audio Stories & Walks",
  description:
    "Buy Gamana Coins in INR or USD: 2, 10, 15, or 25 coins. Unlock premium audio stories and walks. Larger volumes are Enterprise — contact us.",
  alternates: {
    canonical: "https://www.gamana.app/pricing",
  },
  openGraph: {
    title: "Gamana Coins Pricing | Gamana",
    description:
      "Pay once. Hear the city as you walk. Packs from 2 to 25 coins. India sees INR; everyone else sees USD. Need more than 25? Talk to us about Enterprise.",
    url: "https://www.gamana.app/pricing",
    siteName: "Gamana",
    type: "website",
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
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0B6E4F] via-[#159895] to-[#1A5F7A]">
          <HeroHeader transparent={true} />
          <div className="container mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Gamana Coins
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Pay once. Hear the city as you walk.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Coins unlock premium audio stories and walks. Free stories stay free. Prices
              show in INR if you are in India, USD everywhere else — switch anytime.
            </p>
          </div>
        </section>

        <PricingCatalog />
      </main>
      <Footer />
    </>
  );
}
