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
 *
 * Also serves a live /sitemap.xml that merges build-time non-blog URLs with
 * every currently published CMS post (so new articles are indexed immediately).
 */
import http from "node:http";
import https from "node:https";
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

// Same target as the /api/v1 rewrite in next.config.js. The browser calls the
// API same-origin (lib/api-base-url.ts) to avoid CORS, so production must proxy it too.
const API_PROXY_TARGET = new URL(
  process.env.API_PROXY_TARGET ||
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "https://apidev.gamana.app"
);

function proxyApi(request, response) {
  const client = API_PROXY_TARGET.protocol === "http:" ? http : https;
  const headers = { ...request.headers, host: API_PROXY_TARGET.host };
  delete headers.connection;
  const upstream = client.request(
    {
      protocol: API_PROXY_TARGET.protocol,
      hostname: API_PROXY_TARGET.hostname,
      port: API_PROXY_TARGET.port || undefined,
      method: request.method,
      path: request.url,
      headers,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    }
  );
  upstream.on("error", (err) => {
    console.error("[api proxy]", err.message);
    if (!response.headersSent) {
      response.writeHead(502, { "Content-Type": "application/json" });
    }
    response.end(JSON.stringify({ success: false, error: "Upstream unavailable" }));
  });
  request.pipe(upstream);
}

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

async function fetchAllPublishedPosts() {
  const base = getBlogApiBaseUrl();
  const posts = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const res = await fetch(
      `${base}/blogs?page=${page}&page_size=100&status=published`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) break;
    const data = await res.json();
    posts.push(...(data.items || []));
    hasNext = Boolean(data.has_next);
    page += 1;
  }
  return posts.filter((post) => !post.status || post.status === "published");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  const parts = [`<url>`, `<loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`<lastmod>${escapeXml(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${escapeXml(changefreq)}</changefreq>`);
  if (priority != null) parts.push(`<priority>${escapeXml(priority)}</priority>`);
  parts.push(`</url>`);
  return parts.join("");
}

/**
 * Live sitemap: keep non-blog URLs from the build-time sitemap.xml, replace
 * /blog/* entries with the full published CMS list so new posts appear
 * without a redeploy.
 */
async function buildLiveSitemapXml() {
  const baseUrl = "https://www.gamana.app";
  const sitemapPath = path.join(OUT, "sitemap.xml");
  let staticXml = "";
  try {
    staticXml = fs.readFileSync(sitemapPath, "utf8");
  } catch {
    staticXml = "";
  }

  // Keep every <url> that is not a blog article (and keep /blog/ index).
  const kept = [];
  const urlBlocks = staticXml.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of urlBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] || "";
    const isBlogArticle =
      /^https:\/\/www\.gamana\.app\/blog\/.+/.test(loc) &&
      loc !== `${baseUrl}/blog/` &&
      loc !== `${baseUrl}/blog`;
    if (!isBlogArticle) kept.push(block);
  }

  if (kept.length === 0) {
    kept.push(
      urlEntry(baseUrl, new Date().toISOString(), "daily", "1"),
      urlEntry(`${baseUrl}/blog/`, new Date().toISOString(), "weekly", "0.9")
    );
  }

  let blogPosts = [];
  try {
    blogPosts = await fetchAllPublishedPosts();
  } catch (err) {
    console.error("[sitemap] CMS fetch failed:", err.message);
  }

  const blogEntries = blogPosts
    .filter((post) => post.slug)
    .map((post) => {
      const lastmod = post.published_at
        ? new Date(post.published_at).toISOString()
        : new Date().toISOString();
      return urlEntry(
        `${baseUrl}/blog/${post.slug}/`,
        lastmod,
        "monthly",
        "0.7"
      );
    });

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...kept, ...blogEntries].join("\n") +
    `\n</urlset>\n`
  );
}

function sendXml(response, xml) {
  const body = Buffer.from(xml, "utf8");
  response.writeHead(200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "public, max-age=300",
  });
  response.end(body);
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

/**
 * serve.json rewrites every /cities/:id, /marketplace/{tours,story}/:id (and the
 * legacy /explore/... aliases) to a `__spa__` shell, and serve-handler applies
 * rewrites before looking for real files. Pages pre-rendered at build time have
 * their own title, canonical and JSON-LD, so serve those directly and leave the
 * shell for IDs published after the last deploy.
 */
const PRERENDERED_DETAIL_ROUTE = /^\/(cities|marketplace\/tours|marketplace\/story)\/([^/]+)\/?$/;

function prerenderedDetailPath(pathname) {
  const match = pathname.match(PRERENDERED_DETAIL_ROUTE);
  if (!match) return null;
  let id;
  try {
    id = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  if (!id || id === "__spa__" || id.includes("..") || id.includes("/")) return null;
  const file = path.join(OUT, match[1], id, "index.html");
  return fs.existsSync(file) ? file : null;
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
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (url.pathname.startsWith("/api/v1/")) {
      proxyApi(request, response);
      return;
    }

    // Always serve a live sitemap so newly published CMS posts are indexed
    // without waiting for the next Railway build.
    if (pathname === "/sitemap.xml") {
      try {
        const xml = await buildLiveSitemapXml();
        sendXml(response, xml);
        return;
      } catch (err) {
        console.error("[sitemap] live build failed:", err);
        // Fall through to static file if present.
      }
    }

    const detailFile = prerenderedDetailPath(url.pathname);
    if (detailFile) {
      if (!url.pathname.endsWith("/")) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        response.end();
        return;
      }
      sendHtml(response, fs.readFileSync(detailFile, "utf8"));
      return;
    }

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
