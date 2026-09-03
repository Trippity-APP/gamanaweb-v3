import { clearBlogCache, getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { BlogPostDetailClient } from "@/components/blog/blog-post-detail-client";

type Params = Promise<{
  slug: string;
}>;

export async function generateStaticParams() {
  try {
    clearBlogCache();
    const slugs = await getAllPostSlugs();
    const params = slugs
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
    // SPA shell for static-host rewrites (/blog/:slug → /blog/[slug]).
    if (!params.some((p) => p.slug === "[slug]")) {
      params.push({ slug: "[slug]" });
    }
    if (params.length > 0) {
      return params;
    }
  } catch {
    // Build-time API may be unavailable.
  }

  return [{ slug: "[slug]" }];
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (slug === "[slug]") {
    return {
      title: "Story | Gamana Blog",
      description: "Travel stories and guides from Gamana.",
    };
  }

  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} | Gamana Blog`,
      description: post.excerpt,
      alternates: {
        canonical: `https://www.gamana.app/blog/${slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: `https://www.gamana.app/blog/${slug}`,
        images: [
          {
            url: encodeURI(post.coverImage),
          },
        ],
      },
    };
  } catch {
    return {
      title: "Story not found | Gamana Blog",
      alternates: {
        canonical: "https://www.gamana.app/blog",
      },
    };
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const postId = slug === "[slug]" ? null : slug;

  let post = null;
  if (postId) {
    try {
      post = await getPostBySlug(postId);
    } catch {
      post = null;
    }
  }

  return <BlogPostDetailClient slug={slug} post={post} />;
}
