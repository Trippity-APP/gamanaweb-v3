import { Metadata } from 'next';
import { Share2, PenTool, Users as UsersIcon, Heart, Edit3, Upload, ThumbsUp } from 'lucide-react';
import EnhancedPageLayout from '@/components/enhanced-page-layout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: 'User-Generated Tours & Custom Travel Paths',
  description: 'Create and explore user-generated tours with custom routes and local insights. Share your travel stories, discover unique paths, and explore with Gamana.',
  alternates: {
    canonical: 'https://www.gamana.app/features/user-generated-tours',
  },
  openGraph: {
    title: 'User-Generated Tours & Custom Travel Paths | Gamana',
    description: 'Create and explore user-generated tours with custom routes and local insights. Share your travel stories, discover unique paths, and explore with Gamana.',
    url: 'https://www.gamana.app/features/user-generated-tours',
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
    title: 'User-Generated Tours & Custom Travel Paths | Gamana',
    description: 'Create and explore user-generated tours with custom routes and local insights. Share your travel stories, discover unique paths, and explore with Gamana.',
    images: ['/gamana-logo.svg'],
  },
};

export default function UserGeneratedToursPage() {
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
      icon={Share2}
      title="User-Generated Tours"
      subtitle="Create and share your own storylists, or discover unique tours crafted by fellow travelers"
      gradient="from-[#159895] via-[#1A5F7A] to-[#57C5B6]"
      heroImage="/kerala-backwaters-alleppey-houseboat-golden-hour.jpg"
      introTitle="Your Story, Your Way"
      introText={[
        'Gamana empowers you to become a storyteller. Create your own custom tours and storylists, share your unique perspectives, and help other travelers discover hidden gems through your eyes. Whether it is your favorite neighborhood spots, a themed walking tour, or a personal journey, you can craft and publish it for the community.',
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
