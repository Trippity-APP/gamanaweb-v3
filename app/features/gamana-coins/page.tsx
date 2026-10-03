import { Metadata } from 'next';
import { TrendingUp, Gift as GiftIcon, Shield, Wallet, DollarSign, Award } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Travel Rewards with Gamana Coins | Gamana" },
  description: "Earn Gamana Coins through tours, reviews, and milestones, then redeem them for premium tours, discounts, upgrades, and exclusive experiences.",
  alternates: {
    canonical: 'https://www.gamana.app/features/gamana-coins/',
  },
  openGraph: {
    title: "Travel Rewards with Gamana Coins | Gamana",
    description: "Earn Gamana Coins through tours, reviews, and milestones, then redeem them for premium tours, discounts, upgrades, and exclusive experiences.",
    url: 'https://www.gamana.app/features/gamana-coins/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Travel Rewards with Gamana Coins | Gamana",
    description: "Earn Gamana Coins through tours, reviews, and milestones, then redeem them for premium tours, discounts, upgrades, and exclusive experiences.",
    images: [OG_IMAGE.url],
  },
};

export default function GamanaCoinsPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={GamanaCoinIcon}
      title="Gamana Coins"
      subtitle="Turn your exploration into rewards by earning Gamana Coins through tours, reviews, and milestones, then using them for valuable travel experiences."
      slug="gamana-coins"
      heading="Earn Travel Rewards as You Explore"
      heroAlt="Gamana Coins travel rewards for tours, reviews, and premium travel experiences"
      heroTitle="Gamana Coins travel rewards"
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
