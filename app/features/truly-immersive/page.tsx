import { Metadata } from 'next';
import { Headphones, Eye, Hand, MapPin, Smartphone, Navigation, Radio } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Hands-Free GPS Audio Tours for Walking | Gamana" },
  description: "Explore hands-free with GPS-triggered audio tours that play automatically as you walk, so you can stay present and enjoy your surroundings.",
  alternates: {
    canonical: 'https://www.gamana.app/features/truly-immersive/',
  },
  openGraph: {
    title: "Hands-Free GPS Audio Tours for Walking | Gamana",
    description: "Explore hands-free with GPS-triggered audio tours that play automatically as you walk, so you can stay present and enjoy your surroundings.",
    url: 'https://www.gamana.app/features/truly-immersive/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hands-Free GPS Audio Tours for Walking | Gamana",
    description: "Explore hands-free with GPS-triggered audio tours that play automatically as you walk, so you can stay present and enjoy your surroundings.",
    images: [OG_IMAGE.url],
  },
};

export default function TrulyImmersivePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={Headphones}
      title="Truly Immersive"
      subtitle="Keep your eyes up and your phone away while GPS-triggered stories play automatically as you reach points of interest, helping you experience each destination naturally."
      slug="truly-immersive"
      heading="Hands-Free Audio Tours for More Immersive Exploration"
      heroAlt="Gamana hands-free GPS audio tours with location-triggered stories"
      heroTitle="Gamana hands-free GPS audio tours"
      introTitle="Experience Travel the Way It Should Be"
      introText={[
        'Put away your phone and guidebook. With Gamana, you can explore freely with your eyes up and hands free, fully present in the moment. Our GPS-triggered audio narratives play automatically as you walk, eliminating the need to constantly check your device.',
        'This hands-free approach lets you absorb the sights, sounds, and atmosphere of your destination while receiving rich, contextual information through your headphones. Stories play when you reach each stop, like walking with someone who knows the place.',
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
