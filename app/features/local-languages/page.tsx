import { Metadata } from 'next';
import { Globe, Languages, Volume2, Map, Mic2, BookOpen, MessageSquare } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Multilingual Audio Tours in Local Languages | Gamana" },
  description: "Explore with multilingual audio tours, native-speaker narration, cultural context, and language options that help you connect with each destination.",
  alternates: {
    canonical: 'https://www.gamana.app/features/local-languages/',
  },
  openGraph: {
    title: "Multilingual Audio Tours in Local Languages | Gamana",
    description: "Explore with multilingual audio tours, native-speaker narration, cultural context, and language options that help you connect with each destination.",
    url: 'https://www.gamana.app/features/local-languages/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Multilingual Audio Tours in Local Languages | Gamana",
    description: "Explore with multilingual audio tours, native-speaker narration, cultural context, and language options that help you connect with each destination.",
    images: [OG_IMAGE.url],
  },
};

export default function LocalLanguagesPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={Globe}
      title="Local Languages"
      subtitle="Listen to tours in the language that feels natural to you, with native-speaker narration and cultural context that helps you connect more deeply with each destination."
      slug="local-languages"
      heading="Explore Destinations Through Local Languages"
      heroAlt="Gamana multilingual audio tours with local-language narration and cultural context"
      heroTitle="Gamana multilingual audio tours in local languages"
      introTitle="Connect Through Language"
      introText={[
        'Experience destinations the way locals do with multi-language support. Gamana offers tours and narratives in numerous languages, allowing you to connect more deeply with the culture, history, and community of each place you visit.',
        'Whether you are practicing a language, hearing stories in your native tongue, or listening in the local language, you can switch languages as you go.',
      ]}
      benefits={[
        { text: 'Tours available in 7 languages' },
        { text: 'Native speaker narration' },
        { text: 'Cultural context in local language' },
        { text: 'Learn key phrases as you explore' },
        { text: 'Switch languages on the fly' },
        { text: 'Pronunciation guides included' },
      ]}
      examples={[
        {
          icon: Languages,
          title: 'Extensive Language Support',
          description: 'Access tours in major world languages plus regional dialects including regional languages where we have them.',
        },
        {
          icon: Volume2,
          title: 'Native Pronunciation',
          description: 'Hear names, places, and phrases pronounced correctly by native speakers.',
        },
        {
          icon: Map,
          title: 'Cultural Immersion',
          description: 'Understand cultural nuances and local perspectives through language-specific narratives.',
        },
      ]}
      quickFeatures={[
        { icon: Mic2, title: 'Native Voices' },
        { icon: BookOpen, title: '7 Languages' },
        { icon: MessageSquare, title: 'Cultural Context' },
      ]}
    />
    </>
  );
}
