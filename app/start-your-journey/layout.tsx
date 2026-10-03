import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Your Journey',
  alternates: { canonical: 'https://www.gamana.app/start-your-journey/' },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function StartYourJourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
