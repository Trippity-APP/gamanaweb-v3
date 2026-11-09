/**
 * Generates the brand-kit templates from existing brand sources and writes them to
 * public/brand-templates/. Outputs are committed; run by hand after the logo, tokens, photos or
 * copy change: npm run brand:templates
 *
 * - coins/coins-ic-gamana.svg: vector rebuild of public/coins-ic-gamana.png
 * - social/*.png: the Marketing section's SocialFrame layouts at platform size
 * - qr/*.pdf: print files at exact mm sizes with 3 mm bleed and crop marks
 * - store-listing/*.png: App Store and Play screenshot layouts with a placeholder screen
 * - email/signature.html: the company email signature, inline-styled for mail clients
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { brandScale, colorGroups, PRIMARY_HEX } from "../lib/guidelines/tokens";
import { QR_HEADLINE, QR_MULTILINGUAL_LINE } from "../lib/guidelines/config";
import { emailSignature } from "../lib/guidelines/content";
import { GRADIENT_FROM, GRADIENT_TO, INK, ROOT, WHITE, iconBox, iconD, lockupBox, lockupD, type Box } from "./brand-assets/logo-paths";
import { circle, drawPdf, measure, rect, roundRect, textBlock, textPath, toSvg, transformPath, type Op } from "./brand-assets/draw";
import manifest from "../lib/data/image-manifest.json";

const OUT = join(ROOT, "public/brand-templates");
const PREVIEW = process.env.BRAND_PREVIEW_DIR;

const token = (name: string) => {
  const hex = colorGroups.flatMap((g) => g.swatches).concat(brandScale).find((s) => s.tailwind === name)?.hex;
  if (!hex) throw new Error(`Unknown token ${name}`);
  return hex;
};
const BRAND_950 = token("brand-950");
const INK_SOFT = token("ink-soft");

/** A logo path scaled to `w` wide with its top-left at (x, y), as absolute path data. */
function logo(path: string, box: Box, x: number, y: number, w: number) {
  const s = w / box.w;
  return { d: transformPath(path, [s, 0, 0, s, x - box.x * s, y - box.y * s]), h: box.h * s };
}

const write = (rel: string, data: string | Buffer | Uint8Array) => {
  const file = join(OUT, rel);
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(file, data);
};

async function preview(name: string, svg: string) {
  if (PREVIEW) await sharp(Buffer.from(svg)).png().toFile(join(PREVIEW, `${name}.png`));
}

/* ------------------------------------------------------------------ coin */

/** Ring colours sampled from coins-ic-gamana.png (top and bottom of each band); asset-only, not UI tokens. */
const COIN = {
  rim: ["#FECD3D", "#E7A324"],
  band: ["#FAEE5D", "#EDC22E"],
  ring: ["#FE9923", "#FEA832"],
  face: ["#EFC838", "#F1B62E"],
} as const;

function coinSvg() {
  const size = 249;
  const c = size / 2;
  const grad = (id: string, [a, b]: readonly [string, string]) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const iconH = 140;
  const iconW = (iconBox.w / iconBox.h) * iconH;
  const icon = logo(iconD, iconBox, c - iconW / 2, 58, iconW);
  const sx = 178, sy = 53, sr = 21, k = sr * 0.16;
  const sparkle = `M${sx} ${sy - sr}Q${sx + k} ${sy - k} ${sx + sr} ${sy}Q${sx + k} ${sy + k} ${sx} ${sy + sr}Q${sx - k} ${sy + k} ${sx - sr} ${sy}Q${sx - k} ${sy - k} ${sx} ${sy - sr}Z`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Gamana Coins">
<title>Gamana Coins</title>
<defs>${grad("rim", COIN.rim)}${grad("band", COIN.band)}${grad("ring", COIN.ring)}${grad("face", COIN.face)}</defs>
<path fill="url(#rim)" d="${circle(c, c, c)}"/>
<path fill="url(#band)" d="${circle(c, c, 114)}"/>
<path fill="url(#ring)" d="${circle(c, c, 95)}"/>
<path fill="url(#face)" d="${circle(c, c, 87)}"/>
<path fill="${WHITE}" d="${icon.d}"/>
<path fill="${WHITE}" d="${sparkle}"/>
</svg>
`;
}

/* ---------------------------------------------------------------- social */

type PhotoKey = keyof typeof manifest;
const photoFile = (key: PhotoKey) => {
  const hero = (manifest[key] as { hero: { srcSet: { src: string; width: number }[] } }).hero;
  const best = [...hero.srcSet].sort((a, b) => b.width - a.width)[0];
  return join(ROOT, "public", best.src);
};

async function photoBase(key: PhotoKey, w: number, h: number) {
  return sharp(photoFile(key)).resize({ width: w, height: h, fit: "cover", position: "attention" }).toBuffer();
}

const TOP_SCRIM = `<linearGradient id="topscrim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity="0.4"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>`;
const SCRIM = `<linearGradient id="scrim" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity="0.8"/><stop offset="0.5" stop-color="${INK}" stop-opacity="0.3"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>`;

const SOCIAL = [
  { file: "instagram-post-1080x1350", w: 1080, h: 1350, photo: "slide-jaipur", headline: "Hear the Pink City's stories", insetX: 0.06, insetY: 0.06 },
  { file: "instagram-story-1080x1920", w: 1080, h: 1920, photo: "hero-storytelling", headline: "The Ganga Aarti, explained", insetX: 0.06, insetY: 0.13 },
  { file: "linkedin-1200x627", w: 1200, h: 627, photo: "hero-ecosystem", headline: "Partner with Gamana", insetX: 0.06, insetY: 0.06 },
] as const;

/**
 * Mirrors SocialFrame (preview ~300px wide). Sizes scale by the short side so wide formats such as
 * LinkedIn keep the same proportions. The guides file is a transparent overlay without the photo.
 */
function socialOverlay(t: (typeof SOCIAL)[number], guides: boolean) {
  const k = Math.min(t.w, t.h * 1.25) / 300;
  const sx = t.w * t.insetX, sy = t.h * t.insetY;
  const sw = t.w - 2 * sx, sh = t.h - 2 * sy;
  const ops: Op[] = guides
    ? []
    : [
        { d: rect(0, 0, t.w, t.h), fill: "url(#scrim)" },
        { d: rect(0, 0, t.w, t.h * 0.25), fill: "url(#topscrim)" },
      ];
  const fg = guides ? PRIMARY_HEX : WHITE;
  if (guides) ops.push({ d: rect(sx, sy, sw, sh), stroke: PRIMARY_HEX, strokeWidth: k, dash: [4 * k, 3 * k] });
  ops.push({ d: logo(lockupD, lockupBox, sx, sy, 80 * k).d, fill: fg });

  const pillText = "Get the app";
  const pillSize = 12 * k, pillH = 24 * k, pillW = measure(pillText, "body600", pillSize) + 24 * k;
  const pillTop = sy + sh - pillH;
  const pill = roundRect(sx, pillTop, pillW, pillH, pillH / 2);
  ops.push(guides ? { d: pill, stroke: PRIMARY_HEX, strokeWidth: k } : { d: pill, fill: WHITE });
  ops.push({ d: textPath(pillText, "body600", pillSize, sx + 12 * k, pillTop + pillH / 2 + pillSize * 0.36).d, fill: guides ? PRIMARY_HEX : INK });

  const headSize = 18 * k;
  const probe = textBlock(t.headline, "display800", headSize, { x: sx, top: 0, maxWidth: sw, lineHeight: 1.25, fill: fg });
  ops.push(...textBlock(t.headline, "display800", headSize, { x: sx, top: pillTop - 8 * k - probe.height, maxWidth: sw, lineHeight: 1.25, fill: fg }).ops);
  return toSvg(ops, t.w, t.h, { defs: SCRIM + TOP_SCRIM });
}

async function buildSocial() {
  for (const t of SOCIAL) {
    const base = await photoBase(t.photo, t.w, t.h);
    const png = await sharp(base).composite([{ input: Buffer.from(socialOverlay(t, false)) }]).png({ compressionLevel: 9 }).toBuffer();
    write(`social/${t.file}.png`, png);
    write(`social/${t.file}-guides.png`, await sharp(Buffer.from(socialOverlay(t, true))).png({ compressionLevel: 9 }).toBuffer());
  }
}

/* ---------------------------------------------------------- store listing */

const CAPTIONS = ["Stories start as you arrive", "Works offline", "7 languages"];
const STORE_SIZES = [
  { id: "app-store", w: 1290, h: 2796 },
  { id: "play", w: 1080, h: 1920 },
] as const;
const SCREEN_GRAD = `<linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GRADIENT_FROM}"/><stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient>`;

/** Phone frame (ink bezel, as in the on-page preview) with a branded placeholder screen. */
function device(x: number, y: number, w: number, label?: string): Op[] {
  const h = w * (19 / 9);
  const bezel = w * 0.05;
  const rad = w * 0.175;
  const inW = w - 2 * bezel, inH = h - 2 * bezel;
  const ops: Op[] = [
    { d: roundRect(x, y, w, h, rad), fill: INK },
    { d: roundRect(x + bezel, y + bezel, inW, inH, rad - bezel), fill: "url(#screen)" },
  ];
  const iconW = inW * 0.3;
  const mark = logo(iconD, iconBox, x + w / 2 - iconW / 2, y + h * 0.36, iconW);
  ops.push({ d: mark.d, fill: WHITE });
  const tSize = inW * 0.075;
  ops.push(...textBlock("Your screenshot here", "display700", tSize, { x: x + w / 2, top: y + h * 0.36 + mark.h + tSize, maxWidth: inW * 0.8, lineHeight: 1.25, fill: WHITE, align: "center" }).ops);
  if (label) ops.push({ d: textPath(label, "body500", inW * 0.045, x + w / 2, y + h * 0.36 + mark.h + tSize * 4.2, "center").d, fill: WHITE, opacity: 0.8 });
  return ops;
}

const screenLabel = (w: number) => `Screen area ${Math.round(w * 0.9)} × ${Math.round(w * (19 / 9) - w * 0.1)} px`;

async function buildStore() {
  for (const size of STORE_SIZES) {
    const { w, h } = size;
    const u = w / 100;
    for (let i = 0; i < 3; i++) {
      const caption = CAPTIONS[i];
      const ops: Op[] = [];
      let base: Buffer | null = null;
      if (i === 0) {
        ops.push({ d: rect(0, 0, w, h), fill: BRAND_950 });
        const cap = textBlock(caption, "display800", 7.5 * u, { x: w / 2, top: h * 0.08, maxWidth: 84 * u, lineHeight: 1.15, fill: WHITE, align: "center" });
        ops.push(...cap.ops);
        const top = h * 0.08 + cap.height + 6 * u;
        const dw = Math.min(84 * u, (h * 0.95 - top) / (19 / 9));
        ops.push(...device(w / 2 - dw / 2, top, dw, screenLabel(dw)));
      } else if (i === 1) {
        ops.push({ d: rect(0, 0, w, h), fill: BRAND_950 });
        const dw = 54 * u;
        const dh = dw * (19 / 9);
        ops.push(...device(6 * u, (h - dh) / 2, dw, screenLabel(dw)));
        const capW = 32 * u;
        const probe = textBlock(caption, "display800", 7 * u, { x: 0, top: 0, maxWidth: capW, lineHeight: 1.15, fill: WHITE });
        ops.push(...textBlock(caption, "display800", 7 * u, { x: 64 * u, top: (h - probe.height) / 2, maxWidth: capW, lineHeight: 1.15, fill: WHITE }).ops);
      } else {
        base = await photoBase("slide-jaipur", w, h);
        ops.push({ d: rect(0, 0, w, h), fill: "url(#scrim)" });
        const cap = textBlock(caption, "display800", 7.5 * u, { x: 0, top: 0, maxWidth: 84 * u, lineHeight: 1.15, fill: WHITE });
        const dw = Math.min(84 * u, (h * 0.93 - cap.height - 6 * u - h * 0.06) / (19 / 9));
        ops.push(...device(w / 2 - dw / 2, h * 0.06, dw, screenLabel(dw)));
        ops.push(...textBlock(caption, "display800", 7.5 * u, { x: w / 2, top: h * 0.93 - cap.height, maxWidth: 84 * u, lineHeight: 1.15, fill: WHITE, align: "center" }).ops);
      }
      const svg = toSvg(ops, w, h, { defs: SCRIM + SCREEN_GRAD });
      const img = base ? sharp(base).composite([{ input: Buffer.from(svg) }]) : sharp(Buffer.from(svg));
      write(`store-listing/${size.id}-${w}x${h}-layout-${i + 1}.png`, await img.png({ compressionLevel: 9 }).toBuffer());
    }
  }
  // Small screen-only placeholder used by the guidelines page preview.
  const sw = 300, sh = Math.round(300 * (19 / 9));
  const screenOps: Op[] = [{ d: rect(0, 0, sw, sh), fill: "url(#screen)" }];
  const mark = logo(iconD, iconBox, sw / 2 - 45, sh * 0.36, 90);
  screenOps.push({ d: mark.d, fill: WHITE });
  screenOps.push(...textBlock("Your screenshot here", "display700", 22, { x: sw / 2, top: sh * 0.36 + mark.h + 22, maxWidth: 240, lineHeight: 1.25, fill: WHITE, align: "center" }).ops);
  write("store-listing/placeholder-screen.png", await sharp(Buffer.from(toSvg(screenOps, sw, sh, { defs: SCREEN_GRAD }))).png().toBuffer());
}

/* -------------------------------------------------------------------- QR */

/** Dark modules of public/badges/download-qr.svg as [x, y, width] runs (module units). */
function qrRuns() {
  const svg = readFileSync(join(ROOT, "public/badges/download-qr.svg"), "utf8");
  const size = Number(/viewBox="0 0 (\d+)/.exec(svg)![1]);
  const d = /<path[^>]*stroke="[^"]+"[^>]*\sd="([^"]+)"/.exec(svg)?.[1] ?? /<path[^>]*\sd="([^"]+)"[^>]*stroke=/.exec(svg)![1];
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g)!;
  const runs: [number, number, number][] = [];
  let x = 0, y = 0, i = 0, cmd = "";
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === "M") { x = Number(tokens[i++]); y = Number(tokens[i++]); }
    else if (cmd === "m") { x += Number(tokens[i++]); y += Number(tokens[i++]); }
    else if (cmd === "h") { const n = Number(tokens[i++]); runs.push([x, Math.floor(y), n]); x += n; }
    else throw new Error(`Unexpected QR command ${cmd}`);
  }
  return { size, runs };
}
const QR = qrRuns();

/** QR at `side` mm (dark area) with its top-left at (x, y); returns ops plus the 4-module quiet zone box. */
function qr(x: number, y: number, side: number): { ops: Op[]; quiet: number } {
  const m = side / QR.size;
  const d = QR.runs.map(([rx, ry, n]) => rect(x + rx * m, y + ry * m, n * m, m)).join("");
  return { ops: [{ d, fill: INK }], quiet: 4 * m };
}

const BLEED = 3;
const SLUG = 10;
const MM = 72 / 25.4;

/** Crop marks in the slug, 3 mm off the trim, 5 mm long. */
function cropMarks(o: number, tw: number, th: number): Op[] {
  const len = 5, gap = BLEED;
  const lines: string[] = [];
  for (const [cx, sxDir] of [[o, -1], [o + tw, 1]] as const)
    for (const [cy, syDir] of [[o, -1], [o + th, 1]] as const) {
      lines.push(`M${cx + sxDir * gap} ${cy}L${cx + sxDir * (gap + len)} ${cy}`);
      lines.push(`M${cx} ${cy + syDir * gap}L${cx} ${cy + syDir * (gap + len)}`);
    }
  return [{ d: lines.join(""), stroke: "#000000", strokeWidth: 0.25 / MM }];
}

/** Hindi and Spanish halves of QR_MULTILINGUAL_LINE, set on two lines in their own scripts. */
const [HINDI, SPANISH] = QR_MULTILINGUAL_LINE.split(" · ");

type PrintSpec = { file: string; title: string; tw: number; th: number; draw: (o: number) => Op[]; folds?: number[] };

function qrCopy(x: number, top: number, maxWidth: number, head: number, small: number, align: "left" | "center") {
  const ops: Op[] = [];
  const h = textBlock(QR_HEADLINE, "display800", head, { x, top, maxWidth, lineHeight: 1.15, fill: INK, align });
  ops.push(...h.ops);
  let y = top + h.height + small * 0.8;
  const hi = textBlock(HINDI, "deva500", small, { x, top: y, maxWidth, lineHeight: 1.5, fill: INK_SOFT, align });
  ops.push(...hi.ops);
  y += hi.height;
  const es = textBlock(SPANISH, "body500", small, { x, top: y, maxWidth, lineHeight: 1.4, fill: INK_SOFT, align });
  ops.push(...es.ops);
  return { ops, bottom: y + es.height };
}

/** One A6 landscape face of the table tent, in face coordinates (fold edge at y = 0). */
function tentFace(): Op[] {
  const fw = 148, fh = 105;
  const ops: Op[] = [{ d: rect(-BLEED, fh - 7, fw + 2 * BLEED, 7 + BLEED), fill: PRIMARY_HEX }];
  const side = 40;
  const code = qr(12, (fh - 7 - side) / 2, side);
  ops.push(...code.ops);
  const colX = 12 + side + code.quiet + 8;
  const colW = fw - colX - 10;
  const mark = logo(lockupD, lockupBox, colX, 20, 44);
  ops.push({ d: mark.d, fill: INK });
  ops.push(...qrCopy(colX, 20 + mark.h + 7, colW, 5.6, 3.2, "left").ops);
  return ops;
}

const moveOps = (ops: Op[], m: [number, number, number, number, number, number]) => ops.map((op) => ({ ...op, d: transformPath(op.d, m) }));

const PRINT: PrintSpec[] = [
  {
    file: "table-tent-a6",
    title: "Gamana QR table tent (A6 folded, A5 flat)",
    tw: 148,
    th: 210,
    folds: [105],
    draw: (o) => [
      ...moveOps(tentFace(), [-1, 0, 0, -1, o + 148, o + 105]),
      ...moveOps(tentFace(), [1, 0, 0, 1, o, o + 105]),
    ],
  },
  {
    file: "key-card-sleeve",
    title: "Gamana QR key-card sleeve (85.6 × 54 mm)",
    tw: 85.6,
    th: 54,
    draw: (o) => {
      const ops: Op[] = [{ d: rect(o - BLEED, o + 51, 85.6 + 2 * BLEED, 3 + BLEED), fill: PRIMARY_HEX }];
      const side = 28;
      const code = qr(o + 7, o + (51 - side) / 2, side);
      ops.push(...code.ops);
      const colX = o + 7 + side + code.quiet + 3;
      const colW = o + 85.6 - 5 - colX;
      const mark = logo(lockupD, lockupBox, colX, o + 10, 28);
      ops.push({ d: mark.d, fill: INK });
      ops.push(...qrCopy(colX, o + 10 + mark.h + 4, colW, 3.6, 1.9, "left").ops);
      return ops;
    },
  },
  {
    file: "entrance-sign-a3",
    title: "Gamana QR entrance sign (A3 portrait)",
    tw: 297,
    th: 420,
    draw: (o) => {
      const ops: Op[] = [{ d: rect(o - BLEED, o + 400, 297 + 2 * BLEED, 20 + BLEED), fill: PRIMARY_HEX }];
      const markH = (lockupBox.h / lockupBox.w) * 140;
      const headH = 20 * 1.15;
      const stackH = markH + 22 + headH + 16 + 150 + 5 + 8 + 9 * 1.5 + 9 * 1.4;
      const markTop = o + (400 - stackH) / 2;
      const mark = logo(lockupD, lockupBox, o + (297 - 140) / 2, markTop, 140);
      ops.push({ d: mark.d, fill: INK });
      const copyTop = markTop + mark.h + 22;
      const head = textBlock(QR_HEADLINE, "display800", 20, { x: o + 148.5, top: copyTop, maxWidth: 250, lineHeight: 1.15, fill: INK, align: "center" });
      ops.push(...head.ops);
      const side = 150;
      const code = qr(o + (297 - side) / 2, copyTop + head.height + 16, side);
      ops.push(...code.ops);
      let y = copyTop + head.height + 16 + side + code.quiet + 8;
      const hi = textBlock(HINDI, "deva500", 9, { x: o + 148.5, top: y, maxWidth: 260, lineHeight: 1.5, fill: INK_SOFT, align: "center" });
      ops.push(...hi.ops);
      y += hi.height;
      ops.push(...textBlock(SPANISH, "body500", 9, { x: o + 148.5, top: y, maxWidth: 260, lineHeight: 1.4, fill: INK_SOFT, align: "center" }).ops);
      return ops;
    },
  },
];

async function buildPrint() {
  const o = BLEED + SLUG;
  for (const spec of PRINT) {
    const mw = spec.tw + 2 * o, mh = spec.th + 2 * o;
    const ops: Op[] = [{ d: rect(o - BLEED, o - BLEED, spec.tw + 2 * BLEED, spec.th + 2 * BLEED), fill: WHITE }, ...spec.draw(o), ...cropMarks(o, spec.tw, spec.th)];
    for (const fy of spec.folds ?? []) {
      ops.push({ d: `M${o - BLEED - 8} ${o + fy}L${o - BLEED - 2} ${o + fy}M${o + spec.tw + BLEED + 2} ${o + fy}L${o + spec.tw + BLEED + 8} ${o + fy}`, stroke: "#000000", strokeWidth: 0.25 / MM, dash: [1, 1] });
    }

    const pdf = await PDFDocument.create();
    pdf.setTitle(spec.title);
    pdf.setAuthor("Gamana");
    pdf.setCreator("scripts/build-brand-templates.ts");
    pdf.setProducer("Gamana brand kit");
    pdf.setCreationDate(new Date("2026-01-01T00:00:00Z"));
    pdf.setModificationDate(new Date("2026-01-01T00:00:00Z"));
    const page = pdf.addPage([mw * MM, mh * MM]);
    page.setBleedBox((o - BLEED) * MM, (o - BLEED) * MM, (spec.tw + 2 * BLEED) * MM, (spec.th + 2 * BLEED) * MM);
    page.setTrimBox(o * MM, o * MM, spec.tw * MM, spec.th * MM);
    drawPdf(page, ops);
    write(`qr/${spec.file}.pdf`, await pdf.save({ useObjectStreams: false }));
    await preview(`qr-${spec.file}`, toSvg([{ d: rect(0, 0, mw, mh), fill: "#d9d9d9" }, ...ops], mw, mh, { pixelWidth: 1400 }));
  }
}

/* ----------------------------------------------------------------- email */

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Mail clients ignore stylesheets and web fonts, so this is a table with inline styles and Arial. */
function signatureHtml() {
  const sig = emailSignature;
  const brand900 = token("brand-900");
  const brand700 = token("brand-700");
  const muted = token("ink-muted");
  const row = (style: string, content: string) => `    <tr>\n      <td style="${style}">${content}</td>\n    </tr>`;
  const link = (href: string, text: string, style: string) => `<a href="${href}" target="_blank" style="${style}">${esc(text)}</a>`;
  const rows = [
    row(`padding-bottom:6px; font-size:14px; color:${INK}`, `<b>${esc(sig.signOff)}</b>`),
    row(`font-size:18px; color:${brand900}; font-weight:bold`, esc(sig.name)),
    row(`font-size:13px; color:${INK}; font-style:italic; padding-bottom:8px`, esc(sig.role)),
    row(
      "padding-bottom:8px",
      `<a href="${sig.website.href}" target="_blank"><img src="${sig.logo.src}" alt="Gamana" width="${sig.logo.width}" style="display:block; border:0; outline:none"></a>`,
    ),
    row("font-size:15px; padding-bottom:6px", link(sig.website.href, sig.website.label, `color:${INK}; text-decoration:none; font-weight:bold`)),
    row(`font-size:12px; color:${INK}; padding-bottom:10px`, esc(sig.company)),
    ...sig.lines.map((line, i) =>
      row(
        `font-size:13px; color:${INK}${i === sig.lines.length - 1 ? "; padding-bottom:12px" : ""}`,
        `<span style="color:${brand700}">${esc(line.label)}</span> ${line.href ? link(line.href, line.value, `color:${INK}; text-decoration:none`) : esc(line.value)}`,
      ),
    ),
    row(`font-size:10px; color:${muted}; font-style:italic; line-height:1.4`, esc(sig.disclaimer)),
  ];
  return `<!-- Gamana email signature. Replace FULL NAME, Role and the mobile number, then paste into your mail client. -->
<table border="0" cellpadding="0" cellspacing="0" style="font-family:Arial, Helvetica, sans-serif; line-height:1.45">
  <tbody>
${rows.join("\n")}
  </tbody>
</table>
`;
}

async function main() {
  write("coins/coins-ic-gamana.svg", coinSvg());
  await preview("coin", coinSvg().replace('width="249" height="249"', 'width="498" height="498"'));
  await buildSocial();
  await buildStore();
  await buildPrint();
  write("email/signature.html", signatureHtml());
  console.log("brand templates: coin SVG, 6 social PNGs, 7 store PNGs, 3 QR PDFs, email signature in public/brand-templates/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
