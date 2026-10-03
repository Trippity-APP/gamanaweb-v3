'use client';

import { Check, Clock, Lock, MapPin, Route } from '@/components/icons';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { DetailGallery, NarratorChip } from '@/components/marketplace/detail/DetailGallery';
import { formatWalkDurationLabel } from '@/lib/marketplace-api';
import type { WalkDetail } from '@/lib/marketplace-data';

type UnlockState = 'free' | 'unlocked' | 'locked';

type AudioWalkHeroProps = {
  walk: WalkDetail;
  unlockState: UnlockState;
  daysLeft?: number | null;
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

export function AudioWalkHero({ walk, unlockState, daysLeft }: AudioWalkHeroProps) {
  const durationLabel = formatWalkDurationLabel(walk);
  const stopImages = walk.stops
    .filter((stop) => stop.image)
    .map((stop) => ({ src: stop.image as string, alt: `${stop.name}, a stop on ${walk.title}` }));

  return (
    <div>
      <DetailGallery cover={{ src: walk.image, alt: walk.title }} extras={stopImages} />

      <div className="mt-6 space-y-4 sm:mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-800">
            Audio Walk
          </span>
          <UnlockBadge unlockState={unlockState} price={walk.price} daysLeft={daysLeft} />
        </div>

        <h1 className="text-display-title max-w-4xl text-balance text-ink">
          {walk.title}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-soft sm:text-lg">{walk.description}</p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 text-sm text-ink-soft">
          <NarratorChip label="Curated by" name="Gamana" />
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
            {walk.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Route className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
            {walk.stopsCount} stops
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
            {durationLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
