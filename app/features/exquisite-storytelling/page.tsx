import { Metadata } from 'next';
import { BookOpen, Sparkles, Users, Globe2, BookMarked, Lightbulb, Heart } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Immersive Audio Storytelling for Travel | Gamana" },
  description: "Experience immersive audio storytelling with researched history, local legends, and cultural stories that bring landmarks and destinations to life.",
  alternates: {
    canonical: 'https://www.gamana.app/features/exquisite-storytelling/',
  },
  openGraph: {
    title: "Immersive Audio Storytelling for Travel | Gamana",
    description: "Experience immersive audio storytelling with researched history, local legends, and cultural stories that bring landmarks and destinations to life.",
    url: 'https://www.gamana.app/features/exquisite-storytelling/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Immersive Audio Storytelling for Travel | Gamana",
    description: "Experience immersive audio storytelling with researched history, local legends, and cultural stories that bring landmarks and destinations to life.",
    images: [OG_IMAGE.url],
  },
};

export default function ExquisiteStorytellingPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={BookOpen}
      title="Exquisite Storytelling"
      subtitle="Explore history, culture, and local legends through carefully researched audio stories that make every landmark, street, and destination more meaningful."
      slug="exquisite-storytelling"
      heading="Immersive Audio Storytelling That Brings Places to Life"
      heroAlt="Gamana immersive audio storytelling for travel and destination exploration"
      heroTitle="Gamana immersive audio storytelling for travel"
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
