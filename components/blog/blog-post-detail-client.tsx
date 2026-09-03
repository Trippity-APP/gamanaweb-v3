'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/navigation/footer';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { clearBlogCache, getPostBySlug, type BlogPost } from '@/lib/blog';

function resolveBlogSlug(paramSlug: string): string {
  if (paramSlug !== '[slug]') return paramSlug;
  if (typeof window === 'undefined') return paramSlug;
  const match = window.location.pathname.match(/\/blog\/([^/]+)/);
  const slug = match?.[1] ? decodeURIComponent(match[1]) : paramSlug;
  return slug === '[slug]' ? paramSlug : slug;
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

  const loadPost = async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      clearBlogCache();
      const next = await getPostBySlug(slug);
      setPost(next);
    } catch {
      setPost(null);
      setError('This story is not available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPost) return;
    const resolved = resolveBlogSlug(paramSlug);
    if (!resolved || resolved === '[slug]') {
      setLoading(false);
      setError('This story is not available.');
      return;
    }
    void loadPost(resolved);
  }, [paramSlug, initialPost]);

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
