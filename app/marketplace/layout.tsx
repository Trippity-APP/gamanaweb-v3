import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Audio Tours & Travel Experiences Marketplace',
  description: 'Explore curated audio tours and audio guides, self-guided travel experiences, and storytelling journeys worldwide. Discover immersive stories on Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/marketplace',
  },
  openGraph: {
    title: 'Audio Tours & Travel Experiences Marketplace | Gamana',
    description: 'Explore curated audio tours and audio guides, self-guided travel experiences, and storytelling journeys worldwide. Discover immersive stories on Gamana.',
    url: 'https://www.gamana.app/marketplace',
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
    title: 'Audio Tours & Travel Experiences Marketplace | Gamana',
    description: 'Explore curated audio tours and audio guides, self-guided travel experiences, and storytelling journeys worldwide. Discover immersive stories on Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      {children}
    </>
  );
}

