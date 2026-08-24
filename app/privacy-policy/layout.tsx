import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Privacy Policy',
  description: 'Learn how Gamana protects your data on our website and app. Our Privacy Policy explains what we collect, how it\'s used, and how your data stays safe.',
  alternates: {
    canonical: 'https://www.gamana.app/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy | Gamana',
    description: 'Learn how Gamana protects your data on our website and app. Our Privacy Policy explains what we collect, how it\'s used, and how your data stays safe.',
    url: 'https://www.gamana.app/privacy-policy',
    siteName: 'Gamana',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Gamana',
    description: 'Learn how Gamana protects your data on our website and app. Our Privacy Policy explains what we collect, how it\'s used, and how your data stays safe.',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

