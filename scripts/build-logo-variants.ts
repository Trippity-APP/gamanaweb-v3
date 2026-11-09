/**
 * Derives the missing logo variants from public/gamana-logo.svg (the only vector master) and
 * writes them to public/logo/. Run once after the master changes: npx tsx scripts/build-logo-variants.ts
 *
 * - Icon/wordmark split and path geometry live in scripts/brand-assets/logo-paths.ts.
 * - Colour files use the horizontal gradient measured from public/gamana-logo.png, in the master's
 *   own coordinates, so every piece keeps exactly the colour it has in the full lockup.
 * - App icons are rasterised with sharp (bundled librsvg).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import {
  GRADIENT_FROM,
  GRADIENT_TO,
  INK,
  ROOT,
  WHITE,
  iconBox as icon,
  iconD,
  lockupBox as full,
  lockupD as d,
  r,
  wordBox as word,
  wordD,
  type Box,
} from "./brand-assets/logo-paths";

const OUT = join(ROOT, "public/logo");

const gradientDef = `<defs><linearGradient id="gamana-gradient" gradientUnits="userSpaceOnUse" x1="${r(full.x)}" y1="0" x2="${r(full.x + full.w)}" y2="0"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient></defs>`;
const fillFor = (color: string | "gradient") => (color === "gradient" ? "url(#gamana-gradient)" : color);

function svg(viewBox: Box, body: string, color: string | "gradient", title: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(viewBox.x)} ${r(viewBox.y)} ${r(viewBox.w)} ${r(viewBox.h)}" width="${Math.round(viewBox.w)}" height="${Math.round(viewBox.h)}" role="img" aria-label="${title}">
<title>${title}</title>
${color === "gradient" ? gradientDef + "\n" : ""}${body.replace(/FILL/g, fillFor(color))}
</svg>
`;
}

const iconBody = `<path fill="FILL" d="${iconD}"/>`;
const lockupBody = `<path fill="FILL" d="${d}"/>`;

/** Stacked: icon centred above the wordmark, both at master scale, gap of a quarter icon height. */
const gap = icon.h * 0.25;
const stackW = Math.max(icon.w, word.w);
const iconDx = (stackW - icon.w) / 2 - icon.x;
const iconDy = -icon.y;
const wordDx = (stackW - word.w) / 2 - word.x;
const wordDy = icon.h + gap - word.y;
const stackBody = `<g transform="translate(${r(iconDx)} ${r(iconDy)})"><path fill="FILL" d="${iconD}"/></g><g transform="translate(${r(wordDx)} ${r(wordDy)})"><path fill="FILL" d="${wordD}"/></g>`;
const stackBox: Box = { x: 0, y: 0, w: stackW, h: icon.h + gap + word.h };

const files: [string, string][] = [
  ["gamana-logo-color.svg", svg(full, lockupBody, "gradient", "Gamana")],
  ["gamana-icon.svg", svg(icon, iconBody, "gradient", "Gamana icon")],
  ["gamana-icon-white.svg", svg(icon, iconBody, WHITE, "Gamana icon")],
  ["gamana-icon-black.svg", svg(icon, iconBody, INK, "Gamana icon")],
  ["gamana-logo-stacked.svg", svg(stackBox, stackBody, "gradient", "Gamana")],
  ["gamana-logo-stacked-white.svg", svg(stackBox, stackBody, WHITE, "Gamana")],
  ["gamana-logo-stacked-black.svg", svg(stackBox, stackBody, INK, "Gamana")],
];

/** Square app-icon artwork: white icon on the brand gradient, icon scaled to `scale` of the canvas. */
function appIconSvg(size: number, scale: number, background: boolean) {
  const s = (size * scale) / Math.max(icon.w, icon.h);
  const tx = (size - icon.w * s) / 2 - icon.x * s;
  const ty = (size - icon.h * s) / 2 - icon.y * s;
  const bg = background
    ? `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#bg)"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<path fill="${WHITE}" transform="translate(${r(tx)} ${r(ty)}) scale(${r(s * 1000) / 1000})" d="${iconD}"/></svg>`;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const [name, content] of files) writeFileSync(join(OUT, name), content);

  mkdirSync(join(OUT, "app-icon"), { recursive: true });
  // iOS: full-bleed square, no transparency; the OS applies the mask.
  await sharp(Buffer.from(appIconSvg(1024, 0.6, true))).flatten({ background: GRADIENT_FROM }).png().toFile(join(OUT, "app-icon/ios-1024.png"));
  // Google Play listing icon: full-bleed square.
  await sharp(Buffer.from(appIconSvg(512, 0.6, true))).png().toFile(join(OUT, "app-icon/android-512.png"));
  // Adaptive foreground: 108dp canvas at xxxhdpi (432px), mark inside the central 66dp safe zone.
  await sharp(Buffer.from(appIconSvg(432, 0.5, false))).png().toFile(join(OUT, "app-icon/android-adaptive-foreground.png"));
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient></defs><rect width="432" height="432" fill="url(#bg)"/></svg>`))
    .png()
    .toFile(join(OUT, "app-icon/android-adaptive-background.png"));

  console.log(`logo variants: icon ${r(icon.w)}×${r(icon.h)}, wordmark ${r(word.w)}×${r(word.h)}, ${files.length} SVGs + 4 app icons in public/logo/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
