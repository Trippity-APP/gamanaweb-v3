const DEFAULT_API_URL = "https://api-beta.gamana.app/api/v1";

export type ApiVersion = "v1" | "v2";

export function getMarketplaceApiBaseUrl(): string {
  return getApiBaseUrl("v1");
}

/**
 * Browser: same-origin `/api/v1` or `/api/v2` (proxied by next.config.js rewrites in dev,
 * scripts/serve-out.mjs on Railway, vercel.json on Vercel) — avoids CORS and lets the
 * httpOnly refresh cookie stay first-party. Build time: the absolute backend URL.
 */
export function getApiBaseUrl(version: ApiVersion = "v1"): string {
  if (typeof window !== "undefined") {
    return `/api/${version}`;
  }

  const v1 = (
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BLOG_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, "");

  return version === "v1" ? v1 : v1.replace(/\/api\/v1$/, `/api/${version}`);
}

/** Fetch options for catalog API calls — must be cacheable during static export builds. */
export function getCatalogFetchInit(): RequestInit {
  if (typeof window !== "undefined") {
    return { cache: "no-store" };
  }
  // next dev Data Cache can omit newly published CMS entries from generateStaticParams.
  if (process.env.NODE_ENV === "development") {
    return { cache: "no-store" };
  }
  return { cache: "force-cache" };
}
