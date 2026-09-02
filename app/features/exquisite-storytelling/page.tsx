import { Metadata } from 'next';
import { BookOpen, Sparkles, Users, Globe2, BookMarked, Lightbulb, Heart } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Story-Rich Audio Guides | Gamana',
  description: 'Audio guides built around history, culture, and the stories behind each stop and travel stories. Discover culture, history, and hidden insights with Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/exquisite-storytelling',
  },
  openGraph: {
    title: 'Story-Rich Audio Guides | Gamana | Gamana',
    description: 'Audio guides built around history, culture, and the stories behind each stop and travel stories. Discover culture, history, and hidden insights with Gamana.',
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
    title: 'Story-Rich Audio Guides | Gamana | Gamana',
    description: 'Audio guides built around history, culture, and the stories behind each stop and travel stories. Discover culture, history, and hidden insights with Gamana.',
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
      subtitle="History and culture told like a good podcast: researched, written, and voiced to keep you listening."
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/varanasi ghats golden hour river boats temple spires panoramic view.jpg"
      introTitle="Every Destination Has a Story Worth Telling"
      introText={[
        'Each tour mixes history, culture, and local detail so a street or monument actually makes sense when you are standing there. Stories are researched, written, and voiced to keep you listening.',
        'Whether you\'re exploring ancient ruins, walking through historic neighborhoods, or visiting world-famous landmarks, our audio narratives reveal the fascinating stories that make each place unique.',
      ]}
      benefits={[
        { text: 'Professionally researched and written narratives' },
        { text: 'Historical facts blended with local legends' },
        { text: 'Surprising discoveries and hidden stories' },
        { text: 'Stories with a beginning, middle, and end, not a list of dates' },
        { text: 'Cultural context that deepens understanding' },
        { text: 'Written with input from local historians and storytellers' },
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
          description: 'Hear the myths, legends, and folklore that have shaped communities for generations.',
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
