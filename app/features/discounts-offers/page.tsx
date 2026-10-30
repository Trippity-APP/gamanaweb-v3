import { Metadata } from 'next';
import { Gift, Tag, Percent, Store, ShoppingBag, CreditCard, BadgePercent } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Travel Offers & Deals for Audio Tours | Gamana" },
  description: "Find travel offers, deals, and discounts on Gamana audio tours and experiences, helping you enjoy more stories and experiences for less.",
  alternates: {
    canonical: 'https://www.gamana.app/features/discounts-offers/',
  },
  openGraph: {
    title: "Travel Offers & Deals for Audio Tours | Gamana",
    description: "Find travel offers, deals, and discounts on Gamana audio tours and experiences, helping you enjoy more stories and experiences for less.",
    url: 'https://www.gamana.app/features/discounts-offers/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Travel Offers & Deals for Audio Tours | Gamana",
    description: "Find travel offers, deals, and discounts on Gamana audio tours and experiences, helping you enjoy more stories and experiences for less.",
    images: [OG_IMAGE.url],
  },
};

export default function DiscountsOffersPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={Gift}
      title="Discounts & Offers"
      subtitle="Find travel offers and deals on Gamana audio tours and experiences, with special discounts that help you enjoy more stories and memorable moments while you travel."
      slug="discounts-offers"
      heading="Travel Offers and Deals for Your Next Journey"
      heroAlt="Gamana travel offers and deals on audio tours"
      heroTitle="Gamana Travel Offers and Deals"
      introTitle="Save More, Experience More"
      introText={[
        'Gamana partners with hundreds of local businesses, attractions, and services to bring you exclusive discounts and special offers. As you explore, you will discover deals that are only available to Gamana users, making your travel experiences more affordable.',
        'From restaurant discounts to museum entry deals, retail promotions to tour upgrades, our partner network is constantly growing to provide you with valuable savings wherever your adventures take you.',
      ]}
      benefits={[
        { text: 'Exclusive partner discounts (10-30% off)' },
        { text: 'Special offers at local businesses' },
        { text: 'Member-only promotions' },
        { text: 'Attraction bundle deals' },
        { text: 'Early access to limited offers' },
        { text: 'Location-based deal notifications' },
      ]}
      examples={[
        {
          icon: Tag,
          title: 'Partner Discounts',
          description: 'Access exclusive deals at restaurants, cafes, shops, and attractions throughout your destination.',
        },
        {
          icon: Percent,
          title: 'Special Promotions',
          description: 'Receive notifications about time-limited offers and seasonal promotions as you explore.',
        },
        {
          icon: Store,
          title: 'Local Business Deals',
          description: 'Support local businesses while saving money with our partner restaurants, shops, and attractions.',
        },
      ]}
      quickFeatures={[
        { icon: ShoppingBag, title: 'Member Deals' },
        { icon: CreditCard, title: 'Instant Savings' },
        { icon: BadgePercent, title: 'Partner Network' },
      ]}
    />
    </>
  );
}
