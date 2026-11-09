/**
 * WCAG contrast check for every documented guidelines pair, in both themes, plus a guard that
 * keeps raw hex values out of the guidelines UI and the admin colour out of everything.
 * Run: npm run check:contrast (also part of `npm run build`).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { AA_THRESHOLD, evaluatePairs } from "../lib/guidelines/contrast";

const ROOT = join(__dirname, "..");
const BANNED = "#1A5F7A";

let failed = false;

for (const theme of ["light", "dark"] as const) {
  const rows = evaluatePairs(theme);
  console.log(`\n${theme.toUpperCase()} theme`);
  console.table(
    rows.map((r) => ({
      pair: r.label,
      fg: r.fgValue,
      bg: r.bgValue,
      usage: r.usage,
      ratio: r.ratio.toFixed(2),
      needs: AA_THRESHOLD[r.usage],
      AA: r.aa ? "pass" : "FAIL",
      AAA: r.aaa ? "pass" : "-",
    }))
  );
  for (const r of rows.filter((row) => !row.aa)) {
    failed = true;
    console.error(`✗ ${theme}: ${r.label} is ${r.ratio.toFixed(2)}:1, needs ${AA_THRESHOLD[r.usage]}:1`);
  }
}

function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

const uiFiles = [...files(join(ROOT, "components/guidelines")), ...files(join(ROOT, "app/guidelines-v1"))];
for (const file of [...uiFiles, ...files(join(ROOT, "lib/guidelines"))]) {
  if (readFileSync(file, "utf8").toUpperCase().includes(BANNED)) {
    failed = true;
    console.error(`✗ ${file.replace(ROOT + "/", "")} contains ${BANNED}`);
  }
}
for (const file of uiFiles) {
  const hex = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/.exec(readFileSync(file, "utf8"));
  if (hex) {
    failed = true;
    console.error(`✗ ${file.replace(ROOT + "/", "")} has a raw colour ${hex[0]}; use a guidelines token`);
  }
}

if (failed) {
  console.error("\nGuidelines contrast check failed.");
  process.exit(1);
}
console.log("\n✓ All guideline colour pairs pass WCAG AA in both themes.");
