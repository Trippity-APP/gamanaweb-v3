import type { Metadata } from 'next';
import { ExploreCatalogPage } from '@/components/marketplace/ExploreCatalogPage';
import { OG_IMAGE } from '@/lib/seo';

const TITLE = 'Audio Stories for Travel & Exploration | Gamana';
const DESCRIPTION =
  'Listen to audio stories about cities, landmarks, history, and culture, and experience each destination through engaging stories from Gamana.';
const URL_CANONICAL = 'https://www.gamana.app/marketplace/story/';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL_CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL_CANONICAL,
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default async function MarketplaceStoriesCatalogPage() {
  return (
    <ExploreCatalogPage
      heroPhoto="hero-explore-stories"
      heading="Audio Stories That Bring Destinations to Life"
      subtitle="Listen to stories about the people, places, history, and culture behind the destinations you visit, and add more meaning to the moments you experience along the way."
      imageAlt="Gamana audio stories about destinations and culture"
      imageTitle="Gamana Audio Stories for Travel and Exploration"
    />
  );
}
