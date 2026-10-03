'use client';

import { Mic } from '@/components/icons';
import type { StoryDetail } from '@/lib/marketplace-data';

type AudioStoryNarratorProps = {
  story: StoryDetail;
  onTryAnotherLens?: () => void;
};

export function AudioStoryNarrator({ story, onTryAnotherLens }: AudioStoryNarratorProps) {
  const primary = story.narrators.find((n) => n.isPrimary) ?? story.narrators[0];
  if (!primary) return null;

  const durationLabel = primary.durationMinutes
    ? `${primary.durationMinutes}m`
    : story.duration;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
      <h2 className="text-lg font-semibold text-ink">Your Narrator</h2>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1A5F7A] text-white">
            <Mic className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="font-semibold text-ink">
                {primary.name}
                <span className="font-normal text-ink-muted"> · {primary.title}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{primary.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-ink-muted">{durationLabel}</span>
              <button
                type="button"
                onClick={onTryAnotherLens}
                className="font-medium text-brand-600 hover:text-[#128a86]"
              >
                Try another lens
              </button>
            </div>
          </div>
        </div>
      </div>

      {story.lensesAvailableCount != null && story.lensesAvailableCount > 1 && (
        <p className="mt-3 text-xs text-ink-muted">
          {story.lensesAvailableCount} lenses available in this language
        </p>
      )}
    </section>
  );
}
