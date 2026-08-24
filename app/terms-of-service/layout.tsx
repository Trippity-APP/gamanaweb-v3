import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Terms of Service',
  description: 'Review Gamana\'s Terms of Service to understand the rules for using our website and app, including user responsibilities, permitted use, and legal guidelines.',
  alternates: {
    canonical: 'https://www.gamana.app/terms-of-service',
  },
  openGraph: {
    title: 'Terms of Service | Gamana',
    description: 'Review Gamana\'s Terms of Service to understand the rules for using our website and app, including user responsibilities, permitted use, and legal guidelines.',
    url: 'https://www.gamana.app/terms-of-service',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Gamana',
    description: 'Review Gamana\'s Terms of Service to understand the rules for using our website and app, including user responsibilities, permitted use, and legal guidelines.',
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

