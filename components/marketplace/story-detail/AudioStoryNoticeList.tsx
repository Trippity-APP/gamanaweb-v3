'use client';

import { Eye } from '@/components/icons';
import type { StoryDetail } from '@/lib/marketplace-data';

type AudioStoryNoticeListProps = {
  story: StoryDetail;
};

export function AudioStoryNoticeList({ story }: AudioStoryNoticeListProps) {
  if (story.whatToNotice.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-ink">What to notice right now</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {story.whatToNotice.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-gray-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#159895]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
