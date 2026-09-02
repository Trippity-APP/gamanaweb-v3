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
import { useAccount } from '@/lib/account-context';
import {
  clearMarketplaceCache,
  fetchPublicStoryDetailById,
} from '@/lib/marketplace-api';
import type { StoryDetail } from '@/lib/marketplace-data';

const ACCESS_WINDOW_DAYS = 30;

function resolveStoryId(paramId: string): string {
  if (paramId !== '[id]') return paramId;
  if (typeof window === 'undefined') return paramId;
  const match = window.location.pathname.match(/\/explore\/story\/([^/]+)/);
  return match?.[1] ?? paramId;
}

function getDaysLeft(unlockedAt: string): number {
  const expiry = new Date(unlockedAt);
  expiry.setDate(expiry.getDate() + ACCESS_WINDOW_DAYS);
  const diff = expiry.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

type AudioStoryDetailProps = {
  tourId: string;
  story: StoryDetail | null;
};

export function AudioStoryDetail({
  tourId: paramTourId,
  story: initialStory,
}: AudioStoryDetailProps) {
  const { isUnlocked, unlockedItems } = useAccount();
  const [story, setStory] = useState<StoryDetail | null>(initialStory);
  const [loading, setLoading] = useState(paramTourId === '[id]' && !initialStory);
  const [error, setError] = useState<string | null>(
    initialStory ? null : paramTourId === '[id]' ? null : 'This story is not available.',
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

  useEffect(() => {
    if (initialStory || paramTourId !== '[id]') return;
    const resolved = resolveStoryId(paramTourId);
    if (resolved === '[id]') return;
    void loadStoryById(resolved);
  }, [paramTourId, initialStory]);

  const unlockState = useMemo(() => {
    if (!story) return 'locked' as const;
    if (story.price === 0) return 'free' as const;
    if (isUnlocked(story.id, 'tour')) return 'unlocked' as const;
    return 'locked' as const;
  }, [story, isUnlocked]);

  const daysLeft = useMemo(() => {
    if (!story || unlockState !== 'unlocked') return null;
    const unlocked = unlockedItems.find((item) => item.id === story.id && item.type === 'tour');
    if (!unlocked?.unlockedAt) return null;
    return getDaysLeft(unlocked.unlockedAt);
  }, [story, unlockState, unlockedItems]);

  const retry = () => {
    clearMarketplaceCache();
    const resolved = resolveStoryId(paramTourId);
    if (resolved === '[id]') return;
    void loadStoryById(resolved);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <ExploreDetailBreadcrumb />
        <p className="text-gray-500">Loading story...</p>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-gray-500">{error ?? 'Story not found.'}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/explore">Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        <ExploreDetailBreadcrumb />

        <AudioStoryHero
          story={story}
          unlockState={unlockState}
          daysLeft={daysLeft}
          onDownloadClick={() => setDownloadOpen(true)}
        />

        <div className="mt-6 lg:hidden">
          <AudioStoryActionCard
            story={story}
            unlockState={unlockState}
            daysLeft={daysLeft}
          />
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
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

          <aside className="hidden lg:block lg:sticky lg:top-24">
            <AudioStoryActionCard
              story={story}
              unlockState={unlockState}
              daysLeft={daysLeft}
            />
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
