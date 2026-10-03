import { Metadata } from 'next';
import { Share2, PenTool, Users as UsersIcon, Heart, Edit3, Upload, ThumbsUp } from '@/components/icons';
import EnhancedPageLayout from '@/components/enhanced-page-layout';
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "User-Generated Travel Tours & Storylists | Gamana" },
  description: "Create custom travel tours and storylists, share local knowledge, and discover unique experiences created by travelers in the Gamana community.",
  alternates: {
    canonical: 'https://www.gamana.app/features/user-generated-tours/',
  },
  openGraph: {
    title: "User-Generated Travel Tours & Storylists | Gamana",
    description: "Create custom travel tours and storylists, share local knowledge, and discover unique experiences created by travelers in the Gamana community.",
    url: 'https://www.gamana.app/features/user-generated-tours/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "User-Generated Travel Tours & Storylists | Gamana",
    description: "Create custom travel tours and storylists, share local knowledge, and discover unique experiences created by travelers in the Gamana community.",
    images: [OG_IMAGE.url],
  },
};

export default function UserGeneratedToursPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EnhancedPageLayout
      icon={Share2}
      title="User-Generated Tours"
      subtitle="Build custom tours and storylists around your favorite places, share your local knowledge, and discover experiences created by fellow travelers."
      slug="user-generated-tours"
      heading="Create and Discover Unique Travel Tours"
      heroAlt="Gamana user-generated travel tours and custom travel stories created by travelers"
      heroTitle="Gamana user-generated travel tours"
      introTitle="Your Story, Your Way"
      introText={[
        'You can build your own tours and storylists: your neighborhood walk, your favourite food route, your take on a city.',
        'Explore tours created by other passionate travelers from around the world. Discover niche experiences, local favorites, and unique perspectives that you will not find in traditional guidebooks. The best tours are often created by those who love a place most.',
      ]}
      benefits={[
        { text: 'Create custom tours and storylists' },
        { text: 'Share your local knowledge' },
        { text: 'Discover community-created content' },
        { text: 'Curate themed experiences' },
        { text: 'Earn recognition and rewards' },
        { text: 'Build your travel creator profile' },
      ]}
      examples={[
        {
          icon: PenTool,
          title: 'Easy Creation Tools',
          description: 'Intuitive interface to create, edit, and publish your own tours with photos, audio, and detailed descriptions.',
        },
        {
          icon: UsersIcon,
          title: 'Community Discovery',
          description: 'Explore thousands of user-created tours spanning unique themes, neighborhoods, and experiences.',
        },
        {
          icon: Heart,
          title: 'Share & Inspire',
          description: 'Build your following, receive feedback, and inspire other travelers with your unique perspective.',
        },
      ]}
      quickFeatures={[
        { icon: Edit3, title: 'Easy Creation' },
        { icon: Upload, title: 'Share Instantly' },
        { icon: ThumbsUp, title: 'Community Driven' },
      ]}
    />
    </>
  );
}
