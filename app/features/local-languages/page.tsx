import { Metadata } from 'next';
import { Globe, Languages, Volume2, Map, Mic2, BookOpen, MessageSquare } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'Local Languages for Cultural Walking Tours',
  description: 'Experience authentic local narratives in multiple languages during immersive walking tours. Connect deeper with culture and communities through Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/local-languages',
  },
  openGraph: {
    title: 'Local Languages for Cultural Walking Tours | Gamana',
    description: 'Experience authentic local narratives in multiple languages during immersive walking tours. Connect deeper with culture and communities through Gamana.',
    url: 'https://www.gamana.app/features/local-languages',
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
    title: 'Local Languages for Cultural Walking Tours | Gamana',
    description: 'Experience authentic local narratives in multiple languages during immersive walking tours. Connect deeper with culture and communities through Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function LocalLanguagesPage() {
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
      icon={Globe}
      title="Local Languages"
      subtitle="Authentic local experiences through native language narratives and cultural immersion"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/fort-kochi-local-market.jpg"
      introTitle="Connect Through Language"
      introText={[
        'Experience destinations the way locals do with multi-language support. Gamana offers tours and narratives in numerous languages, allowing you to connect more deeply with the culture, history, and community of each place you visit.',
        'Whether you want to practice a language you are learning, hear stories in your native tongue, or experience the authentic cadence of local narratives, our multi-language support breaks down barriers and enriches your travel experience.',
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
          description: 'Access tours in major world languages plus regional dialects for a truly authentic experience.',
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
