// Marketing headline figures. Keep in sync with components/cities/CoverageSnapshot.tsx
// so the homepage, Cities page and feature pages never contradict each other.
export const SITE_STATS = [
  { value: "50+", label: "Cities" },
  { value: "700+", label: "Stories" },
  { value: "7", label: "Languages" },
] as const;

export type SiteStat = (typeof SITE_STATS)[number];
