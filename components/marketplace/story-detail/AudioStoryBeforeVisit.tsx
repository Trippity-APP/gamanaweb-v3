'use client';

import { Heart, ShieldCheck } from 'lucide-react';
import type { StoryDetail, StoryVisitTip } from '@/lib/marketplace-data';

type AudioStoryBeforeVisitProps = {
  story: StoryDetail;
};

function TipIcon({ type }: { type: StoryVisitTip['type'] }) {
  if (type === 'respect') {
    return <Heart className="h-5 w-5 text-[#159895]" />;
  }
  if (type === 'safety') {
    return <ShieldCheck className="h-5 w-5 text-[#159895]" />;
  }
  return <ShieldCheck className="h-5 w-5 text-[#159895]" />;
}

export function AudioStoryBeforeVisit({ story }: AudioStoryBeforeVisitProps) {
  if (story.beforeYouVisit.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Before you visit</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {story.beforeYouVisit.map((tip) => (
          <div
            key={`${tip.type}-${tip.title}`}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <TipIcon type={tip.type} />
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{tip.title}</p>
                <p className="text-sm leading-relaxed text-gray-600">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
