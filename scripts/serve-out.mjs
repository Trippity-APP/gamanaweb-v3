#!/usr/bin/env node
/**
 * Static host for `out/` that prefers real blog HTML over the SPA shell.
 *
 * Plain `serve` rewrites /blog/:slug → __spa__ before checking for
 * out/blog/{slug}/index.html, which broke view-source canonicals.
 * This server:
 *  - serves out/blog/{slug}/index.html when it exists (correct SEO)
 *  - falls back to out/blog/__spa__/ only for posts published after build
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

const require = createRequire(import.meta.url);

async function loadHandler() {
  try {
    return (await import("serve-handler")).default;
  } catch {
    // Prefer local install; fall back to resolving via npx-style require
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

function hasStaticBlogPage(slug) {
  return fs.existsSync(path.join(OUT, "blog", slug, "index.html"));
}

const config = loadConfig();
// Blog fallbacks are handled in this process — never let serve-handler
// unconditionally rewrite every /blog/:slug to __spa__.
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
      // Preserve query string; serve the SPA shell which hydrates from CMS.
      request.url = `/blog/__spa__/${url.search || ""}`;
    }
  } catch {
    // Fall through to default static handling.
  }

  return handler(request, response, {
    public: OUT,
    ...config,
  });
});

server.listen(PORT, () => {
  console.log(`Serving ${pathToFileURL(OUT).pathname} on http://0.0.0.0:${PORT}`);
});
