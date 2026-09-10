'use client';

import { BookOpen, Check, Clock, CloudDownload, Lock } from 'lucide-react';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="relative min-h-[240px] bg-gray-100 sm:min-h-[300px] lg:min-h-[360px]">
            {isPlaceholderTourImage(story.image) ? (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1A5F7A]/20 via-[#159895]/15 to-gray-200" />
            ) : (
              <MarketplaceCoverImage
                src={story.image}
                alt={story.title}
                fill
                priority
                useDefaultFallback={false}
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#F0FBFA] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0B6E4F]">
                Audio Story
              </span>
              <UnlockBadge unlockState={unlockState} price={story.price} daysLeft={daysLeft} />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
                {story.title}
              </h1>
              {story.subtitle && (
                <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                  {story.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#159895]" />
                {durationLabel}
              </span>
              {story.storyTypeLabel && (
                <>
                  <span className="hidden text-gray-300 sm:inline">|</span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#159895]" />
                    {story.storyTypeLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

      <button
        type="button"
        onClick={onDownloadClick}
        className="flex w-full items-center justify-center gap-2 border-t border-[#159895]/30 bg-white px-4 py-3.5 text-sm font-medium text-[#1A5F7A] transition-colors hover:bg-[#F0FBFA]"
      >
        <CloudDownload className="h-4 w-4" />
        Download for offline listening
      </button>
    </div>
  );
}
