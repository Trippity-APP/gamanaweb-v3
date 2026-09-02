import { Metadata } from "next";
import StorylistRedirectPageClient from "./StorylistRedirectPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const canonicalUrl = `https://shareable.gamana.app/storylist/${id}`;
  
  return {
    title: "Explore Audio Stories on Gamana",
    description: "Location-based audio tours for your phone. Open this link on mobile to begin your journey.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "Discover Local Stories - Gamana App",
      description: "Scan or open this link on mobile to explore audio storylists near you.",
      url: canonicalUrl,
      siteName: "Gamana",
      images: [
        {
          url: "https://shareable.gamana.app/ai-travel-guide-app.jpg",
          width: 1200,
          height: 630,
          alt: "Gamana Audio Stories",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore Audio Stories on Gamana",
      description: "Location-based audio tours for your phone. Scan to begin.",
      images: ["https://shareable.gamana.app/ai-travel-guide-app.jpg"],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <StorylistRedirectPageClient id={id} />;
}

export async function generateStaticParams() {
  return [{ id: "[id]" }];
}
