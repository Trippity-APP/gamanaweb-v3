import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Travel Destinations & Cities to Explore | Gamana" },
  description: "Explore travel destinations and cities around the world with Gamana. Discover city stories, local experiences, landmarks, and audio tours as you explore.",
  alternates: {
    canonical: 'https://www.gamana.app/cities/',
  },
  openGraph: {
    title: "Travel Destinations & Cities to Explore | Gamana",
    description: "Explore travel destinations and cities around the world with Gamana. Discover city stories, local experiences, landmarks, and audio tours as you explore.",
    url: 'https://www.gamana.app/cities/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Travel Destinations & Cities to Explore | Gamana",
    description: "Explore travel destinations and cities around the world with Gamana. Discover city stories, local experiences, landmarks, and audio tours as you explore.",
    images: [OG_IMAGE.url],
  },
};

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
