import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'About',
  description: "Learn about Gamana, India's first heritage travel app offering immersive, hands-free audio tours that make every journey engaging and memorable.",
  alternates: {
    canonical: 'https://www.gamana.app/about',
  },
  openGraph: {
    title: 'About | Gamana',
    description: "Discover Gamana, India's first heritage travel app offering hands-free audio tours and immersive cultural experiences for every journey.",
    url: 'https://www.gamana.app/about',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Gamana',
    description: "Explore Gamana, India's first heritage travel app providing immersive, hands-free audio tours and unforgettable cultural experiences.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

