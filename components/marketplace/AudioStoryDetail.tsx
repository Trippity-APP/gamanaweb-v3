'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExploreDetailBreadcrumb } from '@/components/marketplace/ExploreDetailBreadcrumb';
import { AudioStoryActionCard } from '@/components/marketplace/story-detail/AudioStoryActionCard';
import { AudioStoryBeforeVisit } from '@/components/marketplace/story-detail/AudioStoryBeforeVisit';
import { AudioStoryContext } from '@/components/marketplace/story-detail/AudioStoryContext';
import { AudioStoryGoDeeper } from '@/components/marketplace/story-detail/AudioStoryGoDeeper';
import { AudioStoryHero } from '@/components/marketplace/story-detail/AudioStoryHero';
import { AudioStoryLanguagePicker } from '@/components/marketplace/story-detail/AudioStoryLanguagePicker';
import { AudioStoryMobileCTA } from '@/components/marketplace/story-detail/AudioStoryMobileCTA';
import { AudioStoryNarrator } from '@/components/marketplace/story-detail/AudioStoryNarrator';
import { AudioStoryNoticeList } from '@/components/marketplace/story-detail/AudioStoryNoticeList';
import { AudioStorySources } from '@/components/marketplace/story-detail/AudioStorySources';
import { DownloadAppDialog } from '@/components/DownloadAppDialog';
import { getExploreBackHref } from '@/lib/explore-search';
import { usePathname } from 'next/navigation';
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
import { useAuth } from '@/lib/auth/auth-context';
import { daysLeft, useLibrary } from '@/lib/library/library-context';

const STORY_PATH = /\/(?:explore|marketplace)\/story\/([^/]+)/;

function resolveStoryId(paramId: string): string {
  return resolveDetailIdFromPath(paramId, STORY_PATH);
}

type AudioStoryDetailProps = {
  tourId: string;
  story: StoryDetail | null;
};

export function AudioStoryDetail({
  tourId: paramTourId,
  story: initialStory,
}: AudioStoryDetailProps) {
  const pathname = usePathname();
  const backHref = getExploreBackHref(pathname);
  const [story, setStory] = useState<StoryDetail | null>(initialStory);
  const needsFetch = shouldClientFetchDetail(paramTourId, Boolean(initialStory), STORY_PATH);
  const [loading, setLoading] = useState(needsFetch);
  const [error, setError] = useState<string | null>(
    initialStory || needsFetch ? null : 'This story is not available.',
  );
  const [downloadOpen, setDownloadOpen] = useState(false);

  const loadStoryById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchPublicStoryDetailById(id);
      if (!detail) {
        setStory(null);
        setError('This story is not available.');
        return;
      }
      setStory(detail);
    } catch {
      setStory(null);
      setError("We couldn't load this story right now.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-rendered pages carry image and audio SAS URLs signed at build time, which expire after 24h.
  useEffect(() => {
    if (!initialStory) return;
    let cancelled = false;
    fetchPublicStoryDetailById(initialStory.id)
      .then((fresh) => {
        if (!cancelled && fresh) setStory(fresh);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initialStory]);

  useEffect(() => {
    if (!shouldClientFetchDetail(paramTourId, Boolean(initialStory), STORY_PATH)) return;
    const resolved = resolveStoryId(paramTourId);
    if (isStaticSpaParam(resolved)) {
      setLoading(false);
      setError('This story is not available.');
      return;
    }
    void loadStoryById(resolved);
  }, [paramTourId, initialStory]);

  const { status: authStatus } = useAuth();
  const library = useLibrary();
  const unlock = story && authStatus === 'authenticated' ? library.find('place', story.id) : undefined;
  const unlockState = useMemo(
    () => (story?.price === 0 ? ('free' as const) : unlock ? ('unlocked' as const) : ('locked' as const)),
    [story, unlock],
  );
  const unlockDays = unlock ? daysLeft(unlock) : null;

  const retry = () => {
    clearMarketplaceCache();
    const resolved = resolveStoryId(paramTourId);
    if (isStaticSpaParam(resolved)) return;
    void loadStoryById(resolved);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <ExploreDetailBreadcrumb />
        <p className="text-ink-muted">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-ink-muted">{error ?? 'Story not found.'}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={backHref}>Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-site pb-28 pt-6 sm:pt-8 lg:pb-12">
        <ExploreDetailBreadcrumb title={story.title} />

        <AudioStoryHero
          story={story}
          unlockState={unlockState}
          daysLeft={unlockDays}
          onDownloadClick={() => setDownloadOpen(true)}
        />

        <div className="mt-6 lg:hidden">
          <AudioStoryActionCard story={story} />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="space-y-6">
            <AudioStoryContext story={story} />
            <AudioStoryNoticeList story={story} />
            <AudioStorySources story={story} />
            <AudioStoryLanguagePicker story={story} />
            <AudioStoryNarrator
              story={story}
              onTryAnotherLens={() => setDownloadOpen(true)}
            />
            <AudioStoryGoDeeper subTopics={story.subTopics} />
            <AudioStoryBeforeVisit story={story} />
          </div>

          <aside className="hidden lg:sticky lg:top-32 lg:block">
            <AudioStoryActionCard story={story} />
          </aside>
        </div>
      </div>

      <AudioStoryMobileCTA />

      <DownloadAppDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        source="audio-story-detail-hero"
      />
    </>
  );
}
