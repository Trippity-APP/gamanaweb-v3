import type { Metadata } from 'next';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Audio Tours & Walking Experiences | Gamana" },
  description: "Browse audio tours and walking experiences from Gamana, with engaging stories for exploring cities, landmarks, and destinations at your own pace.",
  alternates: {
    canonical: 'https://www.gamana.app/marketplace/',
  },
  openGraph: {
    title: "Audio Tours & Walking Experiences | Gamana",
    description: "Browse audio tours and walking experiences from Gamana, with engaging stories for exploring cities, landmarks, and destinations at your own pace.",
    url: 'https://www.gamana.app/marketplace/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Audio Tours & Walking Experiences | Gamana",
    description: "Browse audio tours and walking experiences from Gamana, with engaging stories for exploring cities, landmarks, and destinations at your own pace.",
    images: [OG_IMAGE.url],
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      {children}
    </>
  );
}
