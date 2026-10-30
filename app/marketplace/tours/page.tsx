import type { Metadata } from 'next';
import { ExploreCatalogPage } from '@/components/marketplace/ExploreCatalogPage';
import { OG_IMAGE } from '@/lib/seo';

const TITLE = 'Audio Walks for Exploring Cities | Gamana';
const DESCRIPTION =
  'Find audio walks from Gamana that bring city streets, landmarks, and local stories to life while you walk at your own pace.';
const URL_CANONICAL = 'https://www.gamana.app/marketplace/tours/';

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

export default async function MarketplaceWalksCatalogPage() {
  return (
    <ExploreCatalogPage
      heroPhoto="hero-explore-tours"
      heading="Audio Walks for Exploring Cities at Your Own Pace"
      subtitle="Walk through historic streets, landmarks, and local neighbourhoods while stories unfold along the way, giving you a richer sense of each place without following a fixed group tour."
      imageAlt="Gamana audio walks for exploring cities"
      imageTitle="Gamana Audio Walks for Exploring Cities"
    />
  );
}
