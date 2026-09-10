import { Metadata } from 'next';
import { Gift, Tag, Percent, Store, ShoppingBag, CreditCard, BadgePercent } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Discounts & Offers on Travel Tours',
  description: 'Member discounts on audio tours and partner deals at restaurants, shops, and attractions. Save while you explore with Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/discounts-offers',
  },
  openGraph: {
    title: 'Discounts & Offers on Travel Tours | Gamana',
    description: 'Member discounts on audio tours and partner deals at restaurants, shops, and attractions. Save while you explore with Gamana.',
    url: 'https://www.gamana.app/features/discounts-offers',
    siteName: 'Gamana',
    type: 'website',
    images: [
      {
        url: '/gamana-logo.svg',
        alt: 'Gamana Logo',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discounts & Offers on Travel Tours | Gamana',
    description: 'Member discounts on audio tours and partner deals at restaurants, shops, and attractions. Save while you explore with Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function DiscountsOffersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Gamana",
            "url": "https://www.gamana.app",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.gamana.app/gamana-logo.svg",
              "name": "Gamana Logo",
              "caption": "Gamana Logo"
            },
            "sameAs": [
              "https://www.facebook.com/gamanaapp",
              "https://twitter.com/gamanaapp",
              "https://www.instagram.com/gamanaapp"
            ]
          })
        }}
      />
      <EnhancedPageLayout
      icon={Gift}
      title="Discounts & Offers"
      subtitle="Partner deals for Gamana members that make your travel experiences more affordable and rewarding"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
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
