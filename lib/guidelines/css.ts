import { colorGroups, themes, type ThemeKey, type ThemeTokens } from "./tokens";
import { THEME_ATTRIBUTE } from "./config";

export const cssVarName = (key: ThemeKey) => `--g-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

function declarations(tokens: ThemeTokens): string {
  return (Object.keys(tokens) as ThemeKey[]).map((key) => `${cssVarName(key)}: ${tokens[key]};`).join(" ");
}

/** CSS variables scoped to the guidelines wrapper so they cannot leak into the live site. */
export function guidelinesCss(): string {
  return [
    `[data-guidelines] { ${declarations(themes.light)} color-scheme: light; }`,
    `html[${THEME_ATTRIBUTE}="dark"] [data-guidelines] { ${declarations(themes.dark)} color-scheme: dark; }`,
    // The site's focus-ring uses brand-500 (2.7:1 on white); the guidelines use the AA-passing ring token.
    // Only emitted on /guidelines-v1: the Get App and Feedback rail is a marketing surface.
    `[data-side-rail] { display: none !important; }`,
    `[data-guidelines] .focus-ring:focus-visible { --tw-ring-color: var(--g-ring); --tw-ring-offset-color: var(--g-bg); }`,
  ].join("\n");
}

export const paletteVarName = (tailwind: string) => `--gamana-${tailwind}`;

/** Plain `:root` / `.dark` variables for the downloadable brand kit. */
export function brandKitCss(): string {
  const palette = colorGroups
    .flatMap((g) => g.swatches)
    .map((s) => `${paletteVarName(s.tailwind)}: ${s.hex};`)
    .join(" ");
  return [
    `:root { ${palette} ${declarations(themes.light)} }`,
    `.dark { ${declarations(themes.dark)} }`,
  ].join("\n");
}
