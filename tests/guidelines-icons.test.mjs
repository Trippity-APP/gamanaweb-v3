import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { scanIconUsage } from "@/lib/guidelines/icon-usage";

const root = new URL("..", import.meta.url).pathname;

/** Marks the guidelines icon section knows how to render (MARKS in sections/Imagery.tsx). */
const DOCUMENTED_MARKS = ["AppleMark", "GamanaCoinIcon", "GoogleMark", "TikTokMark", "XMark"];

test("every icon the site imports is a real export, so the guidelines section can render it", () => {
  const { icons, unknown } = scanIconUsage(root);
  assert.ok(icons.length > 50, `expected the scan to find the site's icons, got ${icons.length}`);
  assert.deepEqual(unknown, []);
});

test("every brand mark in use is documented in the guidelines", () => {
  const { marks } = scanIconUsage(root);
  for (const { name } of marks) assert.ok(DOCUMENTED_MARKS.includes(name), `${name} is used but missing from the icons section`);
  const src = readFileSync(join(root, "components/icons/brand-marks.tsx"), "utf8");
  for (const [, name] of src.matchAll(/export (?:function|const) (\w+)/g)) {
    assert.ok(DOCUMENTED_MARKS.includes(name), `${name} is exported from brand-marks but missing from the icons section`);
  }
});

test("site code takes icons only from @/components/icons", () => {
  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?|mjs)$/.test(name)) {
        const rel = relative(root, full);
        if (rel.startsWith("components/icons/")) continue;
        if (/from\s+["'](lucide-react|@phosphor-icons\/react[^"']*|react-icons[^"']*|@heroicons[^"']*)["']/.test(readFileSync(full, "utf8"))) offenders.push(rel);
      }
    }
  };
  ["app", "components", "lib"].forEach((d) => walk(join(root, d)));
  assert.deepEqual(offenders, []);
});
