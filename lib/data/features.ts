import type { ComponentType } from "react";
import { BookOpen, Gift, Globe, Headphones, Share2, Sparkles, User } from "@/components/icons";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { getPhoto, type ImageVariant, type PhotoKey } from "@/lib/images";

function featurePhoto(key: PhotoKey) {
  const photo = getPhoto(key, "hero");
  return { image: photo.srcSet[0].src, photo };
}

export type FeatureSlug =
  | "exquisite-storytelling"
  | "truly-immersive"
  | "virtual-travel-guides"
  | "gamana-coins"
  | "user-generated-tours"
  | "local-languages"
  | "on-demand-personalization"
  | "discounts-offers";

export type FeatureEntry = {
  slug: FeatureSlug;
  title: string;
  description: string;
  details: string[];
  /** Card-sized (960w) path of `photo`. */
  image: string;
  /** Hero photo used on the feature page. */
  photo: ImageVariant;
  icon: ComponentType<{ className?: string }>;
  /** Core features appear in the main nav; the rest are secondary. */
  core: boolean;
};

export const FEATURES: FeatureEntry[] = [
  {
    slug: "exquisite-storytelling",
    title: "Exquisite Storytelling",
    description: "History, culture, and the details most guides skip",
    details: [
      "Professionally researched and written narratives",
      "Historical facts blended with local legends",
      "Surprising discoveries and hidden stories",
      "Cultural context that deepens understanding",
    ],
    ...featurePhoto("hero-storytelling"),
    icon: BookOpen,
    core: true,
  },
  {
    slug: "truly-immersive",
    title: "Truly Immersive",
    description: "Hands-free, eyes-up exploration",
    details: [
      "Completely hands-free operation",
      "Eyes-up, device-down exploration",
      "Fully present in the moment",
      "No need to read or check your phone",
    ],
    ...featurePhoto("hero-immersive"),
    icon: Headphones,
    core: true,
  },
  {
    slug: "virtual-travel-guides",
    title: "Virtual Travel Guides",
    description: "Knowledgeable narrator companions",
    details: [
      "Multiple guide personalities to choose from",
      "Expert knowledge across various topics",
      "Natural, conversational narration",
      "Adaptive communication style",
    ],
    ...featurePhoto("hero-virtual-guides"),
    icon: User,
    core: true,
  },
  {
    slug: "gamana-coins",
    title: "Gamana Coins",
    description: "Earn rewards as you explore",
    details: [
      "Earn coins for tours, reviews, and engagement",
      "Securely tracked in your wallet",
      "Redeem for discounts and upgrades",
      "Unlock premium tours",
    ],
    ...featurePhoto("hero-coins"),
    icon: GamanaCoinIcon,
    core: true,
  },
  {
    slug: "user-generated-tours",
    title: "User-Generated Tours",
    description: "Create and share storylists",
    details: [
      "Create custom tours and storylists",
      "Share your local knowledge",
      "Discover community-created content",
      "Curate themed experiences",
    ],
    ...featurePhoto("hero-ugt"),
    icon: Share2,
    core: true,
  },
  {
    slug: "local-languages",
    title: "Local Languages",
    description: "Stories in local languages",
    details: [
      "Native speaker narration",
      "Cultural context in local language",
      "Learn key phrases as you explore",
      "Pronunciation guides included",
    ],
    ...featurePhoto("hero-local-languages"),
    icon: Globe,
    core: true,
  },
  {
    slug: "on-demand-personalization",
    title: "On-Demand Personalization",
    description: "Stories and experiences that adapt to your unique preferences and interests",
    details: [],
    ...featurePhoto("hero-personalization"),
    icon: Sparkles,
    core: false,
  },
  {
    slug: "discounts-offers",
    title: "Discounts & Offers",
    description: "Partner deals for Gamana members that make your travel experiences more affordable and rewarding",
    details: [],
    ...featurePhoto("hero-discounts"),
    icon: Gift,
    core: false,
  },
];

export const featureHref = (slug: FeatureSlug) => `/features/${slug}/`;
