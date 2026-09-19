export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.agent.gamana.ai";
export const APP_STORE_URL = "https://apps.apple.com/in/app/gamana-ai/id6748155654";

export const featureItems = [
  { name: "Exquisite Storytelling", href: "/features/exquisite-storytelling" },
  // { name: "On-Demand Personalization", href: "/features/on-demand-personalization" }, // Hidden from nav; not part of the current 6-feature set, uncomment to restore.
  { name: "Truly Immersive", href: "/features/truly-immersive" },
  { name: "Virtual Travel Guides", href: "/features/virtual-travel-guides" },
  { name: "Gamana Coins", href: "/features/gamana-coins" },
  // { name: "Discounts & Offers", href: "/features/discounts-offers" }, // Hidden from nav; not part of the current 6-feature set, uncomment to restore.
  { name: "User-Generated Tours", href: "/features/user-generated-tours" },
  { name: "Local Languages", href: "/features/local-languages" },
] as const;

// Order here is the explicit sitewide nav order: Home, Explore, Blog, Partner with
// Gamana, Cities, Pricing, Contact — Features dropdown is inserted in site-header.tsx.
export const primaryNavItems = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/marketplace" },
  { name: "Blog", href: "/blog" },
  { name: "Partner with Gamana", href: "/ecosystem" },
  { name: "Cities", href: "/cities" },
  { name: "Pricing", href: "/pricing" },
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
