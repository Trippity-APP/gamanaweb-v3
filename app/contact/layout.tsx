import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Contact Us',
  description: 'Contact Gamana for app support, media or partnership inquiries, and general assistance. We\'ll reply quickly and help with all your travel needs.',
  alternates: {
    canonical: 'https://www.gamana.app/contact',
  },
  openGraph: {
    title: 'Contact Us | Gamana',
    description: 'Contact Gamana for app support, media or partnership inquiries, and general assistance. We\'ll reply quickly and help with all your travel needs.',
    url: 'https://www.gamana.app/contact',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Gamana',
    description: 'Contact Gamana for app support, media or partnership inquiries, and general assistance. We\'ll reply quickly and help with all your travel needs.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

