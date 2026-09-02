const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";

export function getMarketplaceApiBaseUrl(): string {
  // Browser: same-origin proxy avoids CORS blocks on endpoints like public places search.
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  return (
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BLOG_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, "");
}

/** Fetch options for catalog API calls — must be cacheable during static export builds. */
export function getCatalogFetchInit(): RequestInit {
  if (typeof window !== "undefined") {
    return { cache: "no-store" };
  }
  return { cache: "force-cache" };
}
