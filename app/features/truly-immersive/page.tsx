import { Metadata } from 'next';
import { Headphones, Eye, Hand, MapPin, Smartphone, Navigation, Radio } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Truly Immersive Travel Experiences',
  description: 'Step into truly immersive travel experiences with rich soundscapes, storytelling, and atmosphere that make every destination feel alive with Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/truly-immersive',
  },
  openGraph: {
    title: 'Truly Immersive Travel Experiences | Gamana',
    description: 'Step into truly immersive travel experiences with rich soundscapes, storytelling, and atmosphere that make every destination feel alive with Gamana.',
    url: 'https://www.gamana.app/features/truly-immersive',
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
    title: 'Truly Immersive Travel Experiences | Gamana',
    description: 'Step into truly immersive travel experiences with rich soundscapes, storytelling, and atmosphere that make every destination feel alive with Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function TrulyImmersivePage() {
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
      icon={Headphones}
      title="Truly Immersive"
      subtitle="Hands-free, eyes-up exploration that keeps you fully engaged with your surroundings"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png"
      introTitle="Experience Travel the Way It Should Be"
      introText={[
        'Put away your phone and guidebook. With Gamana, you can explore freely with your eyes up and hands free, fully present in the moment. Our GPS-triggered audio narratives play automatically as you walk, eliminating the need to constantly check your device.',
        'This truly immersive approach lets you absorb the sights, sounds, and atmosphere of your destination while receiving rich, contextual information through your headphones. It is like having a knowledgeable friend walking beside you.',
      ]}
      benefits={[
        { text: 'Completely hands-free operation' },
        { text: 'GPS-triggered automatic narration' },
        { text: 'Eyes-up, device-down exploration' },
        { text: 'Fully present in the moment' },
        { text: 'No need to read or check your phone' },
        { text: 'Safe navigation while walking' },
      ]}
      examples={[
        {
          icon: Eye,
          title: 'Eyes-Up Design',
          description: 'Keep your focus on the world around you, not on a screen. Experience destinations with full visual engagement.',
        },
        {
          icon: Hand,
          title: 'Hands-Free Freedom',
          description: 'Take photos, hold hands, or carry your coffee without juggling devices or paper maps.',
        },
        {
          icon: MapPin,
          title: 'Auto-Triggered Stories',
          description: 'Narratives automatically begin as you approach points of interest, perfectly timed to your journey.',
        },
      ]}
      quickFeatures={[
        { icon: Smartphone, title: 'Device-Free' },
        { icon: Navigation, title: 'GPS-Triggered' },
        { icon: Radio, title: 'Audio-First' },
      ]}
    />
    </>
  );
}
