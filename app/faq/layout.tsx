import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'FAQ – Frequently Asked Questions',
  description: 'Find answers to common questions about using the Gamana app, audio narrations, personalization, pricing, features, and how the app works.',
  alternates: {
    canonical: 'https://www.gamana.app/faq/',
  },
  openGraph: {
    title: 'FAQ – Frequently Asked Questions | Gamana',
    description: 'Find answers to common questions about using the Gamana app, audio narrations, personalization, pricing, features, and how the app works.',
    url: 'https://www.gamana.app/faq/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ – Frequently Asked Questions | Gamana',
    description: 'Find answers to common questions about using the Gamana app, audio narrations, personalization, pricing, features, and how the app works.',
    images: [OG_IMAGE.url],
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

