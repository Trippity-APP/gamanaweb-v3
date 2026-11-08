/** Owner-editable switches and placeholders for /guidelines-v1 (spec section 11). */

export const GUIDELINES_VERSION = "v1.0";
export const GUIDELINES_DATE = "2026-11-08";
export const GUIDELINES_STATUS = "Draft for team review";

/** Flip to true once the brand owner signs off the derived dark tokens. */
export const DARK_TOKENS_APPROVED = false;

export const BRAND_OWNER_ROLE = "Head of Product & Growth";
export const BRAND_OWNER_EMAIL = "{{BRAND_OWNER_EMAIL}}";
export const FIGMA_URL = "{{FIGMA_URL}}";
export const APPROVAL_SLA_DAYS = 3;

export const isPlaceholder = (value: string) => /^\{\{.+\}\}$/.test(value);

export const THEME_STORAGE_KEY = "gamana-guidelines-theme";
export const THEME_ATTRIBUTE = "data-gtheme";

export const SECTIONS = [
  { id: "foundation", label: "Brand foundation" },
  { id: "logo", label: "Logo" },
  { id: "color", label: "Color" },
  { id: "typography", label: "Typography" },
  { id: "voice", label: "Voice and tone" },
  { id: "imagery", label: "Imagery" },
  { id: "components", label: "Components" },
  { id: "layout", label: "Layout" },
  { id: "accessibility", label: "Accessibility" },
] as const;
