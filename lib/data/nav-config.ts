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

// Contact intentionally isn't a top-level tab — it's a transactional, task-focused page
// (form + support details), not a browsing destination, so it doesn't need the same
// nav real estate as Cities/Explore/Blog. It's still one click away via the footer
// (footerCompanyLinks below) and reachable from inline CTAs elsewhere on the site.
// Order here is the explicit sitewide nav order: Home, Explore, Blog, Partner with
// Gamana, Cities, [Features dropdown — inserted in site-header.tsx, not part of this
// array]. About lives in the footer only for now.
export const primaryNavItems = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Blog", href: "/blog" },
  { name: "Partner with Gamana", href: "/ecosystem" },
  { name: "Cities", href: "/cities" },
] as const;

export const footerCompanyLinks = [
  { name: "Cities", href: "/cities" },
  { name: "Explore", href: "/explore" },
  { name: "Partner with Gamana", href: "/ecosystem" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Pricing", href: "/pricing" },
  { name: "FAQ", href: "/faq" },
] as const;
