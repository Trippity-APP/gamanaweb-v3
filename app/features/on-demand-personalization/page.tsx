import { Metadata } from 'next';
import { Sparkles, Brain, Wand2, Target, Zap, Cpu, TrendingUp } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'On-Demand Personalization with Travel AI',
  description: 'On-demand personalization powered by Travel AI tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
  alternates: {
    canonical: 'https://www.gamana.app/features/on-demand-personalization/',
  },
  openGraph: {
    title: 'On-Demand Personalization with Travel AI | Gamana',
    description: 'On-demand personalization powered by Travel AI tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
    url: 'https://www.gamana.app/features/on-demand-personalization/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On-Demand Personalization with Travel AI | Gamana',
    description: 'On-demand personalization powered by Travel AI tailors stories and experiences to your interests, pace, and style for smarter, more meaningful journeys.',
    images: [OG_IMAGE.url],
  },
};

export default function OnDemandPersonalizationPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={Sparkles}
      title="On-Demand Personalization"
      subtitle="Stories and experiences that adapt to your unique preferences and interests"
      slug="on-demand-personalization"
      introTitle="Tours That Match How You Travel"
      introText={[
        'Every traveler is unique, and your tour should be too. Gamana learns from your preferences, interests, and travel style to deliver stories and stops that fit your interests.',
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
          title: 'Learns Your Tastes',
          description: 'Gamana analyzes your interactions, ratings, and preferences to continuously refine your experience.',
        },
        {
          icon: Wand2,
          title: 'Adjusts as You Go',
          description: 'Content automatically adjusts based on your pace, location, and expressed interests.',
        },
        {
          icon: Target,
          title: 'Better Matches',
          description: 'Get stories and recommendations that fit how you actually like to explore and curiosities.',
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
