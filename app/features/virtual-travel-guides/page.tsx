import { Metadata } from 'next';
import { User, MessageCircle, Mic, Stars, Users, Bot, Award } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Virtual Travel Guides for Smart Exploration',
  description: 'Explore destinations from anywhere with virtual travel guides that offer interactive tours, insights, and immersive storytelling. Discover more with Gamana!',
  alternates: {
    canonical: 'https://www.gamana.app/features/virtual-travel-guides',
  },
  openGraph: {
    title: 'Virtual Travel Guides for Smart Exploration | Gamana',
    description: 'Explore destinations from anywhere with virtual travel guides that offer interactive tours, insights, and immersive storytelling. Discover more with Gamana!',
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
    description: 'Explore destinations from anywhere with virtual travel guides that offer interactive tours, insights, and immersive storytelling. Discover more with Gamana!',
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
      subtitle="Knowledgeable narrator companions with distinct personalities that bring destinations to life"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg"
      introTitle="Your Personal Tour Guide"
      introText={[
        'Choose from a curated selection of virtual guides, each with their own unique personality, expertise, and narration style. Whether you prefer an enthusiastic storyteller, a scholarly historian, or a friendly local, we have the perfect companion for your journey.',
        'Our guides are trained on extensive historical and cultural knowledge, ensuring accurate, engaging, and contextually rich narratives at every stop.',
      ]}
      benefits={[
        { text: 'Multiple guide personalities to choose from' },
        { text: 'Expert knowledge across various topics' },
        { text: 'Natural, conversational narration' },
        { text: 'Consistent companion throughout your journey' },
        { text: 'Adaptive communication style' },
        { text: 'Cultural sensitivity and authenticity' },
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
          description: 'High-quality voice acting and natural delivery make every story come alive.',
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
        { icon: Award, title: 'Expert Curated' },
      ]}
    />
    </>
  );
}
