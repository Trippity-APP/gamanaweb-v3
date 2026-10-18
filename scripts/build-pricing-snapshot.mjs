#!/usr/bin/env node
// Writes lib/data/pricing-snapshot.json from GET /iap/packages for /pricing first paint and JSON-LD.
// Never fails the build: on any error the existing snapshot is kept.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "lib/data/pricing-snapshot.json");

function loadEnvFile(name) {
  const file = join(root, name);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const base = (process.env.NEXT_PUBLIC_API_URL || process.env.GAMANA_API_URL || "https://api-beta.gamana.app/api/v1").replace(/\/$/, "");
const KEEP = [
  "product_id",
  "display_name",
  "description",
  "amount",
  "currency",
  "amount_usd",
  "coins",
  "bonus_coins",
  "save_percent",
  "is_popular",
  "is_best_value",
  "tag_text",
  "web_badge",
  "poi_range",
  "tour_range",
  "order",
  "is_active",
  "show_on_web",
];

try {
  const res = await fetch(`${base}/iap/packages`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : body?.data;
  if (!Array.isArray(list)) throw new Error("unexpected response shape");
  const packages = list
    .filter((p) => p && p.is_active !== false && p.show_on_web !== false)
    .map((p) => Object.fromEntries(KEEP.filter((k) => p[k] !== undefined).map((k) => [k, p[k]])));
  if (packages.length === 0) throw new Error("no web packs returned");
  writeFileSync(out, `${JSON.stringify({ source: base, packages }, null, 2)}\n`);
  console.log(`pricing-snapshot: ${packages.length} packs from ${base}`);
} catch (error) {
  console.warn(`pricing-snapshot: kept existing snapshot (${error instanceof Error ? error.message : error})`);
}
