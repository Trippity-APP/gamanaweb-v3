'use client';

import { BookOpen, Check, Clock, CloudDownload, Lock } from '@/components/icons';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { DetailGallery, NarratorChip } from '@/components/marketplace/detail/DetailGallery';
import { formatStoryDurationLabel } from '@/lib/marketplace-api';
import type { StoryDetail } from '@/lib/marketplace-data';

type UnlockState = 'free' | 'unlocked' | 'locked';

type AudioStoryHeroProps = {
  story: StoryDetail;
  unlockState: UnlockState;
  daysLeft?: number | null;
  onDownloadClick?: () => void;
};

function UnlockBadge({
  unlockState,
  price,
  daysLeft,
}: {
  unlockState: UnlockState;
  price: number;
  daysLeft?: number | null;
}) {
  if (unlockState === 'free') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
        <Check className="h-3.5 w-3.5" />
        Free
      </span>
    );
  }
  if (unlockState === 'unlocked') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
        <Check className="h-3.5 w-3.5" />
        Unlocked
        {daysLeft != null && daysLeft > 0 && (
          <span className="ml-1 rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px]">
            {daysLeft}d left
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
      <Lock className="h-3.5 w-3.5" />
      <GamanaCoinIcon className="h-3.5 w-3.5" aria-hidden />
      {price} Coins
    </span>
  );
}

export function AudioStoryHero({
  story,
  unlockState,
  daysLeft,
  onDownloadClick,
}: AudioStoryHeroProps) {
  const durationLabel = formatStoryDurationLabel(story);

  return (
    <div>
      <DetailGallery cover={{ src: story.image, alt: story.title }} />

      <div className="mt-6 space-y-4 sm:mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-800">
            Audio Story
          </span>
          <UnlockBadge unlockState={unlockState} price={story.price} daysLeft={daysLeft} />
        </div>

        <h1 className="text-display-title max-w-4xl text-balance text-ink">
          {story.title}
        </h1>
        {story.subtitle && (
          <p className="max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">{story.subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 text-sm text-ink-soft">
          {story.narrator && <NarratorChip label="Narrated by" name={story.narrator} />}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
            {durationLabel}
          </span>
          {story.storyTypeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
              {story.storyTypeLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onDownloadClick}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full font-medium text-brand-700 hover:text-brand-900"
          >
            <CloudDownload className="h-4 w-4" aria-hidden />
            Download for offline listening
          </button>
        </div>
      </div>
    </div>
  );
}
