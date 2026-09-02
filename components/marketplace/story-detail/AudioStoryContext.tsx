'use client';

import type { ReactNode } from 'react';
import type { StoryDetail } from '@/lib/marketplace-data';

type AudioStoryContextProps = {
  story: StoryDetail;
};

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-5 w-1 shrink-0 rounded-full bg-[#159895]" aria-hidden />
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">{children}</h2>
    </div>
  );
}

export function AudioStoryContext({ story }: AudioStoryContextProps) {
  const body =
    story.placeDescription?.trim() ||
    story.description?.trim() ||
    `Discover the story behind ${story.placeName ?? story.title}.`;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <SectionHeader>Why this matters</SectionHeader>
      <p className="mt-4 text-base leading-relaxed text-gray-700">{body}</p>
    </section>
  );
}
