import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'About',
  description: "Learn about Gamana, an audio tour app offering hands-free walking tours you can take at your own pace.",
  alternates: {
    canonical: 'https://www.gamana.app/about',
  },
  openGraph: {
    title: 'About | Gamana',
    description: "Discover Gamana, an audio tour app with hands-free walking tours across heritage cities.",
    url: 'https://www.gamana.app/about',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Gamana',
    description: "Explore Gamana, an audio tour app with hands-free walking tours across India and beyond.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

