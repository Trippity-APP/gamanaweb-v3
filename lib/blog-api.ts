const DEFAULT_API_URL = "https://apidev.gamana.app/api/v1";

export type ApiBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  author?: string;
  author_title?: string | null;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  tags?: string[];
  region?: string | null;
  trip_type?: string | null;
  featured?: boolean;
  published_at?: string | null;
  content_html?: string | null;
};

type ApiListResponse = {
  success: boolean;
  items: ApiBlogPost[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
};

type ApiPostResponse = {
  success: boolean;
  post: ApiBlogPost;
};

/**
 * Blog CMS calls use the absolute API URL in both server and browser.
 * Do not use the `/api/v1` marketplace proxy here — static hosts often omit that
 * rewrite, which made the blog index fetch fail silently after deploy.
 */
export function getBlogApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BLOG_API_URL ||
    process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BLOG_API_URL ||
    process.env.GAMANA_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/$/, "");
}

async function fetchJson<T>(url: string): Promise<T> {
  // Always bypass HTTP/Next caches for CMS reads so new/updated articles appear
  // without waiting for a rebuild (browser + server during next dev).
  const init: RequestInit =
    process.env.NODE_ENV === "development" || typeof window !== "undefined"
      ? { cache: "no-store" }
      : { cache: "force-cache" };

  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Blog API ${url} failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function fetchAllPublishedPosts(): Promise<ApiBlogPost[]> {
  const baseUrl = getBlogApiBaseUrl();
  const posts: ApiBlogPost[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const data = await fetchJson<ApiListResponse>(
      `${baseUrl}/blogs?page=${page}&page_size=100`
    );
    posts.push(...(data.items || []));
    hasNext = Boolean(data.has_next);
    page += 1;
  }

  return posts;
}

export async function fetchPublishedPostBySlug(
  slug: string
): Promise<ApiBlogPost | null> {
  const baseUrl = getBlogApiBaseUrl();

  try {
    const data = await fetchJson<ApiPostResponse>(`${baseUrl}/blogs/${slug}`);
    return data.post ?? null;
  } catch {
    return null;
  }
}
