#!/usr/bin/env node
/**
 * After `next build` (static export), ensure blog article HTML embeds the
 * correct trailing-slash canonical. Catches SPA-only exports where every
 * /blog/:slug would be rewritten to __spa__ (noindex / wrong meta).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "out", "blog");
const SKIP = new Set(["__spa__", "_next"]);

function main() {
  if (!fs.existsSync(OUT)) {
    console.error("verify-blog-seo: missing out/blog — run next build first");
    process.exit(1);
  }

  const dirs = fs
    .readdirSync(OUT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SKIP.has(d.name) && !d.name.startsWith("."))
    .map((d) => d.name);

  if (dirs.length === 0) {
    console.error(
      "verify-blog-seo: no per-slug folders under out/blog (SPA-only export). " +
        "CMS must be reachable at build time so canonicals land in static HTML."
    );
    process.exit(1);
  }

  let checked = 0;
  const failures = [];

  for (const slug of dirs.slice(0, 15)) {
    const htmlPath = path.join(OUT, slug, "index.html");
    if (!fs.existsSync(htmlPath)) {
      failures.push(`${slug}: missing index.html`);
      continue;
    }
    const html = fs.readFileSync(htmlPath, "utf8");
    const expected = `https://www.gamana.app/blog/${slug}/`;
    const hasCanonical =
      html.includes(`rel="canonical" href="${expected}"`) ||
      html.includes(`rel="canonical" href='${expected}'`);
    if (!hasCanonical) {
      const found = html.match(/rel="canonical"[^>]*>/i)?.[0] || "(none)";
      failures.push(`${slug}: expected ${expected}, found ${found}`);
      continue;
    }
    if (/name="twitter:title" content="Blog \| Gamana"/i.test(html)) {
      failures.push(`${slug}: twitter:title still leaked as Blog | Gamana`);
      continue;
    }
    checked += 1;
  }

  if (failures.length) {
    console.error("verify-blog-seo failed:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }

  console.log(
    `verify-blog-seo: ok (${checked} posts checked, ${dirs.length} total under out/blog)`
  );
}

main();
