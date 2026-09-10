'use client';

import { useEffect, useState } from 'react';
import { AudioStoryDetail } from '@/components/marketplace/AudioStoryDetail';
import {
  clearMarketplaceCache,
  fetchPublicStoryDetailById,
} from '@/lib/marketplace-api';
import type { StoryDetail } from '@/lib/marketplace-data';
import { isStaticSpaParam } from '@/lib/static-spa';

function resolveStoryId(paramId: string): string {
  if (!isStaticSpaParam(paramId)) return paramId;
  if (typeof window === 'undefined') return paramId;
  const match = window.location.pathname.match(/\/explore\/story\/([^/]+)/);
  return match?.[1] ?? paramId;
}

type ExploreStoryDetailClientProps = {
  storyId: string;
  story: StoryDetail | null;
};

export function ExploreStoryDetailClient({
  storyId,
  story: initialStory,
}: ExploreStoryDetailClientProps) {
  const [story, setStory] = useState<StoryDetail | null>(initialStory);
  const [resolving, setResolving] = useState(isStaticSpaParam(storyId) && !initialStory);

  useEffect(() => {
    if (!isStaticSpaParam(storyId) || initialStory) return;

    const resolved = resolveStoryId(storyId);
    if (isStaticSpaParam(resolved)) return;

    let cancelled = false;

    (async () => {
      setResolving(true);
      try {
        const detail = await fetchPublicStoryDetailById(resolved);
        if (cancelled) return;
        setStory(detail);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storyId, initialStory]);

  if (resolving) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return <AudioStoryDetail tourId={storyId} story={story} />;
}

export function clearStoryDetailCache() {
  clearMarketplaceCache();
}
