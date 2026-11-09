/**
 * A tiny vector scene shared by the brand template script: every shape is absolute SVG path data,
 * so one scene renders to SVG (rasterised by sharp) and to PDF (pdf-lib) without drift.
 * Text is converted to outlines with fontkit, so no output depends on installed fonts.
 */
import "regenerator-runtime/runtime";
import fontkit from "@pdf-lib/fontkit";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { clip, endPath, popGraphicsState, pushGraphicsState, rectangle, rgb, type PDFPage } from "pdf-lib";

export type Op = {
  d: string;
  fill?: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  dash?: number[];
  /** Horizontal fill gradient between x0 and x1 in scene units (overrides fill). */
  gradient?: { from: string; to: string; x0: number; x1: number };
};

type Matrix = [number, number, number, number, number, number];

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

/** Rewrites path data as absolute M/L/C/Q/Z with an affine transform applied (no arcs). */
export function transformPath(d: string, [a, b, c, dd, e, f]: Matrix): string {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g) ?? [];
  const T = (x: number, y: number) => `${fmt(a * x + c * y + e)} ${fmt(b * x + dd * y + f)}`;
  let i = 0;
  let cmd = "";
  let x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0, qx = 0, qy = 0;
  const out: string[] = [];
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    const up = cmd.toUpperCase();
    switch (up) {
      case "M": x = ox + num(); y = oy + num(); sx = x; sy = y; out.push(`M${T(x, y)}`); cmd = rel ? "l" : "L"; break;
      case "L": x = ox + num(); y = oy + num(); out.push(`L${T(x, y)}`); break;
      case "H": x = ox + num(); out.push(`L${T(x, y)}`); break;
      case "V": y = oy + num(); out.push(`L${T(x, y)}`); break;
      case "C": {
        const x1 = ox + num(), y1 = oy + num(), x2 = ox + num(), y2 = oy + num();
        x = ox + num(); y = oy + num(); cx = x2; cy = y2;
        out.push(`C${T(x1, y1)} ${T(x2, y2)} ${T(x, y)}`);
        break;
      }
      case "S": {
        const x1 = 2 * x - cx, y1 = 2 * y - cy, x2 = ox + num(), y2 = oy + num();
        x = ox + num(); y = oy + num(); cx = x2; cy = y2;
        out.push(`C${T(x1, y1)} ${T(x2, y2)} ${T(x, y)}`);
        break;
      }
      case "Q": {
        qx = ox + num(); qy = oy + num(); x = ox + num(); y = oy + num();
        out.push(`Q${T(qx, qy)} ${T(x, y)}`);
        break;
      }
      case "Z": x = sx; y = sy; out.push("Z"); break;
      default: throw new Error(`Unsupported path command ${cmd}`);
    }
    if (up !== "C" && up !== "S") { cx = x; cy = y; }
  }
  return out.join("");
}

export const rect = (x: number, y: number, w: number, h: number) => `M${fmt(x)} ${fmt(y)}h${fmt(w)}v${fmt(h)}h${fmt(-w)}Z`;

export function roundRect(x: number, y: number, w: number, h: number, rad: number) {
  const k = 0.5523 * rad;
  return transformPath(
    `M${rad} 0H${w - rad}C${w - rad + k} 0 ${w} ${rad - k} ${w} ${rad}V${h - rad}C${w} ${h - rad + k} ${w - rad + k} ${h} ${w - rad} ${h}H${rad}C${rad - k} ${h} 0 ${h - rad + k} 0 ${h - rad}V${rad}C0 ${rad - k} ${rad - k} 0 ${rad} 0Z`,
    [1, 0, 0, 1, x, y],
  );
}

export function circle(cx: number, cy: number, rad: number) {
  return roundRect(cx - rad, cy - rad, rad * 2, rad * 2, rad);
}

const FONT_DIR = join(__dirname, "fonts");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Font = any;
const load = (file: string, axes: Record<string, number>): Font =>
  (fontkit as unknown as { create(b: Buffer): Font }).create(readFileSync(join(FONT_DIR, file))).getVariation(axes);

export const FONTS = {
  display800: load("PlusJakartaSans.ttf", { wght: 800 }),
  display700: load("PlusJakartaSans.ttf", { wght: 700 }),
  body600: load("Inter.ttf", { wght: 600 }),
  body500: load("Inter.ttf", { wght: 500 }),
  deva500: load("NotoSansDevanagari.ttf", { wght: 500 }),
};
export type FontName = keyof typeof FONTS;

export function measure(text: string, font: FontName, size: number) {
  const f = FONTS[font];
  return (f.layout(text).advanceWidth * size) / f.unitsPerEm;
}

/** Outlines for one line of text with its baseline at y. */
export function textPath(text: string, font: FontName, size: number, x: number, y: number, align: "left" | "center" | "right" = "left") {
  const f = FONTS[font];
  const run = f.layout(text);
  const s = size / f.unitsPerEm;
  const width = run.advanceWidth * s;
  const start = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  let pen = 0;
  let d = "";
  run.glyphs.forEach((g: Font, idx: number) => {
    const p = run.positions[idx];
    const gd = g.path.toSVG();
    if (gd) d += transformPath(gd, [s, 0, 0, -s, start + (pen + p.xOffset) * s, y - p.yOffset * s]);
    pen += p.xAdvance;
  });
  return { d, width };
}

export function wrap(text: string, font: FontName, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, font, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Wrapped text block; `top` is the top of the first line box. Returns the ops and block height. */
export function textBlock(
  text: string,
  font: FontName,
  size: number,
  opts: { x: number; top: number; maxWidth: number; lineHeight: number; fill: string; align?: "left" | "center" | "right" },
) {
  const lines = wrap(text, font, size, opts.maxWidth);
  const lh = size * opts.lineHeight;
  const ascent = (FONTS[font].ascent / FONTS[font].unitsPerEm) * size;
  const descent = (-FONTS[font].descent / FONTS[font].unitsPerEm) * size;
  const offset = (lh - (ascent + descent)) / 2 + ascent;
  const ops: Op[] = lines.map((line, i) => ({ d: textPath(line, font, size, opts.x, opts.top + i * lh + offset, opts.align).d, fill: opts.fill }));
  return { ops, height: lines.length * lh, lines };
}

export function toSvg(ops: Op[], width: number, height: number, opts: { defs?: string; pixelWidth?: number } = {}) {
  const pw = opts.pixelWidth ?? width;
  const ph = (pw / width) * height;
  let defs = opts.defs ?? "";
  const body = ops
    .map((o, i) => {
      let fill = o.fill ?? "none";
      if (o.gradient) {
        const g = o.gradient;
        defs += `<linearGradient id="og${i}" gradientUnits="userSpaceOnUse" x1="${fmt(g.x0)}" y1="0" x2="${fmt(g.x1)}" y2="0"><stop offset="0" stop-color="${g.from}"/><stop offset="1" stop-color="${g.to}"/></linearGradient>`;
        fill = `url(#og${i})`;
      }
      const attrs = [
        `d="${o.d}"`,
        `fill="${fill}"`,
        o.opacity !== undefined ? `opacity="${o.opacity}"` : "",
        o.stroke ? `stroke="${o.stroke}" stroke-width="${o.strokeWidth ?? 1}"` : "",
        o.dash ? `stroke-dasharray="${o.dash.join(" ")}"` : "",
      ];
      return `<path ${attrs.filter(Boolean).join(" ")}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(pw)}" height="${fmt(ph)}" viewBox="0 0 ${fmt(width)} ${fmt(height)}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, "0")).join("")}`;
};

const GRADIENT_STRIPS = 60;

/** Draws a scene whose units are millimetres from the top-left of the page. */
export function drawPdf(page: PDFPage, ops: Op[]) {
  const scale = 72 / 25.4;
  for (const o of ops) {
    if (o.gradient) {
      // pdf-lib has no gradient API: clip the path into thin vertical strips, each a solid step.
      const { from, to, x0, x1 } = o.gradient;
      const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
      const step = (hi - lo) / GRADIENT_STRIPS;
      for (let k = 0; k < GRADIENT_STRIPS; k++) {
        const sx = lo + k * step;
        const t = (sx + step / 2 - x0) / (x1 - x0);
        // Each strip overlaps the next so anti-aliased clip edges never show the page through.
        const width = k === GRADIENT_STRIPS - 1 ? step : step * 2;
        page.pushOperators(pushGraphicsState(), rectangle(sx * scale, 0, width * scale, page.getHeight()), clip(), endPath());
        page.drawSvgPath(o.d, { x: 0, y: page.getHeight(), scale, color: hexToRgb(mix(from, to, t)) });
        page.pushOperators(popGraphicsState());
      }
      continue;
    }
    page.drawSvgPath(o.d, {
      x: 0,
      y: page.getHeight(),
      scale,
      color: o.fill ? hexToRgb(o.fill) : undefined,
      opacity: o.opacity,
      borderColor: o.stroke ? hexToRgb(o.stroke) : undefined,
      borderWidth: o.stroke ? (o.strokeWidth ?? 0.1) : undefined,
      borderDashArray: o.dash,
    });
  }
}
