import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Subscription Plans & Pricing',
  description: 'Choose the Gamana subscription plan that fits your journey and enjoy offline access, premium audio tours, and exclusive travel features.',
  alternates: {
    canonical: 'https://www.gamana.app/subscription',
  },
  openGraph: {
    title: 'Subscription Plans & Pricing | Gamana',
    description: 'Choose the Gamana subscription plan that fits your journey and enjoy offline access, premium audio tours, and exclusive travel features.',
    url: 'https://www.gamana.app/subscription',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subscription Plans & Pricing | Gamana',
    description: 'Choose the Gamana subscription plan that fits your journey and enjoy offline access, premium audio tours, and exclusive travel features.',
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

