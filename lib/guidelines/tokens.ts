/**
 * Single typed source for the brand guidelines page, the contrast check and the brand kit.
 * Values are audited from tailwind.config.ts, app/globals.css and app/layout.tsx;
 * tests/guidelines-tokens.test.mjs fails if any `tailwind` value drifts from the config.
 */

export type Swatch = {
  name: string;
  hex: string;
  /** Tailwind colour path, e.g. `brand-600`. */
  tailwind: string;
  /** `config` = defined in tailwind.config.ts; `default` = Tailwind's built-in palette, used by the site. */
  source: "config" | "default";
  usage?: string;
};

export type SwatchGroup = { id: string; title: string; intent: string; swatches: Swatch[] };

const c = (name: string, hex: string, tailwind: string, usage?: string, source: Swatch["source"] = "config"): Swatch => ({
  name,
  hex,
  tailwind,
  source,
  usage,
});

export const PRIMARY_HEX = "#159895";

/** Brand scale. Step 800 is intentionally not documented (see the guidelines PR). */
export const brandScale: Swatch[] = [
  c("Brand 50", "#F0FBFA", "brand-50", "Tinted section backgrounds, info surfaces"),
  c("Brand 100", "#D7F3EF", "brand-100", "Chips, selected rows"),
  c("Brand 200", "#AEE6DF", "brand-200", "Hairlines on tinted surfaces"),
  c("Brand 300", "#7DD4CA", "brand-300", "Decorative accents"),
  c("Brand 400", "#57C5B6", "brand-400", "Dark-surface primary"),
  c("Brand 500", "#26AFA4", "brand-500", "Focus ring, gradient start"),
  c("Brand 600", PRIMARY_HEX, "brand-600", "Primary: fills, icons, large text"),
  c("Brand 700", "#0F7C78", "brand-700", "Primary text, links, solid buttons"),
  c("Brand 900", "#164E63", "brand-900", "Deep headers"),
  c("Brand 950", "#0B3A4A", "brand-950", "Darkest teal surfaces"),
];

export const colorGroups: SwatchGroup[] = [
  {
    id: "brand",
    title: "Brand",
    intent: "Teal carries the brand. Use 600 for fills and 700 whenever teal is small text.",
    swatches: brandScale,
  },
  {
    id: "neutrals",
    title: "Neutrals and ink",
    intent: "Ink for text, sand for warm surfaces. Most of every screen is neutral.",
    swatches: [
      c("Ink", "#0F1B24", "ink", "Headings and body text"),
      c("Ink soft", "#3B4A55", "ink-soft", "Secondary text"),
      c("Ink muted", "#5F6E7A", "ink-muted", "Captions, metadata"),
      c("Sand 50", "#FBF8F3", "sand-50", "Alternate section background"),
      c("Sand 100", "#F5EFE6", "sand-100", "Warm cards, placeholders"),
      c("Sand 200", "#EADFCF", "sand-200", "Warm borders"),
      c("Sand 700", "#7C5420", "sand-700", "Text on sand"),
    ],
  },
  {
    id: "accents",
    title: "Accents",
    intent: "Sunset, forest, lilac and mint add warmth and categorisation. Use sparingly.",
    swatches: [
      c("Sunset 100", "#FFEBD6", "sunset-100", "Promo surfaces"),
      c("Sunset 300", "#FFC35C", "sunset-300", "Highlights, stars"),
      c("Sunset 400", "#F4A100", "sunset-400", "Gradient end, badges"),
      c("Sunset 500", "#E85D04", "sunset-500", "Urgent accents"),
      c("Sunset 600", "#B84A03", "sunset-600", "Accent text"),
      c("Sunset 700", "#7A1F1F", "sunset-700", "Deep accent text"),
      c("Forest", "#0B6E4F", "forest", "Nature and outdoor contexts"),
      c("Lilac 100", "#EEE7FF", "lilac-100", "Icon tile background"),
      c("Lilac 700", "#5B3FA8", "lilac-700", "Icon tile glyph"),
      c("Mint 100", "#DDF4E6", "mint-100", "Icon tile background"),
      c("Mint 700", "#1D6B44", "mint-700", "Icon tile glyph"),
    ],
  },
  {
    id: "semantic",
    title: "Semantic",
    intent: "Status colours from the site's forms and banners. Always pair with an icon or text.",
    swatches: [
      c("Success", "#047857", "emerald-700", "Confirmations", "default"),
      c("Success surface", "#ECFDF5", "emerald-50", "Success banners", "default"),
      c("Warning", "#B84A03", "sunset-600", "Cautions"),
      c("Warning surface", "#FFEBD6", "sunset-100", "Warning banners"),
      c("Error", "#B91C1C", "red-700", "Form errors", "default"),
      c("Error surface", "#FEF2F2", "red-50", "Error banners", "default"),
      c("Info", "#0F7C78", "brand-700", "Neutral notices"),
      c("Info surface", "#F0FBFA", "brand-50", "Info banners"),
    ],
  },
];

/** Gradients that exist on the website. The primary pill gradient ends on brand-800, so it is not documented here. */
export const gradients = [
  {
    name: "Promo glow",
    tailwind: "bg-gradient-to-r from-brand-500 to-sunset-400",
    css: "linear-gradient(to right, #26AFA4, #F4A100)",
    usage: "Promo highlights and decorative bars. Never behind body text.",
  },
  {
    name: "Photo scrim",
    tailwind: "bg-gradient-to-t from-ink/80 via-ink/30 to-transparent",
    css: "linear-gradient(to top, rgba(15, 27, 36, 0.8), rgba(15, 27, 36, 0.3), transparent)",
    usage: "Under any text placed on photography.",
  },
];

/** Guidance only, from how the site's pages are composed. */
export const usageRatio = [
  { label: "Neutrals (white, sand, ink)", percent: 70, token: "neutral" },
  { label: "Brand teal", percent: 20, token: "primary" },
  { label: "Accents (sunset, mint, lilac)", percent: 10, token: "accent" },
] as const;

/** Semantic theme tokens. Emitted as `--g-<key>` CSS variables. */
export type ThemeKey =
  | "bg"
  | "surface"
  | "card"
  | "elevated"
  | "border"
  | "borderStrong"
  | "fg"
  | "fgMuted"
  | "fgSubtle"
  | "primary"
  | "primaryText"
  | "primaryStrong"
  | "onPrimary"
  | "ring"
  | "success"
  | "successBg"
  | "warning"
  | "warningBg"
  | "error"
  | "errorBg"
  | "info"
  | "infoBg"
  | "accent";

export type ThemeTokens = Record<ThemeKey, string>;

export const themeTokenMeta: Record<ThemeKey, { label: string; group: "Surfaces" | "Text" | "Brand" | "Semantic" }> = {
  bg: { label: "Background", group: "Surfaces" },
  surface: { label: "Surface (alternate)", group: "Surfaces" },
  card: { label: "Card", group: "Surfaces" },
  elevated: { label: "Elevated", group: "Surfaces" },
  border: { label: "Border", group: "Surfaces" },
  borderStrong: { label: "Border strong", group: "Surfaces" },
  fg: { label: "Foreground", group: "Text" },
  fgMuted: { label: "Foreground muted", group: "Text" },
  fgSubtle: { label: "Foreground subtle", group: "Text" },
  primary: { label: "Primary", group: "Brand" },
  primaryText: { label: "Primary text", group: "Brand" },
  primaryStrong: { label: "Primary strong (button fill)", group: "Brand" },
  onPrimary: { label: "On primary", group: "Brand" },
  ring: { label: "Focus ring", group: "Brand" },
  accent: { label: "Accent", group: "Brand" },
  success: { label: "Success", group: "Semantic" },
  successBg: { label: "Success surface", group: "Semantic" },
  warning: { label: "Warning", group: "Semantic" },
  warningBg: { label: "Warning surface", group: "Semantic" },
  error: { label: "Error", group: "Semantic" },
  errorBg: { label: "Error surface", group: "Semantic" },
  info: { label: "Info", group: "Semantic" },
  infoBg: { label: "Info surface", group: "Semantic" },
};

export const lightTheme: ThemeTokens = {
  bg: "#FFFFFF",
  surface: "#FBF8F3",
  card: "#FFFFFF",
  elevated: "#FFFFFF",
  border: "rgba(15, 27, 36, 0.1)",
  borderStrong: "#5F6E7A",
  fg: "#0F1B24",
  fgMuted: "#3B4A55",
  fgSubtle: "#5F6E7A",
  primary: PRIMARY_HEX,
  primaryText: "#0F7C78",
  primaryStrong: "#0F7C78",
  onPrimary: "#FFFFFF",
  ring: PRIMARY_HEX,
  accent: "#F4A100",
  success: "#047857",
  successBg: "#ECFDF5",
  warning: "#B84A03",
  warningBg: "#FFEBD6",
  error: "#B91C1C",
  errorBg: "#FEF2F2",
  info: "#0F7C78",
  infoBg: "#F0FBFA",
};

/**
 * Derived dark theme (spec section 3.2). The product has no dark mode yet, so these are
 * proposals: near-black surfaces with a teal bias, brand-400 as primary, translucent borders,
 * low-alpha semantic tints. Shown with a "Proposed" badge until DARK_TOKENS_APPROVED is true.
 */
export const darkTheme: ThemeTokens = {
  bg: "#0C1719",
  surface: "#101D20",
  card: "#152528",
  elevated: "#1C3034",
  border: "rgba(255, 255, 255, 0.12)",
  borderStrong: "#8A9EA1",
  fg: "#E8F0EF",
  fgMuted: "#B4C3C4",
  fgSubtle: "#8FA3A5",
  primary: "#57C5B6",
  primaryText: "#57C5B6",
  primaryStrong: "#57C5B6",
  onPrimary: "#0F1B24",
  ring: "#7DD4CA",
  accent: "#FFC35C",
  success: "#34D399",
  successBg: "rgba(52, 211, 153, 0.14)",
  warning: "#FFC35C",
  warningBg: "rgba(255, 195, 92, 0.14)",
  error: "#F87171",
  errorBg: "rgba(248, 113, 113, 0.14)",
  info: "#7DD4CA",
  infoBg: "rgba(125, 212, 202, 0.14)",
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
export type ThemeName = keyof typeof themes;

export type PairUsage = "text" | "large" | "ui";

/** Every documented foreground/background pair; checked in both themes by scripts/check-contrast.ts. */
export const contrastPairs: { fg: ThemeKey; bg: ThemeKey; usage: PairUsage; label: string }[] = [
  { fg: "fg", bg: "bg", usage: "text", label: "Body text on background" },
  { fg: "fg", bg: "surface", usage: "text", label: "Body text on alternate surface" },
  { fg: "fg", bg: "elevated", usage: "text", label: "Body text on elevated surface" },
  { fg: "fgMuted", bg: "bg", usage: "text", label: "Muted text on background" },
  { fg: "fgMuted", bg: "card", usage: "text", label: "Muted text on card" },
  { fg: "fgSubtle", bg: "bg", usage: "text", label: "Captions on background" },
  { fg: "fgSubtle", bg: "surface", usage: "text", label: "Captions on alternate surface" },
  { fg: "primaryText", bg: "bg", usage: "text", label: "Links and primary text" },
  { fg: "primaryText", bg: "surface", usage: "text", label: "Links on alternate surface" },
  { fg: "onPrimary", bg: "primaryStrong", usage: "text", label: "Button label on primary fill" },
  { fg: "onPrimary", bg: "primary", usage: "large", label: "Large text on brand 600" },
  { fg: "primary", bg: "bg", usage: "ui", label: "Primary icons and controls" },
  { fg: "ring", bg: "bg", usage: "ui", label: "Focus ring on background" },
  { fg: "borderStrong", bg: "bg", usage: "ui", label: "Input borders" },
  { fg: "success", bg: "successBg", usage: "text", label: "Success message" },
  { fg: "warning", bg: "warningBg", usage: "text", label: "Warning message" },
  { fg: "error", bg: "errorBg", usage: "text", label: "Error message" },
  { fg: "error", bg: "bg", usage: "text", label: "Inline field error" },
  { fg: "info", bg: "infoBg", usage: "text", label: "Info message" },
];

export const fonts = [
  {
    id: "display",
    name: "Plus Jakarta Sans",
    role: "Display: headings, stats, buttons in heroes",
    cssVar: "--font-display",
    tailwind: "font-display",
    stack: "var(--font-display), var(--font-sans), system-ui, sans-serif",
    weights: "Variable (Next font, all weights); headings use 700 and 800",
  },
  {
    id: "sans",
    name: "Inter",
    role: "Body: paragraphs, UI labels, forms",
    cssVar: "--font-sans",
    tailwind: "default (set on <body>)",
    stack: "Inter, Inter Fallback (next/font)",
    weights: "Variable (Next font, all weights); body uses 400, 500 and 600",
  },
  {
    id: "script",
    name: "Caveat",
    role: "Script accent: short signature flourishes only",
    cssVar: "--font-caveat",
    tailwind: "font-script",
    stack: "var(--font-caveat), cursive",
    weights: "600, 700",
  },
] as const;

export type TypeStyle = {
  name: string;
  sample: string;
  className: string;
  size: string;
  lineHeight: string;
  weight: string;
  tracking: string;
};

export const typeScale: TypeStyle[] = [
  {
    name: "H1 hero",
    sample: "Just you, the city and a story",
    className: "text-display",
    size: "36px → 68px (clamp)",
    lineHeight: "1.05",
    weight: "800",
    tracking: "tight (-0.025em)",
  },
  {
    name: "H2 section",
    sample: "Explore by city",
    className: "text-h2",
    size: "30px → 52px (clamp)",
    lineHeight: "1.1",
    weight: "800",
    tracking: "tight (-0.025em)",
  },
  {
    name: "H3 card, narrator name",
    sample: "Bella, your Lisbon storyteller",
    className: "text-h3",
    size: "20px → 24px (clamp)",
    lineHeight: "1.25",
    weight: "700",
    tracking: "tight (-0.025em)",
  },
  {
    name: "Lead",
    sample: "Stories triggered by place, in your ears, hands-free.",
    className: "text-lead",
    size: "17px → 21px (clamp)",
    lineHeight: "1.6",
    weight: "400",
    tracking: "normal",
  },
  {
    name: "Body",
    sample: "Walk at your own pace. The story starts when you arrive.",
    className: "text-base",
    size: "16px",
    lineHeight: "24px",
    weight: "400",
    tracking: "normal",
  },
  {
    name: "Caption",
    sample: "12 stories · 2 h 10 min",
    className: "text-sm",
    size: "14px",
    lineHeight: "20px",
    weight: "400–500",
    tracking: "normal",
  },
  {
    name: "Button",
    sample: "Get the app",
    className: "text-base font-semibold",
    size: "16px",
    lineHeight: "24px",
    weight: "600",
    tracking: "normal",
  },
  {
    name: "Eyebrow",
    sample: "Audio travel guide",
    className: "eyebrow",
    size: "12px",
    lineHeight: "16px",
    weight: "600",
    tracking: "0.18em, uppercase",
  },
  {
    name: "Stat number",
    sample: "700+",
    className: "font-display text-4xl font-extrabold tabular-nums",
    size: "36px",
    lineHeight: "40px",
    weight: "800",
    tracking: "tight",
  },
];

export const shadows = [
  {
    name: "Card",
    tailwind: "shadow-card",
    value: "0 1px 2px rgba(15, 27, 36, 0.04), 0 4px 16px -4px rgba(15, 27, 36, 0.08)",
  },
  {
    name: "Lift",
    tailwind: "shadow-lift",
    value: "0 2px 4px rgba(15, 27, 36, 0.04), 0 18px 40px -12px rgba(21, 152, 149, 0.28)",
  },
  { name: "Glow", tailwind: "shadow-glow", value: "0 0 0 4px rgba(21, 152, 149, 0.15)" },
];

export const radii = [
  { name: "Small", tailwind: "rounded-md", value: "6px", usage: "Inputs, small controls" },
  { name: "Large", tailwind: "rounded-lg", value: "8px (var(--radius))", usage: "shadcn defaults" },
  { name: "XL", tailwind: "rounded-xl", value: "12px", usage: "Icon tiles, compact cards" },
  { name: "2XL", tailwind: "rounded-2xl", value: "16px", usage: "Media, inner panels" },
  { name: "3XL", tailwind: "rounded-3xl", value: "24px", usage: "Cards, sections" },
  { name: "4XL", tailwind: "rounded-4xl", value: "32px", usage: "Hero panels" },
  { name: "Pill", tailwind: "rounded-full", value: "9999px", usage: "CTAs, chips, avatars" },
];

export const easings = [
  { name: "Out expo", tailwind: "ease-out-expo", value: "cubic-bezier(0.16, 1, 0.3, 1)", usage: "Reveals, page motion" },
  { name: "Spring", tailwind: "ease-spring", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", usage: "Buttons, pop-ins" },
];

export const durations = [
  { name: "Fast", value: "200ms", usage: "Accordions, hover colour" },
  { name: "Base", value: "300ms", usage: "Buttons, cards" },
  { name: "Reveal", value: "700ms", usage: "Scroll reveal" },
];

/** Tailwind default breakpoints (the config does not override them). */
export const breakpoints = [
  { name: "sm", min: 640 },
  { name: "md", min: 768 },
  { name: "lg", min: 1024 },
  { name: "xl", min: 1280 },
  { name: "2xl", min: 1536 },
];

export const container = { className: "container-site", maxWidth: 1280, gutters: "16px / 24px (sm) / 32px (lg)" };

/** Tailwind's default 4px spacing scale, the steps the site uses most. */
export const spacing = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 28].map((step) => ({ step, px: step * 4 }));
