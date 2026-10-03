export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.agent.gamana.ai";
export const APP_STORE_URL = "https://apps.apple.com/in/app/gamana-ai/id6748155654";

export type StoreBadgeLabels = Record<"play" | "apple", { alt: string; title: string }>;

/** Badge copy used on pages whose SEO text predates the keyword variants. */
export const HERITAGE_BADGE_LABELS: StoreBadgeLabels = {
  play: {
    alt: "Download Gamana Heritage Travel App with Personalized Audio Tours on Android",
    title: "Get Gamana - Heritage Travel App with Personalized Audio Tours on Android",
  },
  apple: {
    alt: "Download Gamana Heritage Travel App with Personalized Audio Tours on iOS",
    title: "Get Gamana - Heritage Travel App with Personalized Audio Tours on iPhone & iPad",
  },
};

export const featureItems = [
  { name: "Exquisite Storytelling", href: "/features/exquisite-storytelling", description: "History and culture told as gripping audio stories." },
  // { name: "On-Demand Personalization", href: "/features/on-demand-personalization" }, // Hidden from nav; not part of the current 6-feature set, uncomment to restore.
  { name: "Truly Immersive", href: "/features/truly-immersive", description: "GPS-triggered narration that plays as you walk." },
  { name: "Virtual Travel Guides", href: "/features/virtual-travel-guides", description: "Pick a narrator whose voice matches your style." },
  { name: "Gamana Coins", href: "/features/gamana-coins", description: "Earn and spend coins on premium stories." },
  // { name: "Discounts & Offers", href: "/features/discounts-offers" }, // Hidden from nav; not part of the current 6-feature set, uncomment to restore.
  { name: "User-Generated Tours", href: "/features/user-generated-tours", description: "Create and share your own audio tours." },
  { name: "Local Languages", href: "/features/local-languages", description: "Listen in 7 languages, wherever you travel." },
] as const;

// Second header row, in display order. "Destinations" and "Features" are mega menus
// rendered by site-header.tsx around these plain links: Destinations first, Features
// after Audio Stories. The logo is the Home link. Contact, About and FAQ live in the
// footer and the mobile drawer's Company group.
export const categoryNavItems = {
  tours: [
    { name: "Audio Tours", href: "/marketplace/tours" },
    { name: "Audio Stories", href: "/marketplace/story" },
  ],
  more: [
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "For Partners", href: "/ecosystem" },
  ],
} as const;

export const companyNavItems = [
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "For Partners", href: "/ecosystem" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
] as const;

export const footerCompanyLinks = [
  { name: "Cities", href: "/cities" },
  { name: "Explore", href: "/marketplace" },
  { name: "Partner with Gamana", href: "/ecosystem" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQ", href: "/faq" },
] as const;
