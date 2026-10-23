'use client';

import { useEffect, useState } from 'react';
import { AudioStoryDetail } from '@/components/marketplace/AudioStoryDetail';
import {
  clearMarketplaceCache,
  fetchPublicStoryDetailById,
} from '@/lib/marketplace-api';
import type { StoryDetail } from '@/lib/marketplace-data';
import {
  isStaticSpaParam,
  resolveDetailIdFromPath,
  shouldClientFetchDetail,
} from '@/lib/static-spa';

const STORY_PATH = /\/(?:explore|marketplace)\/story\/([^/]+)/;

function resolveStoryId(paramId: string): string {
  return resolveDetailIdFromPath(paramId, STORY_PATH);
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
  const [resolving, setResolving] = useState(
    shouldClientFetchDetail(storyId, Boolean(initialStory), STORY_PATH),
  );

  useEffect(() => {
    if (!shouldClientFetchDetail(storyId, Boolean(initialStory), STORY_PATH)) {
      setResolving(false);
      return;
    }

    const resolved = resolveStoryId(storyId);
    if (isStaticSpaParam(resolved)) {
      setResolving(false);
      return;
    }

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

  return <AudioStoryDetail tourId={resolveStoryId(storyId)} story={story} />;
}

export function clearStoryDetailCache() {
  clearMarketplaceCache();
}
