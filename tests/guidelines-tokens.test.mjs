import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { colorGroups, contrastPairs, easings, shadows, themes } from "@/lib/guidelines/tokens";
import { contrastRatio, evaluatePairs } from "@/lib/guidelines/contrast";

const root = new URL("..", import.meta.url).pathname;
const config = readFileSync(join(root, "tailwind.config.ts"), "utf8");

/** Body of `name: { ... }` inside the Tailwind colours object (one level of nesting is enough). */
function block(name) {
  const start = config.search(new RegExp(`\\n\\s*${name}: \\{`));
  assert.ok(start >= 0, `tailwind.config.ts has no "${name}" colour group`);
  const open = config.indexOf("{", start);
  const close = config.indexOf("}", open);
  return config.slice(open + 1, close);
}

function configValue(path) {
  const [group, step] = path.split("-");
  if (!step) {
    const m = new RegExp(`\\n\\s*${group}: '(#[0-9A-Fa-f]{6})'`).exec(config);
    if (m) return m[1];
    return new RegExp(`DEFAULT: '(#[0-9A-Fa-f]{6})'`).exec(block(group))?.[1];
  }
  return new RegExp(`\\b${step}: '(#[0-9A-Fa-f]{6})'`).exec(block(group))?.[1];
}

test("every config-sourced swatch matches tailwind.config.ts", () => {
  for (const group of colorGroups) {
    for (const swatch of group.swatches.filter((s) => s.source === "config")) {
      assert.equal(configValue(swatch.tailwind)?.toUpperCase(), swatch.hex.toUpperCase(), `${swatch.tailwind} drifted`);
    }
  }
});

test("shadows and easings match tailwind.config.ts", () => {
  for (const s of shadows) assert.ok(config.includes(`'${s.value}'`), `${s.tailwind} drifted`);
  for (const e of easings) assert.ok(config.includes(`'${e.value}'`), `${e.tailwind} drifted`);
});

test("brand-800 and the legacy gamana palette stay off the guidelines", () => {
  const all = colorGroups.flatMap((g) => g.swatches);
  assert.ok(!all.some((s) => s.tailwind === "brand-800" || s.tailwind.startsWith("gamana")));
  assert.ok(!JSON.stringify({ colorGroups, themes }).toUpperCase().includes("#1A5F7A"));
});

test("contrast maths matches known WCAG values", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(2), "21.00");
  assert.equal(contrastRatio("#FFFFFF", "#FFFFFF").toFixed(2), "1.00");
  assert.equal(contrastRatio("#767676", "#FFFFFF").toFixed(2), "4.54");
});

test("every documented pair passes AA in both themes", () => {
  for (const theme of ["light", "dark"]) {
    const failing = evaluatePairs(theme).filter((r) => !r.aa);
    assert.deepEqual(failing.map((r) => `${theme}: ${r.label} ${r.ratio.toFixed(2)}`), []);
  }
  assert.ok(contrastPairs.length > 10);
});

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

test("guidelines UI code has no raw hex colours", () => {
  const offenders = [...files(join(root, "components/guidelines")), ...files(join(root, "app/guidelines-v1"))].filter(
    (file) => /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/.test(readFileSync(file, "utf8"))
  );
  assert.deepEqual(offenders, []);
});
