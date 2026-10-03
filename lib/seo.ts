import { COMPANY } from "@/lib/data/company";
import type { FaqItem } from "@/components/site/FaqAccordion";

export const SITE_URL = "https://www.gamana.app";

/** Raster share image; social platforms can't render SVG previews. */
export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Gamana travel guide app with immersive audio stories",
};

export const SAME_AS = [
  "https://www.facebook.com/gamanaapp",
  "https://twitter.com/gamanaapp",
  "https://www.instagram.com/gamanaapp",
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gamana",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/gamana-logo.svg`,
      name: "Gamana Logo",
      caption: "Gamana Logo",
    },
    email: COMPANY.email,
    sameAs: SAME_AS,
    parentOrganization: {
      "@type": "Organization",
      name: COMPANY.parent.name,
      legalName: COMPANY.parent.name,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gamana",
    url: `${SITE_URL}/`,
    publisher: { "@type": "Organization", name: "Gamana", url: SITE_URL },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${encodeURI(path)}`);

export type DestinationLd = { name: string; path: string; image?: string; description?: string };

export function touristDestinationJsonLd(d: DestinationLd, withContext = true) {
  return {
    ...(withContext && { "@context": "https://schema.org" }),
    "@type": "TouristDestination",
    name: d.name,
    url: absoluteUrl(d.path),
    ...(d.image && { image: absoluteUrl(d.image) }),
    ...(d.description && { description: d.description }),
  };
}

export function destinationListJsonLd(name: string, items: DestinationLd[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: touristDestinationJsonLd(d, false),
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
