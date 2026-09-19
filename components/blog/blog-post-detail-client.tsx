'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/navigation/footer';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { clearBlogCache, getPostBySlug, type BlogPost } from '@/lib/blog';
import { isStaticSpaParam } from '@/lib/static-spa';

function resolveBlogSlug(paramSlug: string): string {
  if (!isStaticSpaParam(paramSlug)) return paramSlug;
  if (typeof window === 'undefined') return paramSlug;
  const match = window.location.pathname.match(/\/blog\/([^/]+)/);
  const slug = match?.[1] ? decodeURIComponent(match[1]) : paramSlug;
  return isStaticSpaParam(slug) ? paramSlug : slug;
}

type BlogPostDetailClientProps = {
  slug: string;
  post: BlogPost | null;
};

export function BlogPostDetailClient({
  slug: paramSlug,
  post: initialPost,
}: BlogPostDetailClientProps) {
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolved = resolveBlogSlug(paramSlug);
    if (!resolved || isStaticSpaParam(resolved)) {
      if (!initialPost) {
        setLoading(false);
        setError('This story is not available.');
      }
      return;
    }

    let cancelled = false;

    void (async () => {
      if (!initialPost) setLoading(true);
      setError(null);
      try {
        clearBlogCache();
        const next = await getPostBySlug(resolved);
        if (!cancelled) setPost(next);
      } catch {
        if (!cancelled) {
          if (!initialPost) {
            setPost(null);
            setError('This story is not available.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paramSlug, initialPost]);

  // When this page is the SPA shell (post published after last deploy), sync
  // title + canonical once CMS data arrives so crawlers/JS see the right URL.
  useEffect(() => {
    if (!post?.slug || typeof document === 'undefined') return;
    const canonicalHref = `https://www.gamana.app/blog/${post.slug}/`;
    document.title = `${post.title} | Gamana Blog`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  }, [post]);

  if (loading) {
    return (
      <>
        <main className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center text-gray-500 sm:px-6 lg:px-8">
            Loading story...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <main className="bg-white">
          <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="text-gray-500">{error ?? 'Story not found.'}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/blog">Back to stories</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return <BlogPostView post={post} />;
}
