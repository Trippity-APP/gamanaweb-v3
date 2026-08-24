import { Metadata } from 'next';
import { Sparkles, Brain, Wand2, Target, Zap, Cpu, TrendingUp } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'On-Demand Personalization for Every Journey',
  description: 'On-demand personalization tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
  alternates: {
    canonical: 'https://www.gamana.app/features/on-demand-personalization',
  },
  openGraph: {
    title: 'On-Demand Personalization for Every Journey | Gamana',
    description: 'On-demand personalization tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
    url: 'https://www.gamana.app/features/on-demand-personalization',
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
    title: 'On-Demand Personalization for Every Journey | Gamana',
    description: 'On-demand personalization tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
    images: ['/gamana-logo.svg'],
  },
};

export default function OnDemandPersonalizationPage() {
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
      icon={Sparkles}
      title="On-Demand Personalization"
      subtitle="Stories and experiences that adapt to your unique preferences and interests"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      introTitle="Your Journey, Perfectly Tailored"
      introText={[
        'Every traveler is unique, and your tour should be too. Gamana learns from your preferences, interests, and travel style to deliver personalized content that resonates with you.',
        'Whether you\'re a history buff, foodie, architecture enthusiast, or adventure seeker, Gamana dynamically adjusts narratives to match your interests, ensuring every story you hear is relevant and engaging.',
      ]}
      benefits={[
        { text: 'Gamana learns your preferences over time' },
        { text: 'Content adapts to your interests in real-time' },
        { text: 'Personalized recommendations for attractions' },
        { text: 'Customizable tour lengths and pacing' },
        { text: 'Dynamic content based on time of day' },
        { text: 'Skip topics that don\'t interest you' },
      ]}
      examples={[
        {
          icon: Brain,
          title: 'Smart Learning',
          description: 'Gamana analyzes your interactions, ratings, and preferences to continuously refine your experience.',
        },
        {
          icon: Wand2,
          title: 'Dynamic Adaptation',
          description: 'Content automatically adjusts based on your pace, location, and expressed interests.',
        },
        {
          icon: Target,
          title: 'Precision Matching',
          description: 'Get stories and recommendations that align perfectly with your travel style and curiosities.',
        },
      ]}
      quickFeatures={[
        { icon: Zap, title: 'Real-Time Personalization' },
        { icon: Cpu, title: 'Constantly Learning' },
        { icon: TrendingUp, title: 'Always Improving' },
      ]}
    />
    </>
  );
}
