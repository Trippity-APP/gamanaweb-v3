'use client';

import { Headphones } from 'lucide-react';
import type { StorySubTopic } from '@/lib/marketplace-data';

type AudioStoryGoDeeperProps = {
  subTopics: StorySubTopic[];
};

export function AudioStoryGoDeeper({ subTopics }: AudioStoryGoDeeperProps) {
  if (subTopics.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900">Go deeper</h2>
      <p className="mt-1 text-sm text-gray-500">
        Sub-topics you can explore in the Gamana app.
      </p>
      <div className="mt-4 space-y-3">
        {subTopics.map((topic, index) => (
          <div
            key={topic.id}
            className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#159895]/10">
              <Headphones className="h-4 w-4 text-[#159895]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#159895]">
                Sub-topic {index + 1}
              </p>
              <p className="mt-0.5 font-semibold leading-snug text-gray-900">{topic.name}</p>
              {topic.durationLabel && (
                <p className="mt-1 text-xs text-gray-500">{topic.durationLabel} audio</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
