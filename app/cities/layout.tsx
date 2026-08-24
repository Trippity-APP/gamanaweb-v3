import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Cities Covered by Gamana – Your Heritage Audio Travel Guide',
  description: 'Explore cities through immersive, location-aware audio stories. No reading. No planning. Just walk and listen. Check our coverage of 50+ cities and 700+ audio stories worldwide.',
  alternates: {
    canonical: 'https://www.gamana.app/cities',
  },
  openGraph: {
    title: 'Cities Covered by Gamana | Heritage Audio Travel Guide',
    description: 'Explore cities through immersive, location-aware audio stories. No reading. No planning. Just walk and listen. Check our coverage of 50+ cities and 700+ audio stories worldwide.',
    url: 'https://www.gamana.app/cities',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cities Covered by Gamana | Heritage Audio Travel Guide',
    description: 'Explore cities through immersive, location-aware audio stories. No reading. No planning. Just walk and listen. Check our coverage of 50+ cities and 700+ audio stories worldwide.',
  },
};

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
