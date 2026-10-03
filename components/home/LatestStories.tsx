"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { Reveal } from "@/components/motion/Reveal";
import { fetchBlogSummariesFromApi, type BlogSummary } from "@/lib/blog";

/**
 * Build-time props freeze on static export, so this refreshes from the CMS on mount
 * and new publishes appear without a redeploy (same behaviour as /blog).
 */
export function LatestStories({ initialStories }: { initialStories: BlogSummary[] }) {
  const [stories, setStories] = useState(initialStories);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const summaries = await fetchBlogSummariesFromApi();
        if (!cancelled && summaries.length > 0) setStories(summaries.slice(0, 3));
      } catch (error) {
        console.error("Failed to refresh home latest stories:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const single = stories.length === 1;

  return (
    <div
      className={cn(
        "grid gap-6 lg:gap-8",
        single ? "mx-auto max-w-3xl" : stories.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      )}
    >
      {stories.map((story, i) => (
        <Reveal key={story.slug} delay={i * 100} className="h-full">
          <Link
            href={`/blog/${story.slug}/`}
            className="focus-ring group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
          >
            <div className={cn("relative w-full overflow-hidden", single ? "aspect-[16/9]" : "aspect-[16/10]")}>
              <BlogCoverImage
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-medium text-ink-muted">
                {new Date(story.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} •{" "}
                {story.readTime}
              </p>
              <h3 className={cn("mt-2 font-display font-bold leading-snug text-ink", single ? "text-2xl" : "text-xl")}>
                {story.title}
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">{story.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {story.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-ink/5 pt-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{story.author}</p>
                  <p className="text-xs text-ink-muted">{story.authorTitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  Read story
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
