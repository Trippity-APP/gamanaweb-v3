#!/usr/bin/env node
/**
 * Builds the responsive photo set from lib/data/image-sources.json.
 *
 *   node scripts/process-images.mjs            # only missing outputs
 *   node scripts/process-images.mjs --force    # regenerate everything
 *   node scripts/process-images.mjs hero-faq   # just these keys
 *
 * Unsplash originals are cached in .cache/image-sources/. Fetching a new original
 * needs UNSPLASH_ACCESS_KEY (in .env.local) so the download is registered, as the
 * Unsplash API guidelines require.
 *
 * Writes public/images/<file>-<width>.jpg and lib/data/image-manifest.json.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCES = path.join(ROOT, "lib/data/image-sources.json");
const MANIFEST = path.join(ROOT, "lib/data/image-manifest.json");
const CACHE = path.join(ROOT, ".cache/image-sources");
const PUBLIC_IMAGES = path.join(ROOT, "public/images");

const VARIANTS = {
  hero: { aspect: 16 / 9, widths: [2400, 1600, 960], suffix: "" },
  tile: { aspect: 4 / 5, widths: [1200, 800, 480], suffix: "-tile" },
};
const QUALITY = 78;

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function loadOriginal(entry) {
  if (entry.source === "local") return fs.readFileSync(path.join(ROOT, entry.local));

  const cached = path.join(CACHE, `${entry.photoId}.jpg`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error(`UNSPLASH_ACCESS_KEY is required to download ${entry.key} (${entry.photoId})`);
  const track = await fetch(entry.downloadLocation, { headers: { Authorization: `Client-ID ${key}` } });
  if (!track.ok) throw new Error(`Unsplash download registration failed for ${entry.key}: ${track.status}`);

  const res = await fetch(`${entry.url}?w=3200&fm=jpg&q=92`);
  if (!res.ok) throw new Error(`Download failed for ${entry.key}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(CACHE, { recursive: true });
  fs.writeFileSync(cached, buf);
  return buf;
}

async function buildVariant(entry, original, variantName) {
  const { aspect, widths, suffix } = VARIANTS[variantName];
  const meta = await sharp(original).rotate().metadata();
  const srcW = meta.autoOrient?.width ?? meta.width;
  const srcH = meta.autoOrient?.height ?? meta.height;
  const maxW = Math.min(srcW, Math.round(srcH * aspect));

  const sizes = [...new Set(widths.map((w) => Math.min(w, maxW)))];
  const srcSet = [];
  for (const width of sizes) {
    const height = Math.round(width / aspect);
    const rel = `/images/${entry.file}${suffix}-${width}.jpg`;
    const abs = path.join(ROOT, "public", rel);
    if (force || !fs.existsSync(abs)) {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      await sharp(original)
        .rotate()
        .resize(width, height, { fit: "cover", position: entry.position ?? sharp.strategy.attention })
        .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
        .toFile(abs);
    }
    srcSet.push({ src: rel, width, height });
  }
  srcSet.sort((a, b) => a.width - b.width);
  const largest = srcSet[srcSet.length - 1];
  return { src: largest.src, width: largest.width, height: largest.height, srcSet };
}

loadEnvLocal();
const sources = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

for (const entry of sources) {
  if (only.length && !only.includes(entry.key)) continue;
  const original = await loadOriginal(entry);
  const variants = entry.kind === "both" ? ["hero", "tile"] : [entry.kind];
  const record = { alt: entry.alt, title: entry.title };
  for (const v of variants) record[v] = await buildVariant(entry, original, v);
  manifest[entry.key] = record;
  console.log(`✓ ${entry.key}`, variants.map((v) => `${v}:${record[v].srcSet.map((s) => s.width).join("/")}`).join(" "));
}

const textByKey = new Map(sources.map((s) => [s.key, { alt: s.alt, title: s.title }]));
for (const [key, record] of Object.entries(manifest)) Object.assign(record, textByKey.get(key));

const known = new Set(sources.map((s) => s.key));
for (const key of Object.keys(manifest)) if (!known.has(key)) delete manifest[key];
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");

const total = fs.existsSync(PUBLIC_IMAGES)
  ? fs.readdirSync(PUBLIC_IMAGES, { recursive: true }).filter((f) => f.endsWith(".jpg")).reduce((n, f) => n + fs.statSync(path.join(PUBLIC_IMAGES, f)).size, 0)
  : 0;
console.log(`Manifest: ${Object.keys(sorted).length} images, public/images ${(total / 1024 / 1024).toFixed(1)} MB`);
