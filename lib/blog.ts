import { articles, Article, ArticleBlock } from "@/content/blog/articles";
import {
  fetchAllPublishedPosts,
  fetchPublishedPostBySlug,
  type ApiBlogPost,
} from "@/lib/blog-api";

const WORDS_PER_MINUTE = 200;

const extractText = (block: ArticleBlock): string => {
  switch (block.type) {
    case "paragraph":
    case "quote":
      return block.content;
    case "heading":
      return block.content;
    case "list":
      return block.items.join(" ");
    case "html":
      return block.content.replace(/<[^>]+>/g, " ");
    default:
      return "";
  }
};

const computeReadTime = (blocks: ArticleBlock[]): string => {
  const totalWords = blocks.reduce((count, block) => {
    const text = extractText(block);
    if (!text) return count;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return count + words;
  }, 0);

  const minutes = Math.max(1, Math.round(totalWords / WORDS_PER_MINUTE));
  return `${minutes} min read`;
};

const enrichArticle = (article: Article): BlogPost => ({
  ...article,
  readTime: computeReadTime(article.blocks),
});

export type BlogPost = Article & { readTime: string };

export type BlogSummary = Omit<BlogPost, "blocks">;

function mapApiPostToArticle(post: ApiBlogPost): Article {
  const date =
    post.published_at?.split("T")[0] ||
    new Date().toISOString().split("T")[0];

  const blocks: ArticleBlock[] = post.content_html?.trim()
    ? [{ type: "html", content: post.content_html }]
    : [];

  return {
    slug: post.slug,
    title: post.title,
    date,
    author: post.author || "Gamana Editorial Team",
    authorTitle: post.author_title || "Travel Innovation",
    coverImage: post.cover_image_url || "/demo02.png",
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    featured: Boolean(post.featured),
    region: (post.region as Article["region"]) || undefined,
    tripType: (post.trip_type as Article["tripType"]) || undefined,
    blocks,
  };
}

let cachedApiPosts: BlogPost[] | null = null;

async function loadApiPosts(): Promise<BlogPost[]> {
  if (cachedApiPosts) return cachedApiPosts;

  const apiPosts = await fetchAllPublishedPosts();
  cachedApiPosts = apiPosts
    .map(mapApiPostToArticle)
    .map(enrichArticle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return cachedApiPosts;
}

function loadLocalPosts(): BlogPost[] {
  return [...articles]
    .map(enrichArticle)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function loadPosts(): Promise<BlogPost[]> {
  try {
    const apiPosts = await loadApiPosts();
    if (apiPosts.length > 0) return apiPosts;
  } catch (error) {
    console.warn("Blog API unavailable, falling back to local articles.ts:", error);
  }

  return loadLocalPosts();
}

export async function getAllPosts(): Promise<BlogPost[]> {
  return loadPosts();
}

export async function getAllPostSummaries(): Promise<BlogSummary[]> {
  const posts = await loadPosts();
  return posts.map(({ blocks, ...rest }) => rest);
}

export async function getLatestPostSummaries(limit = 3): Promise<BlogSummary[]> {
  const posts = await getAllPostSummaries();
  return posts.slice(0, limit);
}

export async function getFeaturedPostSummary(): Promise<BlogSummary | undefined> {
  const posts = await getAllPostSummaries();
  return posts.find((post) => post.featured) ?? posts[0];
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  try {
    const apiPost = await fetchPublishedPostBySlug(slug);
    if (apiPost) {
      return enrichArticle(mapApiPostToArticle(apiPost));
    }
  } catch (error) {
    console.warn(`Blog API lookup failed for ${slug}, trying local fallback:`, error);
  }

  const post = articles.find((article) => article.slug === slug);
  if (!post) throw new Error(`Post ${slug} not found`);
  return enrichArticle(post);
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await loadPosts();
  return posts.map((article) => article.slug).filter(Boolean);
}
