import { Metadata } from "next";
import Footer from "@/components/navigation/footer";
import EcosystemPageContent from "./page-content";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: "Partner with Gamana for Travel Partners",
  description: "Join Gamana's partner network for heritage, creative, festival, and indigenous tourism. Connect with travelers in the $13.25B market growing at 14.57% CAGR.",
  alternates: {
    canonical: 'https://www.gamana.app/ecosystem',
  },
  openGraph: {
    title: "Partner with Gamana & Travel Network | Gamana",
    description: "Join Gamana's partner network for heritage, creative, festival, and indigenous tourism. Connect with travelers in the $13.25B market growing at 14.57% CAGR.",
    url: 'https://www.gamana.app/ecosystem',
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
    title: "Partner with Gamana & Travel Network | Gamana",
    description: "Join Gamana's partner network for heritage, creative, festival, and indigenous tourism. Connect with travelers in the $13.25B market growing at 14.57% CAGR.",
    images: ['/gamana-logo.svg'],
  },
};

export default function EcosystemPage() {
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
      <EcosystemPageContent />
      <Footer />
    </>
  );
}
