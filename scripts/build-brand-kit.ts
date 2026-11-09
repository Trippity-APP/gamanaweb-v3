/**
 * Builds public/brand: tokens (JSON, CSS, Tailwind snippet) from lib/guidelines/tokens.ts, copies the
 * brand files the site already ships (including public/logo from build-logo-variants.ts and
 * public/brand-templates from build-brand-templates.ts), writes a manifest for the Downloads section, and zips it all.
 * Run: npm run brand:kit (also part of `npm run build`). Output is generated, not committed.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import JSZip from "jszip";
import { brandKitCss } from "../lib/guidelines/css";
import { GUIDELINES_DATE, GUIDELINES_VERSION } from "../lib/guidelines/config";
import {
  breakpoints,
  colorGroups,
  durations,
  easings,
  fonts,
  radii,
  shadows,
  spacing,
  themes,
  typeScale,
} from "../lib/guidelines/tokens";

const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const BRAND = join(PUBLIC, "brand");
export const KIT_ZIP = "gamana-brand-kit-v1.zip";

const INK = themes.light.fg;
const WHITE = themes.light.bg;

/** Files copied as-is from public/, with their place in the kit. */
const COPIES: [string, string][] = [
  ["gamana-logo.png", "logo/gamana-logo.png"],
  ["logo/gamana-logo-color.svg", "logo/gamana-logo.svg"],
  ["logo/gamana-logo-stacked.svg", "logo/gamana-logo-stacked.svg"],
  ["logo/gamana-logo-stacked-white.svg", "logo/gamana-logo-stacked-white.svg"],
  ["logo/gamana-logo-stacked-black.svg", "logo/gamana-logo-stacked-black.svg"],
  ["logo/gamana-icon.svg", "logo/gamana-icon.svg"],
  ["logo/gamana-icon-white.svg", "logo/gamana-icon-white.svg"],
  ["logo/gamana-icon-black.svg", "logo/gamana-icon-black.svg"],
  ["logo/app-icon/ios-1024.png", "app-icon/ios-1024.png"],
  ["logo/app-icon/android-512.png", "app-icon/android-512.png"],
  ["logo/app-icon/android-adaptive-foreground.png", "app-icon/android-adaptive-foreground.png"],
  ["logo/app-icon/android-adaptive-background.png", "app-icon/android-adaptive-background.png"],
  ["favicon-gamana.png", "app-icon/gamana-app-icon-513.png"],
  ["badges/app-store-badge.svg", "badges/app-store-badge.svg"],
  ["badges/google-play-badge.svg", "badges/google-play-badge.svg"],
  ["badges/download-qr.svg", "qr/download-qr.svg"],
  ["coins-ic-gamana.png", "coins/coins-ic-gamana.png"],
  ["brand-templates/coins/coins-ic-gamana.svg", "coins/coins-ic-gamana.svg"],
  ["logo/app-icon/android-512.png", "templates/store-listing/store-icon-512.png"],
];

/** Committed template folders under public/brand-templates, copied whole into templates/. */
const TEMPLATE_DIRS = ["social", "qr", "store-listing", "email"];

function write(path: string, data: string | Buffer) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, data);
}

/** Mono variants of the vector lockup: every fill replaced with one documented colour. */
function monoLogo(color: string): string {
  const svg = readFileSync(join(PUBLIC, "gamana-logo.svg"), "utf8");
  return svg.replace(/fill:\s*#[0-9a-f]{3,6}/gi, `fill: ${color}`).replace(/fill="#[0-9a-f]{3,6}"/gi, `fill="${color}"`);
}

function dimensions(file: string): { width: number; height: number } | null {
  const buf = readFileSync(file);
  if (extname(file) === ".png" && buf.length > 24) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (extname(file) === ".svg") {
    const text = buf.toString("utf8");
    const w = /<svg[^>]*\swidth="([\d.]+)/.exec(text);
    const h = /<svg[^>]*\sheight="([\d.]+)/.exec(text);
    if (w && h) return { width: Math.round(Number(w[1])), height: Math.round(Number(h[1])) };
    const vb = /viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/.exec(text);
    if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
  }
  return null;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

async function main() {
  rmSync(BRAND, { recursive: true, force: true });

  for (const [from, to] of COPIES) {
    mkdirSync(dirname(join(BRAND, to)), { recursive: true });
    copyFileSync(join(PUBLIC, from), join(BRAND, to));
  }
  for (const dir of TEMPLATE_DIRS) {
    const from = join(PUBLIC, "brand-templates", dir);
    for (const file of walk(from)) {
      const to = join(BRAND, "templates", dir, relative(from, file));
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(file, to);
    }
  }
  write(join(BRAND, "logo/gamana-logo-black.svg"), monoLogo(INK));
  write(join(BRAND, "logo/gamana-logo-white.svg"), monoLogo(WHITE));

  const tokens = {
    name: "Gamana brand tokens",
    version: GUIDELINES_VERSION,
    date: GUIDELINES_DATE,
    palette: Object.fromEntries(colorGroups.map((g) => [g.id, Object.fromEntries(g.swatches.map((s) => [s.tailwind, s.hex]))])),
    themes,
    fonts,
    typeScale,
    radii,
    shadows,
    easings,
    durations,
    breakpoints,
    spacing,
  };
  write(join(BRAND, "tokens/tokens.json"), JSON.stringify(tokens, null, 2) + "\n");
  write(join(BRAND, "tokens/tokens.css"), `/* Gamana brand tokens ${GUIDELINES_VERSION}. Dark values are proposed. */\n${brandKitCss()}\n`);
  const palette = Object.fromEntries(
    colorGroups.flatMap((g) => g.swatches.filter((s) => s.source === "config")).map((s) => [s.tailwind, s.hex])
  );
  write(
    join(BRAND, "tokens/tailwind-tokens.cjs"),
    `// Gamana brand tokens ${GUIDELINES_VERSION}: spread into theme.extend in tailwind.config.\nmodule.exports = ${JSON.stringify(
      {
        colors: palette,
        boxShadow: Object.fromEntries(shadows.map((s) => [s.tailwind.replace("shadow-", ""), s.value])),
        transitionTimingFunction: Object.fromEntries(easings.map((e) => [e.tailwind.replace("ease-", ""), e.value])),
      },
      null,
      2
    )};\n`
  );

  const files = walk(BRAND).filter((f) => !f.endsWith(".zip") && !f.endsWith("manifest.json"));
  const zip = new JSZip();
  const fixedDate = new Date(`${GUIDELINES_DATE}T00:00:00Z`);
  for (const file of files.sort()) zip.file(relative(BRAND, file), readFileSync(file), { date: fixedDate });
  const zipped = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  write(join(BRAND, KIT_ZIP), zipped);

  const manifest = [...files, join(BRAND, KIT_ZIP)].sort().map((file) => ({
    path: `/brand/${relative(BRAND, file)}`,
    name: relative(BRAND, file),
    format: extname(file).slice(1).toUpperCase(),
    bytes: statSync(file).size,
    ...dimensions(file),
  }));
  write(join(BRAND, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  console.log(`brand-kit: ${manifest.length} files, ${KIT_ZIP} ${(zipped.length / 1024).toFixed(0)} KB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
