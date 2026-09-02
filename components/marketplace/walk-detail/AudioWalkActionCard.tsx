'use client';

import { useState } from 'react';
import { CirclePlay, Clock, MapPin, Smartphone, User } from 'lucide-react';
import { DownloadAppDialog } from '@/components/DownloadAppDialog';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatWalkDurationLabel } from '@/lib/marketplace-api';
import type { WalkDetail } from '@/lib/marketplace-data';

type UnlockState = 'free' | 'unlocked' | 'locked';

type AudioWalkActionCardProps = {
  walk: WalkDetail;
  unlockState: UnlockState;
  daysLeft?: number | null;
  className?: string;
};

export function AudioWalkActionCard({
  walk,
  unlockState,
  daysLeft,
  className = '',
}: AudioWalkActionCardProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const durationLabel = formatWalkDurationLabel(walk);

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
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {daysLeft}d left
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GamanaCoinIcon className="h-5 w-5" aria-hidden />
                <p className="text-xl font-bold text-gray-900">{walk.price} Coins</p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {unlockState === 'locked'
                ? 'Unlock in the Gamana app with the same account.'
                : 'Open in the Gamana app to start walking and listen offline.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setDownloadOpen(true)}
            className="h-12 w-full rounded-xl bg-[#1A5F7A] text-base font-semibold text-white hover:bg-[#164e63]"
          >
            <CirclePlay className="mr-2 h-5 w-5" />
            Start Walking Tour
          </Button>

          <dl className="space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-[#159895]" />
                Location
              </dt>
              <dd className="text-right font-medium text-gray-900">{walk.location}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-[#159895]" />
                Stops
              </dt>
              <dd className="font-medium text-gray-900">
                {walk.stopsCount} stop{walk.stopsCount === 1 ? '' : 's'}
              </dd>
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
                <User className="h-4 w-4 shrink-0 text-[#159895]" />
                Organized by
              </dt>
              <dd className="text-right font-medium text-gray-900">Gamana</dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#159895]" />
            Audio walks play in the Gamana app. Download once and listen with no signal.
          </p>
        </CardContent>
      </Card>

      <DownloadAppDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        source="audio-walk-detail"
      />
    </>
  );
}
