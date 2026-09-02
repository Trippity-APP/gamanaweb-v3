'use client';

import { useState } from 'react';
import {
  Bookmark,
  CirclePlay,
  Clock,
  Globe,
  MapPin,
  Navigation,
  Share2,
  Smartphone,
  User,
} from 'lucide-react';
import { DownloadAppDialog } from '@/components/DownloadAppDialog';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatStoryDurationLabel } from '@/lib/marketplace-api';
import type { StoryDetail } from '@/lib/marketplace-data';

type UnlockState = 'free' | 'unlocked' | 'locked';

type AudioStoryActionCardProps = {
  story: StoryDetail;
  unlockState: UnlockState;
  daysLeft?: number | null;
  className?: string;
};

function buildDirectionsUrl(story: StoryDetail): string {
  if (story.coordinates) {
    const [lng, lat] = story.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(story.location)}`;
}

function activeLanguageLabel(story: StoryDetail): string {
  const active = story.languages.find((l) => l.isActive);
  return active?.label ?? 'English';
}

export function AudioStoryActionCard({
  story,
  unlockState,
  daysLeft,
  className = '',
}: AudioStoryActionCardProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const durationLabel = formatStoryDurationLabel(story);

  const openDownload = () => setDownloadOpen(true);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: story.title,
      text: story.subtitle ?? story.description,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <Card className={`border-gray-200 shadow-sm ${className}`}>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="space-y-1">
            {unlockState === 'free' ? (
              <p className="text-sm font-semibold text-emerald-700">Free to listen</p>
            ) : unlockState === 'unlocked' ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-emerald-700">Unlocked in your account</p>
                {daysLeft != null && daysLeft > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <Clock className="h-3 w-3" />
                    {daysLeft} days remaining
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GamanaCoinIcon className="h-5 w-5" aria-hidden />
                <p className="text-xl font-bold text-gray-900">{story.price} Coins</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {unlockState === 'locked'
                ? 'Unlock in the Gamana app with the same account.'
                : 'Open in the Gamana app to play and listen offline.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={openDownload}
            className="h-12 w-full rounded-xl bg-[#1A5F7A] text-base font-semibold text-white hover:bg-[#164e63]"
          >
            <CirclePlay className="mr-2 h-5 w-5" />
            Play
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={openDownload}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Bookmark className="h-5 w-5 text-[#159895]" />
              Save
            </button>
            <a
              href={buildDirectionsUrl(story)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Navigation className="h-5 w-5 text-[#159895]" />
              Directions
            </a>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Share2 className="h-5 w-5 text-[#159895]" />
              Share
            </button>
          </div>

          <dl className="space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-[#159895]" />
                Location
              </dt>
              <dd className="text-right font-medium text-gray-900">{story.location}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4 shrink-0 text-[#159895]" />
                Duration
              </dt>
              <dd className="font-medium text-gray-900">{durationLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Globe className="h-4 w-4 shrink-0 text-[#159895]" />
                Language
              </dt>
              <dd className="font-medium text-gray-900">{activeLanguageLabel(story)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <User className="h-4 w-4 shrink-0 text-[#159895]" />
                Organized by
              </dt>
              <dd className="text-right font-medium text-gray-900">Gamana</dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#159895]" />
            Audio stories play in the Gamana app. Download once and listen with no signal.
          </p>
        </CardContent>
      </Card>

      <DownloadAppDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        source="audio-story-detail"
      />
    </>
  );
}
