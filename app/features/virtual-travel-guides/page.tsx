import { Metadata } from 'next';
import { User, MessageCircle, Mic, Stars, Users, Bot, Award } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Virtual Travel Guides for Personalized Tours | Gamana" },
  description: "Choose a virtual travel guide with a distinct voice and personality. Explore with knowledgeable narration shaped by history, culture, and local context.",
  alternates: {
    canonical: 'https://www.gamana.app/features/virtual-travel-guides/',
  },
  openGraph: {
    title: "Virtual Travel Guides for Personalized Tours | Gamana",
    description: "Choose a virtual travel guide with a distinct voice and personality. Explore with knowledgeable narration shaped by history, culture, and local context.",
    url: 'https://www.gamana.app/features/virtual-travel-guides/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Virtual Travel Guides for Personalized Tours | Gamana",
    description: "Choose a virtual travel guide with a distinct voice and personality. Explore with knowledgeable narration shaped by history, culture, and local context.",
    images: [OG_IMAGE.url],
  },
};

export default function VirtualTravelGuidesPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={User}
      title="Virtual Travel Guides"
      subtitle="Choose a narrator whose voice and personality match your style, then explore with engaging guidance informed by history, culture, and local knowledge."
      slug="virtual-travel-guides"
      heading="Your Personal Virtual Travel Guide for Every Journey"
      heroAlt="Gamana virtual travel guide with personalized audio narration for exploring destinations"
      heroTitle="Gamana virtual travel guides for personalized tours"
      introTitle="Your Personal Tour Guide"
      introText={[
        "Pick a narrator (historian, comedian, or local guide) whose voice you'd want for the walk.",
        'Our guides are trained on extensive historical and cultural knowledge, ensuring accurate, engaging, and contextually rich narratives at every stop.',
      ]}
      benefits={[
        { text: 'Multiple guide personalities to choose from' },
        { text: 'Expert knowledge across various topics' },
        { text: 'Natural, conversational narration' },
        { text: 'Consistent companion throughout your journey' },
        { text: 'Adaptive communication style' },
        { text: 'Respectful, locally informed narration' },
      ]}
      examples={[
        {
          icon: MessageCircle,
          title: 'Engaging Personalities',
          description: 'Each guide has a distinct voice and style, from enthusiastic storytellers to scholarly experts.',
        },
        {
          icon: Mic,
          title: 'Professional Narration',
          description: 'High-quality voice acting and natural delivery that sound like real people talking, not a script being read.',
        },
        {
          icon: Stars,
          title: 'Expert Knowledge',
          description: 'Guides are trained on extensive historical, cultural, and local information for accurate narratives.',
        },
      ]}
      quickFeatures={[
        { icon: Users, title: 'Multiple Personas' },
        { icon: Bot, title: 'Story-Rich Narration' },
        { icon: Award, title: 'Written by researchers' },
      ]}
    />
    </>
  );
}
