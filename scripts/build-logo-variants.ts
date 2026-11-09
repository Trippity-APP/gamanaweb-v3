/**
 * Derives the missing logo variants from public/gamana-logo.svg (the only vector master) and
 * writes them to public/logo/. Run once after the master changes: npx tsx scripts/build-logo-variants.ts
 *
 * - Icon = the subpaths left of the wordmark; wordmark = the rest.
 * - Colour files use the horizontal gradient measured from public/gamana-logo.png, in the master's
 *   own coordinates, so every piece keeps exactly the colour it has in the full lockup.
 * - App icons are rasterised with sharp (bundled librsvg).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { themes } from "../lib/guidelines/tokens";

const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/logo");
const INK = themes.light.fg;
const WHITE = themes.light.bg;

/** End colours of the full-colour lockup, sampled from gamana-logo.png (left and right 30px averages). */
const GRADIENT_FROM = "#039693";
const GRADIENT_TO = "#00617F";

const master = readFileSync(join(ROOT, "public/gamana-logo.svg"), "utf8");
const d = /<path[^>]*\sd="([^"]+)"/.exec(master)?.[1];
if (!d) throw new Error("No path in gamana-logo.svg");

const subpaths = d.split(/(?=M)/).filter(Boolean);
const startX = (p: string) => Number(/^M\s*([\d.\-]+)/.exec(p)![1]);
const ICON_MAX_X = 340;
const iconD = subpaths.filter((p) => startX(p) < ICON_MAX_X).join("");
const wordD = subpaths.filter((p) => startX(p) >= ICON_MAX_X).join("");

type Box = { x: number; y: number; w: number; h: number };

/** Bounding box of absolute/relative path data; cubic and quadratic curves are sampled. */
function bbox(path: string): Box {
  const tokens = path.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let cmd = "";
  let x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (px: number, py: number) => {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  };
  const num = () => Number(tokens[i++]);
  const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    for (let t = 0; t <= 1; t += 0.05) {
      const m = 1 - t;
      add(m ** 3 * x + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t ** 3 * x3, m ** 3 * y + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t ** 3 * y3);
    }
    cx = x2; cy = y2; x = x3; y = y3;
  };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    switch (cmd.toUpperCase()) {
      case "M": x = ox + num(); y = oy + num(); sx = x; sy = y; add(x, y); cmd = rel ? "l" : "L"; break;
      case "L": x = ox + num(); y = oy + num(); add(x, y); break;
      case "H": x = ox + num(); add(x, y); break;
      case "V": y = oy + num(); add(x, y); break;
      case "C": { const a = [num(), num(), num(), num(), num(), num()]; cubic(ox + a[0], oy + a[1], ox + a[2], oy + a[3], ox + a[4], oy + a[5]); break; }
      case "S": { const a = [num(), num(), num(), num()]; cubic(2 * x - cx, 2 * y - cy, ox + a[0], oy + a[1], ox + a[2], oy + a[3]); break; }
      case "Q": { const a = [num(), num(), num(), num()]; const qx = ox + a[0], qy = oy + a[1]; cubic(x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y), ox + a[2] + (2 / 3) * (qx - ox - a[2]), oy + a[3] + (2 / 3) * (qy - oy - a[3]), ox + a[2], oy + a[3]); break; }
      case "A": { i += 5; x = ox + num(); y = oy + num(); add(x, y); break; }
      case "Z": x = sx; y = sy; break;
      default: throw new Error(`Unsupported path command ${cmd}`);
    }
    if (cmd.toUpperCase() !== "C" && cmd.toUpperCase() !== "S") { cx = x; cy = y; }
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

const full = bbox(d);
const icon = bbox(iconD);
const word = bbox(wordD);
const r = (n: number) => Math.round(n * 100) / 100;

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
