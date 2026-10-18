"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, Star } from "@/components/icons";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pill } from "@/components/experiences/ExperienceFiltersPanel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExperienceReview, ExperienceReviewList } from "@/lib/api/schemas/experiences";
import { getExperienceReviews } from "@/lib/experiences/api";

export function ExperienceReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<ExperienceReviewList | null>(null);
  const [items, setItems] = useState<ExperienceReview[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [stars, setStars] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setState("loading");
      try {
        const res = await getExperienceReviews(slug, 1, signal);
        setData(res);
        setItems(res.items);
        setState("ready");
      } catch {
        if (!signal?.aborted) setState("error");
      }
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const showMore = async () => {
    if (!data?.page) return;
    setLoadingMore(true);
    try {
      const res = await getExperienceReviews(slug, data.page + 1);
      setData(res);
      setItems((prev) => [...prev, ...res.items]);
    } finally {
      setLoadingMore(false);
    }
  };

  const shown = useMemo(() => (stars ? items.filter((r) => Math.round(r.rating) === stars) : items), [items, stars]);
  const avg = data?.summary?.average_rating ?? 0;
  const count = data?.summary?.review_count ?? data?.total ?? 0;
  const distribution = data?.summary?.distribution ?? null;

  if (state === "loading") {
    return (
      <div className="space-y-3" aria-hidden>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }
  if (state === "error") return <ErrorState compact title="Couldn't load reviews." onRetry={() => void load()} />;
  if (!items.length) {
    return <EmptyState icon={MessageSquare} title="No reviews yet" hint="Be the first after your visit." className="py-8 shadow-none" />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="font-display text-4xl font-bold text-ink">{avg.toFixed(1)}</p>
          <p className="text-sm text-ink-soft">{count.toLocaleString()} reviews</p>
        </div>
        {distribution && (
          <ul className="min-w-[200px] flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = distribution[String(n)] ?? 0;
              return (
                <li key={n} className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="w-3">{n}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-200">
                    <span className="block h-full bg-sunset-400" style={{ width: count ? `${(c / count) * 100}%` : 0 }} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter reviews by stars">
        <Pill active={stars == null} onClick={() => setStars(null)}>
          All
        </Pill>
        {[5, 4, 3, 2, 1].map((n) => (
          <Pill key={n} active={stars === n} onClick={() => setStars(n)}>
            {n} ★
          </Pill>
        ))}
      </div>

      <ul className="mt-6 divide-y divide-sand-200">
        {shown.map((review) => (
          <li key={review.id} className="py-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{review.reviewer?.display_name ?? "Gamana traveler"}</p>
              {review.created_at && (
                <time dateTime={review.created_at} className="text-xs text-ink-soft">
                  {new Date(review.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </time>
              )}
            </div>
            <p className="mt-1 flex gap-0.5" aria-label={`${review.rating} out of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={i < review.rating ? "h-4 w-4 fill-sunset-400 text-sunset-400" : "h-4 w-4 text-sand-200"} aria-hidden />
              ))}
            </p>
            {review.review_text && <p className="mt-2 text-sm leading-relaxed text-ink">{review.review_text}</p>}
            {review.photo_urls.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {review.photo_urls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {data?.has_next && (
        <Button type="button" variant="outline" className="rounded-full" disabled={loadingMore} onClick={showMore}>
          {loadingMore ? "Loading…" : "Show more reviews"}
        </Button>
      )}
    </div>
  );
}
