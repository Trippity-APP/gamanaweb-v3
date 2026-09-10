'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { getAllPostSummaries, type BlogSummary } from "@/lib/blog";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";

interface Props {
  currentSlug: string;
  currentTags: string[];
  limit?: number;
}

function scoreOverlap(a: string[], b: string[]): number {
  const set = new Set(a.map((t) => t.toLowerCase()));
  return b.reduce((n, t) => n + (set.has(t.toLowerCase()) ? 1 : 0), 0);
}

export default function RelatedPosts({
  currentSlug,
  currentTags,
  limit = 3,
}: Props) {
  const [related, setRelated] = useState<BlogSummary[]>([]);

  const tagsKey = currentTags.join("\0");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const all = await getAllPostSummaries();
        if (cancelled) return;
        const tags = tagsKey ? tagsKey.split("\0") : [];
        const scored = all
          .filter((p) => p.slug !== currentSlug)
          .map((p) => ({ post: p, score: scoreOverlap(tags, p.tags) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(({ post }) => post);
        setRelated(scored);
      } catch {
        if (!cancelled) setRelated([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentSlug, tagsKey, limit]);

  if (related.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Related stories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((post) => (
          <RelatedCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}

function RelatedCard({ post }: { post: BlogSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="rounded-xl border border-gray-100 overflow-hidden hover:border-[#159895]/40 transition-all h-full flex flex-col">
        <div className="relative w-full aspect-[16/10]">
          <BlogCoverImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-500 mb-1">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {post.readTime}
          </p>
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1A5F7A] transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
            {post.excerpt}
          </p>
          <span className="inline-flex items-center text-sm font-semibold text-[#1A5F7A]">
            Read
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
