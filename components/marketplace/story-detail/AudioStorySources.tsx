'use client';

import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { StoryDetail, StorySource } from '@/lib/marketplace-data';

type AudioStorySourcesProps = {
  story: StoryDetail;
};

const SOURCE_TYPE_LABELS: Record<StorySource['type'], string> = {
  academic: 'Academic',
  oral: 'Oral',
  archival: 'Archival',
  mixed: 'Mixed',
};

function sourceTypeLabel(type: StorySource['type']): string {
  return SOURCE_TYPE_LABELS[type] ?? 'Source';
}

export function AudioStorySources({ story }: AudioStorySourcesProps) {
  const [expanded, setExpanded] = useState(false);
  const { sources } = story;

  if (sources.length === 0) return null;

  const sourceTypes = new Set(sources.map((s) => s.type));
  const mixLabel =
    sourceTypes.size > 1 ? 'Mixed' : sourceTypeLabel(sources[0].type);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {mixLabel}
        </span>
        <span className="text-sm text-gray-600">
          Based on {sources.length} source{sources.length === 1 ? '' : 's'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
        aria-expanded={expanded}
      >
        View sources
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <ul className="mt-3 space-y-2">
          {sources.map((source) => (
            <li
              key={`${source.type}-${source.title}`}
              className="flex items-start justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <span className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#159895] ring-1 ring-[#159895]/20">
                  {sourceTypeLabel(source.type)}
                </span>
                <p className="text-sm font-medium text-gray-900">{source.title}</p>
              </div>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[#159895] hover:text-[#128a86]"
                  aria-label={`Open source: ${source.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <ExternalLink className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
