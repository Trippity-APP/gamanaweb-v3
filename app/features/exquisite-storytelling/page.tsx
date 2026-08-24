import { Metadata } from 'next';
import { BookOpen, Sparkles, Users, Globe2, BookMarked, Lightbulb, Heart } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Exquisite Storytelling: Immersive Audio Guides',
  description: 'Experience exquisite storytelling through immersive audio guides and travel stories. Discover culture, history, and hidden insights with Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/exquisite-storytelling',
  },
  openGraph: {
    title: 'Exquisite Storytelling: Immersive Audio Guides | Gamana',
    description: 'Experience exquisite storytelling through immersive audio guides and travel stories. Discover culture, history, and hidden insights with Gamana.',
    url: 'https://www.gamana.app/features/exquisite-storytelling',
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
    title: 'Exquisite Storytelling: Immersive Audio Guides | Gamana',
    description: 'Experience exquisite storytelling through immersive audio guides and travel stories. Discover culture, history, and hidden insights with Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function ExquisiteStorytellingPage() {
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
      icon={BookOpen}
      title="Exquisite Storytelling"
      subtitle="Transform your travels with inspiring, insightful, and shocking facts delivered through masterfully crafted audio narratives"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/varanasi ghats golden hour river boats temple spires panoramic view.jpg"
      introTitle="Every Destination Has a Story Worth Telling"
      introText={[
        'Our storytelling goes beyond simple facts and dates. We weave together history, culture, and local insights to create rich, immersive narratives that make every location come alive. Each story is carefully researched, expertly written, and designed to captivate your imagination.',
        'Whether you\'re exploring ancient ruins, walking through historic neighborhoods, or visiting world-famous landmarks, our audio narratives reveal the fascinating stories that make each place unique.',
      ]}
      benefits={[
        { text: 'Professionally researched and written narratives' },
        { text: 'Historical facts blended with local legends' },
        { text: 'Surprising discoveries and hidden stories' },
        { text: 'Engaging narrative arcs that captivate listeners' },
        { text: 'Cultural context that deepens understanding' },
        { text: 'Expert curation by local historians and storytellers' },
      ]}
      examples={[
        {
          icon: Globe2,
          title: 'Hidden Historical Gems',
          description: 'Uncover forgotten stories behind famous landmarks, from secret tunnels beneath ancient cities to untold tales of historical figures.',
        },
        {
          icon: Users,
          title: 'Local Legends & Folklore',
          description: 'Immerse yourself in captivating myths, legends, and folklore that have shaped communities for generations.',
        },
        {
          icon: Sparkles,
          title: 'Shocking Facts',
          description: 'Discover surprising truths and fascinating details that you won\'t find in traditional guidebooks.',
        },
      ]}
      quickFeatures={[
        { icon: BookMarked, title: 'Expert Curation' },
        { icon: Lightbulb, title: 'Fascinating Insights' },
        { icon: Heart, title: 'Emotionally Engaging' },
      ]}
    />
    </>
  );
}
