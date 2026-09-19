#!/usr/bin/env node
/**
 * Static host for `out/` that prefers real blog HTML over the SPA shell.
 *
 * For posts published after the last deploy (no out/blog/{slug}/index.html):
 *  1. Fetch the post from the CMS
 *  2. Clone the __spa__ shell and inject title / description / canonical / OG
 *  3. Persist that HTML under out/blog/{slug}/ so later hits are static
 *     (view-source shows the real article URL as canonical)
 *  4. Client JS still hydrates full content from the CMS
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "out");
const PORT = Number(process.env.PORT || 8080);
const SPA_HTML = path.join(OUT, "blog", "__spa__", "index.html");

const require = createRequire(import.meta.url);

async function loadHandler() {
  try {
    return (await import("serve-handler")).default;
  } catch {
    return require("serve-handler");
  }
}

function loadConfig() {
  const candidates = [
    path.join(OUT, "serve.json"),
    path.join(ROOT, "public", "serve.json"),
    path.join(ROOT, "serve.json"),
  ];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  }
  return {
    cleanUrls: true,
    trailingSlash: true,
    directoryListing: false,
  };
}

function getBlogApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BLOG_API_URL ||
    process.env.GAMANA_API_URL ||
    "https://apidev.gamana.app/api/v1"
  ).replace(/\/$/, "");
}

function blogSlugFromPathname(pathname) {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (!match) return null;
  let slug;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    slug = match[1];
  }
  if (!slug || slug === "__spa__") return null;
  return slug;
}

function blogIndexPath(slug) {
  return path.join(OUT, "blog", slug, "index.html");
}

function hasStaticBlogPage(slug) {
  return fs.existsSync(blogIndexPath(slug));
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function upsertMetaByName(html, name, content) {
  const re = new RegExp(
    `<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`,
    "i"
  );
  const tag = `<meta name="${name}" content="${escapeAttr(content)}"/>`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertMetaByProperty(html, property, content) {
  const re = new RegExp(
    `<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`,
    "i"
  );
  const tag = `<meta property="${property}" content="${escapeAttr(content)}"/>`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function upsertCanonical(html, href) {
  const re = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const tag = `<link rel="canonical" href="${escapeAttr(href)}"/>`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function injectBlogMeta(html, post, slug) {
  const titleBase = (post.seo_title || post.title || slug).trim();
  const absoluteTitle = `${titleBase} | Gamana Blog`;
  const description = (post.seo_description || post.excerpt || "").trim();
  const canonical = `https://www.gamana.app/blog/${slug}/`;
  const cover = (post.cover_image_url || "").trim();

  let next = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${escapeAttr(absoluteTitle)}</title>`
  );
  next = upsertMetaByName(next, "description", description);
  next = upsertMetaByName(next, "robots", "index, follow");
  next = upsertCanonical(next, canonical);
  next = upsertMetaByProperty(next, "og:title", titleBase);
  next = upsertMetaByProperty(next, "og:description", description);
  next = upsertMetaByProperty(next, "og:url", canonical);
  next = upsertMetaByProperty(next, "og:type", "article");
  next = upsertMetaByName(next, "twitter:card", "summary_large_image");
  next = upsertMetaByName(next, "twitter:title", titleBase);
  next = upsertMetaByName(next, "twitter:description", description);
  if (cover) {
    next = upsertMetaByProperty(next, "og:image", cover);
    next = upsertMetaByName(next, "twitter:image", cover);
  }
  return next;
}

async function fetchPublishedPost(slug) {
  const base = getBlogApiBaseUrl();
  const res = await fetch(`${base}/blogs/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const post = data.post ?? null;
  if (!post) return null;
  if (post.status && post.status !== "published") return null;
  return post;
}

/**
 * Build (and cache) SEO-complete HTML for a post that wasn't in the last export.
 * Returns absolute path to index.html, or null if CMS has no published post.
 */
async function materializeBlogPage(slug) {
  if (hasStaticBlogPage(slug)) return blogIndexPath(slug);
  if (!fs.existsSync(SPA_HTML)) return null;

  const post = await fetchPublishedPost(slug);
  if (!post) return null;

  const html = injectBlogMeta(fs.readFileSync(SPA_HTML, "utf8"), post, slug);
  const dir = path.join(OUT, "blog", slug);
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(blogIndexPath(slug), html, "utf8");
    console.log(`[blog] materialized SEO HTML for /blog/${slug}/`);
  } catch (err) {
    // Read-only filesystem: still serve injected HTML from memory via temp path skip
    console.warn(`[blog] could not cache /blog/${slug}/:`, err.message);
    return { html };
  }
  return blogIndexPath(slug);
}

function sendHtml(response, html) {
  const body = Buffer.from(html, "utf8");
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "public, max-age=60",
  });
  response.end(body);
}

const config = loadConfig();
if (Array.isArray(config.rewrites)) {
  config.rewrites = config.rewrites.filter(
    (rule) => !String(rule.source || "").startsWith("/blog/")
  );
}

const handler = await loadHandler();

const server = http.createServer(async (request, response) => {
  try {
    const host = request.headers.host || `localhost:${PORT}`;
    const url = new URL(request.url || "/", `http://${host}`);
    const slug = blogSlugFromPathname(url.pathname);

    if (slug && !hasStaticBlogPage(slug)) {
      const materialized = await materializeBlogPage(slug);
      if (!materialized) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Story not found");
        return;
      }
      if (typeof materialized === "object" && materialized.html) {
        sendHtml(response, materialized.html);
        return;
      }
      // File was written — fall through so serve-handler serves it normally.
    }
  } catch (err) {
    console.error("[blog] fallback error:", err);
  }

  return handler(request, response, {
    public: OUT,
    ...config,
  });
});

server.listen(PORT, () => {
  console.log(
    `Serving ${pathToFileURL(OUT).pathname} on http://0.0.0.0:${PORT}`
  );
});
