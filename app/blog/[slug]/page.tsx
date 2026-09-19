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
      title: { absolute: "Story | Gamana Blog" },
      description: "Travel stories and guides from Gamana.",
      robots: { index: false, follow: true },
      // Prevent inheriting the homepage canonical onto the SPA fallback shell.
      alternates: { canonical: null },
    };
  }

  try {
    const post = await getPostBySlug(slug);
    const absoluteTitle = `${post.title} | Gamana Blog`;
    const canonical = `https://www.gamana.app/blog/${slug}/`;
    const coverImage = encodeURI(post.coverImage);
    return {
      title: { absolute: absoluteTitle },
      description: post.excerpt,
      alternates: {
        canonical,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        url: canonical,
        images: [
          {
            url: coverImage,
          },
        ],
      },
      twitter: {
        card: "summary_large_image" as const,
        title: post.title,
        description: post.excerpt,
        images: [coverImage],
      },
    };
  } catch {
    return {
      title: { absolute: "Story not found | Gamana Blog" },
      alternates: {
        canonical: "https://www.gamana.app/blog/",
      },
      robots: { index: false, follow: true },
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
