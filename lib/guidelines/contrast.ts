import { contrastPairs, themes, type PairUsage, type ThemeKey, type ThemeName } from "./tokens";

export type Rgba = { r: number; g: number; b: number; a: number };

export function parseColor(value: string): Rgba {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((ch) => ch + ch).join("") : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(v);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: rgb[4] === undefined ? 1 : Number(rgb[4]) };
  }
  throw new Error(`Unsupported colour: ${value}`);
}

/** Composites a translucent colour over an opaque one. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio. Translucent colours are composited over `base` (the theme background). */
export function contrastRatio(fg: string, bg: string, base = "#FFFFFF"): number {
  const baseRgb = parseColor(base);
  const bgRgb = composite(parseColor(bg), baseRgb);
  const fgRgb = composite(parseColor(fg), bgRgb);
  const [hi, lo] = [luminance(fgRgb), luminance(bgRgb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const AA_THRESHOLD: Record<PairUsage, number> = { text: 4.5, large: 3, ui: 3 };
export const AAA_THRESHOLD: Record<PairUsage, number> = { text: 7, large: 4.5, ui: 3 };

export type PairResult = {
  theme: ThemeName;
  label: string;
  fg: ThemeKey;
  bg: ThemeKey;
  fgValue: string;
  bgValue: string;
  usage: PairUsage;
  ratio: number;
  aa: boolean;
  aaa: boolean;
};

export function evaluatePairs(theme: ThemeName): PairResult[] {
  const t = themes[theme];
  return contrastPairs.map(({ fg, bg, usage, label }) => {
    const ratio = contrastRatio(t[fg], t[bg], t.bg);
    return {
      theme,
      label,
      fg,
      bg,
      fgValue: t[fg],
      bgValue: t[bg],
      usage,
      ratio,
      aa: ratio >= AA_THRESHOLD[usage],
      aaa: ratio >= AAA_THRESHOLD[usage],
    };
  });
}

export function toRgbString(hex: string): string {
  const { r, g, b } = parseColor(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

export function toHslString(hex: string): string {
  const { r, g, b } = parseColor(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}
