import { articles, Article, ArticleBlock } from "@/content/blog/articles";

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

export const getAllPosts = (): BlogPost[] =>
  [...articles]
    .map(enrichArticle)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

export const getAllPostSummaries = (): BlogSummary[] =>
  getAllPosts().map(({ blocks, ...rest }) => rest);

export const getLatestPostSummaries = (limit = 3): BlogSummary[] =>
  getAllPostSummaries().slice(0, limit);

export const getFeaturedPostSummary = (): BlogSummary | undefined => {
  const posts = getAllPostSummaries();
  return posts.find((post) => post.featured) ?? posts[0];
};

export const getPostBySlug = (slug: string): BlogPost => {
  const post = articles.find((article) => article.slug === slug);
  if (!post) throw new Error(`Post ${slug} not found`);
  return enrichArticle(post);
};

export const getAllPostSlugs = (): string[] =>
  articles.map((article) => article.slug).filter((slug): slug is string => Boolean(slug));

