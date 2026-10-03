import { Metadata } from "next";
import Footer from "@/components/navigation/footer";
import EcosystemPageContent from "./page-content";
import { JsonLd } from '@/components/site/JsonLd';
import { OG_IMAGE, organizationJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: { absolute: "Travel Partnerships for Tourism Businesses | Gamana" },
  description: "Build travel partnerships with Gamana to reach travellers, showcase tourism experiences, and grow your business through digital travel discovery.",
  alternates: {
    canonical: 'https://www.gamana.app/ecosystem/',
  },
  openGraph: {
    title: "Travel Partnerships for Tourism Businesses | Gamana",
    description: "Build travel partnerships with Gamana to reach travellers, showcase tourism experiences, and grow your business through digital travel discovery.",
    url: 'https://www.gamana.app/ecosystem/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Travel Partnerships for Tourism Businesses | Gamana",
    description: "Build travel partnerships with Gamana to reach travellers, showcase tourism experiences, and grow your business through digital travel discovery.",
    images: [OG_IMAGE.url],
  },
};

export default function EcosystemPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <EcosystemPageContent />
      <Footer />
    </>
  );
}
