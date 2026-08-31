#!/usr/bin/env node
/**
 * One-time migration: upload all posts from content/blog/articles.ts to the admin CMS.
 *
 * Usage:
 *   CMS_USER=you@email.com CMS_PASSWORD=secret npm run upload:blogs
 *   CMS_USER=... CMS_PASSWORD=... npm run upload:blogs -- --dry-run
 *   CMS_USER=... CMS_PASSWORD=... npm run upload:blogs -- --limit 1
 *   CMS_USER=... CMS_PASSWORD=... npm run upload:blogs -- --slug my-post-slug
 *   CMS_USER=... CMS_PASSWORD=... npm run upload:blogs -- --force
 *
 * Environment:
 *   CMS_API_URL   Base API URL (default: http://localhost:8000/api/v1)
 *   CMS_USER      Admin email or username
 *   CMS_PASSWORD  Admin password
 *
 * Flags:
 *   --dry-run     Convert and print payloads without calling the API
 *   --limit N     Upload only the first N posts (after filtering)
 *   --slug SLUG   Upload a single post by slug
 *   --force       Upload even if slug already exists in CMS
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { articles } from "../content/blog/articles.ts";
import {
  blocksToHtml,
  collectImagePaths,
  truncateExcerpt,
} from "./lib/blocks-to-html.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

const CMS_API_URL =
  process.env.CMS_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

/** @type {{ dryRun: boolean; limit: number | null; slug: string | null; force: boolean }} */
const options = {
  dryRun: false,
  limit: null,
  slug: null,
  force: false,
};

for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg === "--dry-run") {
    options.dryRun = true;
  } else if (arg === "--force") {
    options.force = true;
  } else if (arg === "--limit") {
    options.limit = Number(process.argv[++i]);
  } else if (arg === "--slug") {
    options.slug = process.argv[++i];
  }
}

/**
 * @param {string} localPath
 */
function resolvePublicFile(localPath) {
  const relative = localPath.startsWith("/") ? localPath.slice(1) : localPath;
  const fullPath = path.join(PUBLIC_DIR, relative);
  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  // Case-insensitive fallback for inconsistent filenames
  const dir = path.dirname(fullPath);
  const base = path.basename(fullPath);
  if (!fs.existsSync(dir)) return null;
  const match = fs
    .readdirSync(dir)
    .find((name) => name.toLowerCase() === base.toLowerCase());
  return match ? path.join(dir, match) : null;
}

/**
 * @param {string} filePath
 */
function guessMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

/**
 * @param {string} token
 * @param {string} route
 * @param {RequestInit} init
 */
async function apiRequest(token, route, init = {}) {
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${CMS_API_URL}${route}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" && data !== null
        ? data.detail || data.message || JSON.stringify(data)
        : String(data);
    throw new Error(`${init.method || "GET"} ${route} failed (${response.status}): ${detail}`);
  }

  return data;
}

async function login() {
  const user = process.env.CMS_USER;
  const password = process.env.CMS_PASSWORD;
  if (!user || !password) {
    throw new Error("Set CMS_USER and CMS_PASSWORD environment variables.");
  }

  const params = new URLSearchParams({
    user_identifier: user,
    password,
  });

  const response = await fetch(`${CMS_API_URL}/login?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Login failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  const token = payload?.data?.access_token;
  if (!token) {
    throw new Error("Login response missing data.access_token");
  }
  return token;
}

/**
 * @param {string} token
 */
async function fetchExistingSlugs(token) {
  /** @type {Set<string>} */
  const slugs = new Set();
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await apiRequest(
      token,
      `/admin/blogs?page=${page}&page_size=100`
    );
    for (const item of data.items || []) {
      if (item.slug) slugs.add(item.slug);
    }
    hasNext = Boolean(data.has_next);
    page += 1;
  }

  return slugs;
}

/**
 * @param {import('../content/blog/articles.ts').Article} article
 */
function buildCreatePayload(article) {
  const firstHero = article.blocks.find((block) => block.type === "hero");
  const coverAlt =
    firstHero && firstHero.type === "hero"
      ? firstHero.alt
      : article.title;

  return {
    title: article.title,
    slug: article.slug,
    excerpt: truncateExcerpt(article.excerpt),
    author: article.author,
    author_title: article.authorTitle,
    tags: article.tags || [],
    region: article.region ?? null,
    trip_type: article.tripType ?? null,
    featured: Boolean(article.featured),
    cover_image_alt: coverAlt,
    cover_image_title: article.title,
    content_html: blocksToHtml(article.blocks),
    seo_title: article.title,
    seo_description: truncateExcerpt(article.excerpt, 500),
  };
}

/**
 * @param {string} html
 * @param {Map<string, string>} urlMap
 */
function replaceImageUrls(html, urlMap) {
  let next = html;
  for (const [localPath, remoteUrl] of urlMap.entries()) {
    next = next.split(localPath).join(remoteUrl);
    const encoded = encodeURI(localPath);
    if (encoded !== localPath) {
      next = next.split(encoded).join(remoteUrl);
    }
  }
  return next;
}

/**
 * @param {string} token
 * @param {import('../content/blog/articles.ts').Article} article
 */
async function uploadArticle(token, article) {
  const payload = buildCreatePayload(article);
  console.log(`\n→ ${article.slug}`);

  if (options.dryRun) {
    console.log("  [dry-run] title:", payload.title);
    console.log("  [dry-run] images:", collectImagePaths(article).length);
    console.log("  [dry-run] html length:", payload.content_html.length);
    console.log("  [dry-run] date:", article.date);
    return { skipped: false, dryRun: true };
  }

  const created = await apiRequest(token, "/admin/blogs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const postId = created.post?.id;
  if (!postId) {
    throw new Error(`Create succeeded but no post id for ${article.slug}`);
  }

  /** @type {Map<string, string>} */
  const urlMap = new Map();
  const imagePaths = collectImagePaths(article);

  if (article.coverImage) {
    const coverFile = resolvePublicFile(article.coverImage);
    if (coverFile) {
      const formData = new FormData();
      const buffer = fs.readFileSync(coverFile);
      const blob = new Blob([buffer], { type: guessMimeType(coverFile) });
      formData.append("file", blob, path.basename(coverFile));

      const coverResult = await apiRequest(
        token,
        `/admin/blogs/${postId}/upload-cover`,
        { method: "POST", body: formData }
      );
      if (coverResult.post?.cover_image_url) {
        urlMap.set(article.coverImage, coverResult.post.cover_image_url);
      }
      console.log("  ✓ cover uploaded");
    } else {
      console.warn(`  ! cover file not found: ${article.coverImage}`);
    }
  }

  for (const localPath of imagePaths) {
    if (urlMap.has(localPath)) continue;

    const filePath = resolvePublicFile(localPath);
    if (!filePath) {
      console.warn(`  ! image not found: ${localPath}`);
      continue;
    }

    const formData = new FormData();
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer], { type: guessMimeType(filePath) });
    formData.append("file", blob, path.basename(filePath));

    const imageResult = await apiRequest(
      token,
      `/admin/blogs/${postId}/upload-image`,
      { method: "POST", body: formData }
    );
    if (imageResult.url) {
      urlMap.set(localPath, imageResult.url);
      console.log(`  ✓ inline image: ${path.basename(filePath)}`);
    }
  }

  const patchedHtml = replaceImageUrls(payload.content_html, urlMap);
  if (patchedHtml !== payload.content_html) {
    await apiRequest(token, `/admin/blogs/${postId}`, {
      method: "PATCH",
      body: JSON.stringify({ content_html: patchedHtml }),
    });
    console.log("  ✓ content_html updated with remote image URLs");
  }

  await apiRequest(token, `/admin/blogs/${postId}/publish`, {
    method: "POST",
  });
  console.log("  ✓ published");

  const publishedAt = `${article.date}T12:00:00.000Z`;
  await apiRequest(token, `/admin/blogs/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ published_at: publishedAt }),
  });
  console.log(`  ✓ published_at set to ${publishedAt}`);

  return { skipped: false, dryRun: false, postId };
}

async function main() {
  let selected = [...articles];
  if (options.slug) {
    selected = selected.filter((article) => article.slug === options.slug);
    if (selected.length === 0) {
      throw new Error(`No article found with slug "${options.slug}"`);
    }
  }
  if (options.limit != null && options.limit > 0) {
    selected = selected.slice(0, options.limit);
  }

  console.log(`CMS API: ${CMS_API_URL}`);
  console.log(`Posts to process: ${selected.length}${options.dryRun ? " (dry-run)" : ""}`);

  let token = "";
  /** @type {Set<string>} */
  let existingSlugs = new Set();

  if (!options.dryRun) {
    token = await login();
    existingSlugs = await fetchExistingSlugs(token);
    console.log(`Existing CMS posts: ${existingSlugs.size}`);
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of selected) {
    if (!options.dryRun && !options.force && existingSlugs.has(article.slug)) {
      console.log(`\n→ ${article.slug}`);
      console.log("  ⊘ skipped (slug already exists)");
      skipped += 1;
      continue;
    }

    try {
      await uploadArticle(token, article);
      uploaded += 1;
    } catch (error) {
      failed += 1;
      console.error(`  ✗ failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log("\nDone.");
  console.log(`  uploaded: ${uploaded}`);
  console.log(`  skipped:  ${skipped}`);
  console.log(`  failed:   ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
