#!/usr/bin/env node
/**
 * Asserts the on-page SEO values from "On-Page SEO Elements _ Gamana Website 2026"
 * (title, description, OG/Twitter, canonical, single h1, JSON-LD types) are present
 * in the rendered HTML.
 *
 * Default: reads the static export in out/ (runs after `next build`).
 * Local: SEO_BASE_URL=http://localhost:3000 node scripts/verify-site-seo.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "out");
const BASE_URL = process.env.SEO_BASE_URL?.replace(/\/$/, "");
const SITE = "https://www.gamana.app";

const PAGES = [
  {
    path: "/",
    canonical: SITE,
    title: "Travel Guide App with Immersive Audio Guides | Gamana",
    description:
      "Gamana is your personal travel guide app for immersive audio guides and self-guided tours across 50+ cities, with 700+ stories in 7 languages.",
    h1: "Experience Engaging Storytelling with a Travel Guide App",
    jsonLd: ["Organization", "WebSite", "MobileApplication", "FAQPage"],
  },
  {
    path: "/features/exquisite-storytelling/",
    title: "Immersive Audio Storytelling for Travel | Gamana",
    description:
      "Experience immersive audio storytelling with researched history, local legends, and cultural stories that bring landmarks and destinations to life.",
    h1: "Immersive Audio Storytelling That Brings Places to Life",
    jsonLd: ["Organization"],
  },
  {
    path: "/features/truly-immersive/",
    title: "Hands-Free GPS Audio Tours for Walking | Gamana",
    description:
      "Explore hands-free with GPS-triggered audio tours that play automatically as you walk, so you can stay present and enjoy your surroundings.",
    h1: "Hands-Free Audio Tours for More Immersive Exploration",
    jsonLd: ["Organization"],
  },
  {
    path: "/features/virtual-travel-guides/",
    title: "Virtual Travel Guides for Personalized Tours | Gamana",
    description:
      "Choose a virtual travel guide with a distinct voice and personality. Explore with knowledgeable narration shaped by history, culture, and local context.",
    h1: "Your Personal Virtual Travel Guide for Every Journey",
    jsonLd: ["Organization"],
  },
  {
    path: "/features/gamana-coins/",
    title: "Travel Rewards with Gamana Coins | Gamana",
    description:
      "Earn Gamana Coins through tours, reviews, and milestones, then redeem them for premium tours, discounts, upgrades, and exclusive experiences.",
    h1: "Earn Travel Rewards as You Explore",
    jsonLd: ["Organization"],
  },
  {
    path: "/features/user-generated-tours/",
    title: "User-Generated Travel Tours & Storylists | Gamana",
    description:
      "Create custom travel tours and storylists, share local knowledge, and discover unique experiences created by travelers in the Gamana community.",
    h1: "Create and Discover Unique Travel Tours",
    jsonLd: ["Organization"],
  },
  {
    path: "/features/local-languages/",
    title: "Multilingual Audio Tours in Local Languages | Gamana",
    description:
      "Explore with multilingual audio tours, native-speaker narration, cultural context, and language options that help you connect with each destination.",
    h1: "Explore Destinations Through Local Languages",
    jsonLd: ["Organization"],
  },
  {
    path: "/marketplace/",
    title: "Audio Tours & Walking Experiences | Gamana",
    description:
      "Browse audio tours and walking experiences from Gamana, with engaging stories for exploring cities, landmarks, and destinations at your own pace.",
    h1: "Audio Tours and Walking Experiences",
  },
  {
    path: "/blog/",
    title: "Travel Blog for Tips, Destinations and Stories | Gamana",
    description:
      "Explore the Gamana travel blog for destination ideas, practical travel tips, local experiences and inspiring stories to help you plan and enjoy your next journey.",
    h1: "Travel Blog for Tips, Destinations and Stories",
  },
  {
    path: "/ecosystem/",
    title: "Travel Partnerships for Tourism Businesses | Gamana",
    description:
      "Build travel partnerships with Gamana to reach travellers, showcase tourism experiences, and grow your business through digital travel discovery.",
    h1: "Build Travel Partnerships with Gamana",
    jsonLd: ["Organization"],
  },
  {
    path: "/cities/",
    title: "Travel Destinations & Cities to Explore | Gamana",
    description:
      "Explore travel destinations and cities around the world with Gamana. Discover city stories, local experiences, landmarks, and audio tours as you explore.",
    h1: "Travel Destinations Made for Curious Travelers",
  },
  // Pages without a workbook sheet: structure only (canonical, h1, JSON-LD, share image).
  { path: "/about/", h1: "About Gamana: stories that walk with you" },
  { path: "/features/", h1: "Premium Audio Tour Features", jsonLd: ["BreadcrumbList"] },
  { path: "/features/on-demand-personalization/", h1: "On-Demand Personalization", jsonLd: ["Organization", "BreadcrumbList"] },
  { path: "/features/discounts-offers/", h1: "Discounts & Offers", jsonLd: ["Organization", "BreadcrumbList"] },
  { path: "/pricing/", h1: "Pay once. Hear the city as you walk.", jsonLd: ["OfferCatalog", "FAQPage", "BreadcrumbList"] },
  { path: "/contact/", h1: "Get in Touch", jsonLd: ["BreadcrumbList"] },
  { path: "/faq/", h1: "Frequently Asked Questions", jsonLd: ["FAQPage", "BreadcrumbList"] },
  { path: "/download-app/", h1: "Every Street Has a Story. Let Gamana Tell It.", jsonLd: ["FAQPage"] },
  { path: "/start-your-journey/", h1: "Let's shape your Gamana journey" },
  { path: "/privacy-policy/", h1: "Privacy Policy" },
  { path: "/terms-of-service/", h1: "Terms of Service" },
  { path: "/cookie-policy/", h1: "Cookie Policy" },
];

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) out[m[1].toLowerCase()] = decode(m[2]);
  return out;
}

function parse(html) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const meta = (key, value) => metas.find((m) => m[key] === value)?.content;
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    decode(m[1].replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim()
  );
  const jsonLdTypes = [];
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      for (const item of Array.isArray(data) ? data : [data]) if (item?.["@type"]) jsonLdTypes.push(item["@type"]);
    } catch {
      jsonLdTypes.push("(invalid JSON-LD)");
    }
  }
  return {
    title: decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim(),
    description: meta("name", "description"),
    canonical: links.find((l) => l.rel === "canonical")?.href,
    ogTitle: meta("property", "og:title"),
    ogDescription: meta("property", "og:description"),
    twitterTitle: meta("name", "twitter:title"),
    twitterDescription: meta("name", "twitter:description"),
    ogImage: meta("property", "og:image"),
    twitterImage: meta("name", "twitter:image"),
    h1s,
    jsonLdTypes,
  };
}

async function load(pagePath) {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}${pagePath}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }
  const file = path.join(OUT, pagePath, "index.html");
  if (!fs.existsSync(file)) throw new Error(`missing ${path.relative(process.cwd(), file)}`);
  return fs.readFileSync(file, "utf8");
}

async function main() {
  const failures = [];
  for (const page of PAGES) {
    let html;
    try {
      html = await load(page.path);
    } catch (error) {
      failures.push(`${page.path}: ${error.message}`);
      continue;
    }
    const got = parse(html);
    const expect = (label, actual, wanted) => {
      if (actual !== wanted) failures.push(`${page.path} ${label}: expected "${wanted}", got "${actual ?? "(none)"}"`);
    };
    if (page.title) {
      expect("title", got.title, page.title);
      expect("og:title", got.ogTitle, page.title);
      expect("twitter:title", got.twitterTitle, page.title);
    }
    if (page.description) {
      expect("description", got.description, page.description);
      expect("og:description", got.ogDescription, page.description);
      expect("twitter:description", got.twitterDescription, page.description);
    }
    // Social platforms can't render SVG previews.
    for (const [label, url] of [["og:image", got.ogImage], ["twitter:image", got.twitterImage]]) {
      if (!url) failures.push(`${page.path}: missing ${label}`);
      else if (!/\.(jpe?g|png|webp)(\?|$)/i.test(url)) failures.push(`${page.path}: ${label} must be a raster image, got "${url}"`);
    }
    // Next normalises the root canonical to a trailing slash; for the bare origin both forms are the same URL.
    const canonical = page.path === "/" && got.canonical === `${SITE}/` ? SITE : got.canonical;
    expect("canonical", canonical, page.canonical ?? `${SITE}${page.path}`);
    if (got.h1s.length !== 1) failures.push(`${page.path}: expected 1 h1, found ${got.h1s.length} (${got.h1s.join(" | ")})`);
    else expect("h1", got.h1s[0], page.h1);
    for (const type of page.jsonLd ?? []) {
      if (!got.jsonLdTypes.includes(type)) failures.push(`${page.path}: missing ${type} JSON-LD (found ${got.jsonLdTypes.join(", ") || "none"})`);
    }
    if (got.jsonLdTypes.includes("(invalid JSON-LD)")) failures.push(`${page.path}: invalid JSON-LD block`);
  }

  const served = BASE_URL ? 0 : await verifyServedDetailPages(failures);

  if (failures.length) {
    console.error("verify-site-seo failed:");
    for (const f of failures) console.error(" -", f);
    process.exit(1);
  }
  console.log(`verify-site-seo: ok (${PAGES.length} pages checked, ${served} detail pages served over HTTP)`);
}

/** First pre-rendered id under out/{route}/, skipping the SPA shell. */
function sampleId(route) {
  const dir = path.join(OUT, route);
  if (!fs.existsSync(dir)) return null;
  return (
    fs
      .readdirSync(dir, { withFileTypes: true })
      .find((e) => e.isDirectory() && e.name !== "__spa__" && fs.existsSync(path.join(dir, e.name, "index.html")))?.name ?? null
  );
}

/**
 * serve.json rewrites detail routes to a `__spa__` shell; serve-out.mjs must still serve
 * the pre-rendered page (own title, self canonical, JSON-LD) when one exists.
 */
async function verifyServedDetailPages(failures) {
  const samples = [
    { route: "cities", shellTitle: "City | Gamana", jsonLd: ["BreadcrumbList", "TouristDestination"] },
    { route: "marketplace/story", jsonLd: ["BreadcrumbList"] },
  ]
    .map((s) => ({ ...s, id: sampleId(s.route) }))
    .filter((s) => s.id);
  if (samples.length === 0) return 0;

  const port = 4300 + Math.floor(Math.random() * 500);
  const server = spawn(process.execPath, [path.join(__dirname, "serve-out.mjs")], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 50; i++) {
      try {
        await fetch(`${base}/`);
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    for (const sample of samples) {
      const pagePath = `/${sample.route}/${sample.id}/`;
      const res = await fetch(`${base}${pagePath}`);
      if (!res.ok) {
        failures.push(`${pagePath} (served): HTTP ${res.status}`);
        continue;
      }
      const got = parse(await res.text());
      if (!got.title || got.title === sample.shellTitle || /__spa__/.test(got.canonical ?? "")) {
        failures.push(`${pagePath} (served): got the SPA shell (title "${got.title}", canonical "${got.canonical}")`);
        continue;
      }
      if (got.canonical !== `${SITE}${pagePath}`) failures.push(`${pagePath} (served) canonical: expected "${SITE}${pagePath}", got "${got.canonical ?? "(none)"}"`);
      if (got.h1s.length !== 1) failures.push(`${pagePath} (served): expected 1 h1, found ${got.h1s.length}`);
      for (const type of sample.jsonLd) {
        if (!got.jsonLdTypes.includes(type)) failures.push(`${pagePath} (served): missing ${type} JSON-LD`);
      }
    }
  } finally {
    server.kill();
  }
  return samples.length;
}

main();
