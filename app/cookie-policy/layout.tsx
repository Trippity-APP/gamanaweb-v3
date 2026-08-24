import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Cookie Policy',
  description: 'Read how Gamana uses cookies on our website and app, what data is collected, why it\'s used, and the options available to manage your cookie preferences.',
  alternates: {
    canonical: 'https://www.gamana.app/cookie-policy',
  },
  openGraph: {
    title: 'Cookie Policy | Gamana',
    description: 'Read how Gamana uses cookies on our website and app, what data is collected, why it\'s used, and the options available to manage your cookie preferences.',
    url: 'https://www.gamana.app/cookie-policy',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | Gamana',
    description: 'Read how Gamana uses cookies on our website and app, what data is collected, why it\'s used, and the options available to manage your cookie preferences.',
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

