import { Metadata } from 'next';
import { TrendingUp, Gift as GiftIcon, Shield, Wallet, DollarSign, Award } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Gamana Coins Rewards & Benefits',
  description: 'Earn and redeem Gamana Coins for discounts, upgrades, and discounts and perks on tours. Get more value from every self-guided audio tour on Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/gamana-coins',
  },
  openGraph: {
    title: 'Gamana Coins Rewards & Benefits | Gamana',
    description: 'Earn and redeem Gamana Coins for discounts, upgrades, and discounts and perks on tours. Get more value from every self-guided audio tour on Gamana.',
    url: 'https://www.gamana.app/features/gamana-coins',
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
    title: 'Gamana Coins Rewards & Benefits | Gamana',
    description: 'Earn and redeem Gamana Coins for discounts, upgrades, and discounts and perks on tours. Get more value from every self-guided audio tour on Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function GamanaCoinsPage() {
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
      <EnhancedPageLayout
      icon={GamanaCoinIcon}
      title="Gamana Coins"
      subtitle="Loyalty rewards that turn your adventures into tangible benefits"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/jaipur travel guide explore top places in the pink city with an audio guide app.jpg"
      introTitle="Earn While You Explore"
      introText={[
        'Gamana Coins are our loyalty reward system that recognizes and rewards your engagement with the platform. Every tour you complete, review you write, and milestone you reach earns you coins that have real value.',
        'Use your accumulated coins to unlock premium content, get discounts on future tours, access exclusive experiences, or even exchange them with other travelers. It is a reward system. Earn Coins as you explore, spend them on tours.',
      ]}
      benefits={[
        { text: 'Earn coins for tours, reviews, and engagement' },
        { text: 'Securely tracked in your wallet' },
        { text: 'Redeem for discounts and upgrades' },
        { text: 'Exchange with other travelers' },
        { text: 'Unlock premium tours' },
        { text: 'Track your earning history' },
      ]}
      examples={[
        {
          icon: TrendingUp,
          title: 'Multiple Earning Opportunities',
          description: 'Earn coins by completing tours, writing reviews, sharing experiences, and reaching milestones.',
        },
        {
          icon: GiftIcon,
          title: 'Valuable Rewards',
          description: 'Redeem your coins for premium tours, partner discounts, exclusive content, and special experiences.',
        },
        {
          icon: Shield,
          title: 'Secure & Transparent',
          description: 'Every coin you earn or redeem is tracked securely, so your balance and history are always accurate.',
        },
      ]}
      quickFeatures={[
        { icon: Wallet, title: 'Digital Wallet' },
        { icon: DollarSign, title: 'Real Value' },
        { icon: Award, title: 'Earn Rewards' },
      ]}
    />
    </>
  );
}
