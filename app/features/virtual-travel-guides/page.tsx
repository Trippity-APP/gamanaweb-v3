import { Metadata } from 'next';
import { User, MessageCircle, Mic, Stars, Users, Bot, Award } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Virtual Travel Guides for Smart Exploration',
  description: 'Pick a narrator for your walk: historians, comedians, and local guides with distinct voices and styles. Listen on Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/virtual-travel-guides',
  },
  openGraph: {
    title: 'Virtual Travel Guides for Smart Exploration | Gamana',
    description: 'Pick a narrator for your walk: historians, comedians, and local guides with distinct voices and styles. Listen on Gamana.',
    url: 'https://www.gamana.app/features/virtual-travel-guides',
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
    title: 'Virtual Travel Guides for Smart Exploration | Gamana',
    description: 'Pick a narrator for your walk: historians, comedians, and local guides with distinct voices and styles. Listen on Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function VirtualTravelGuidesPage() {
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
      icon={User}
      title="Virtual Travel Guides"
      subtitle="Knowledgeable narrator companions with distinct personalities: historian, comedian, local guide"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg"
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
