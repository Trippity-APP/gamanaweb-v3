import { clearBlogCache, getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { BlogPostDetailClient } from "@/components/blog/blog-post-detail-client";
import { STATIC_SPA_PARAM, isStaticSpaParam } from "@/lib/static-spa";

type Params = Promise<{
  slug: string;
}>;

export async function generateStaticParams() {
  try {
    clearBlogCache();
    const slugs = await getAllPostSlugs();
    const params = slugs
      .filter((slug): slug is string => Boolean(slug) && !isStaticSpaParam(slug))
      .map((slug) => ({ slug }));
    // SPA shell for static-host rewrites (/blog/:slug → /blog/__spa__).
    if (!params.some((p) => p.slug === STATIC_SPA_PARAM)) {
      params.push({ slug: STATIC_SPA_PARAM });
    }
    if (params.length > 0) {
      return params;
    }
  } catch {
    // Build-time API may be unavailable.
  }

  return [{ slug: STATIC_SPA_PARAM }];
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  if (isStaticSpaParam(slug)) {
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
  const postId = isStaticSpaParam(slug) ? null : slug;

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
