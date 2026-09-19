import { clearBlogCache, getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { BlogPostDetailClient } from "@/components/blog/blog-post-detail-client";
import { STATIC_SPA_PARAM, isStaticSpaParam } from "@/lib/static-spa";

type Params = Promise<{
  slug: string;
}>;

export async function generateStaticParams() {
  clearBlogCache();
  const slugs = await getAllPostSlugs();
  const params = slugs
    .filter((slug): slug is string => Boolean(slug) && !isStaticSpaParam(slug))
    .map((slug) => ({ slug }));

  // Without per-slug HTML, Railway/`serve` rewrites every /blog/:slug to the
  // __spa__ shell (noindex, no article canonical) — view-source looks broken
  // even though the client hydrates the post. Fail the export so deploy can't
  // ship SPA-only blog pages.
  if (params.length === 0) {
    throw new Error(
      "Blog CMS returned 0 published slugs at build time. " +
        "Set NEXT_PUBLIC_BLOG_API_URL (or GAMANA_API_URL) so generateStaticParams " +
        "can emit out/blog/{slug}/index.html with correct canonical tags."
    );
  }

  console.log(`[blog] generateStaticParams: ${params.length} posts`);

  // SPA shell used when a post is published after this build. scripts/serve-out.mjs
  // clones it, injects CMS title/description/canonical into the HTML (so
  // view-source is correct), caches out/blog/{slug}/index.html, then the
  // client hydrates the full article from the CMS.
  params.push({ slug: STATIC_SPA_PARAM });
  return params;
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
