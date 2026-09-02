'use client';

import type { StoryDetail } from '@/lib/marketplace-data';

type AudioStoryLanguagePickerProps = {
  story: StoryDetail;
};

export function AudioStoryLanguagePicker({ story }: AudioStoryLanguagePickerProps) {
  const { languages } = story;
  if (languages.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900">Language</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((lang) => {
          const label = lang.nativeLabel ?? lang.label;
          const isActive = lang.isActive;

          return (
            <button
              key={lang.code}
              type="button"
              disabled={!isActive}
              title={!isActive ? 'Available in the Gamana app' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A5F7A] text-white'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
