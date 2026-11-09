/**
 * Logo geometry shared by the brand asset scripts, read from public/gamana-logo.svg (the only
 * vector master). Icon = the subpaths left of the wordmark; wordmark = the rest.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { themes } from "../../lib/guidelines/tokens";

export const ROOT = join(__dirname, "../..");
export const INK = themes.light.fg;
export const WHITE = themes.light.bg;

/** End colours of the full-colour lockup, sampled from gamana-logo.png (left and right 30px averages). */
export const GRADIENT_FROM = "#039693";
export const GRADIENT_TO = "#00617F";

const master = readFileSync(join(ROOT, "public/gamana-logo.svg"), "utf8");
const masterD = /<path[^>]*\sd="([^"]+)"/.exec(master)?.[1];
if (!masterD) throw new Error("No path in gamana-logo.svg");

const subpaths = masterD.split(/(?=M)/).filter(Boolean);
const startX = (p: string) => Number(/^M\s*([\d.\-]+)/.exec(p)![1]);
const ICON_MAX_X = 340;

export const lockupD = masterD;
export const iconD = subpaths.filter((p) => startX(p) < ICON_MAX_X).join("");
export const wordD = subpaths.filter((p) => startX(p) >= ICON_MAX_X).join("");

export type Box = { x: number; y: number; w: number; h: number };

/** Bounding box of absolute/relative path data; cubic and quadratic curves are sampled. */
export function bbox(path: string): Box {
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

export const lockupBox = bbox(lockupD);
export const iconBox = bbox(iconD);
export const wordBox = bbox(wordD);

export const r = (n: number) => Math.round(n * 100) / 100;

/** A path placed so its box fills `w` wide at (x, y); height follows the aspect ratio. */
export function placed(path: string, box: Box, x: number, y: number, w: number, fill: string) {
  const s = w / box.w;
  return `<path fill="${fill}" transform="translate(${r(x - box.x * s)} ${r(y - box.y * s)}) scale(${Math.round(s * 10000) / 10000})" d="${path}"/>`;
}
