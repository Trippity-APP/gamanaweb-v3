/**
 * Which icons the website actually uses, read from source at build time so the guidelines icon
 * section can never drift from the site. Server-only (node:fs); runs during the static export.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type IconUsage = { name: string; glyph: string; files: string[] };

const SCAN_ROOTS = ["app", "components", "lib", "hooks"];
const EXCLUDE = [/^components\/guidelines\//, /^app\/guidelines-v1\//, /^components\/icons\//, /^lib\/guidelines\//];
const TYPE_EXPORTS = new Set(["LucideIcon", "LucideProps", "IconProps", "IconWeight"]);

function sourceFiles(root: string, dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "node_modules" ? [] : sourceFiles(root, full);
    return /\.(tsx?|jsx?|mjs)$/.test(name) ? [full] : [];
  });
}

/** Lucide-style export name → Phosphor glyph name, from components/icons/index.tsx. */
export function iconGlyphs(root = process.cwd()): Map<string, string> {
  const src = readFileSync(join(root, "components/icons/index.tsx"), "utf8");
  return new Map(Array.from(src.matchAll(/export const (\w+) = wrap\(Ph(\w+)/g), (m): [string, string] => [m[1], m[2]]));
}

function namedImports(src: string, module: string): string[] {
  const re = new RegExp(`import\\s*(?:type\\s*)?\\{([^}]+)\\}\\s*from\\s*["']${module.replace(/[/@]/g, "\\$&")}["']`, "g");
  return Array.from(src.matchAll(re)).flatMap((m) =>
    m[1]
      .split(",")
      .map((part: string) => part.trim())
      .filter((part: string) => part && !part.startsWith("type "))
      .map((part: string) => part.split(/\s+as\s+/)[0].trim())
  );
}

export function scanIconUsage(root = process.cwd()) {
  const glyphs = iconGlyphs(root);
  const icons = new Map<string, Set<string>>();
  const marks = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, name: string, file: string) => {
    if (!map.has(name)) map.set(name, new Set());
    map.get(name)!.add(file);
  };

  for (const dir of SCAN_ROOTS) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const file of sourceFiles(root, abs)) {
      const rel = relative(root, file);
      if (EXCLUDE.some((re) => re.test(rel))) continue;
      const src = readFileSync(file, "utf8");
      for (const name of namedImports(src, "@/components/icons")) if (!TYPE_EXPORTS.has(name)) add(icons, name, rel);
      for (const name of namedImports(src, "@/components/icons/brand-marks")) add(marks, name, rel);
      if (/<GamanaCoinIcon\b|icon=\{GamanaCoinIcon\}|:\s*GamanaCoinIcon\b/.test(src)) add(marks, "GamanaCoinIcon", rel);
    }
  }

  const toList = (map: Map<string, Set<string>>): IconUsage[] =>
    Array.from(map.entries())
      .map(([name, files]) => ({ name, glyph: glyphs.get(name) ?? name, files: Array.from(files).sort() }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return { icons: toList(icons), marks: toList(marks), unknown: Array.from(icons.keys()).filter((n) => !glyphs.has(n)) };
}
