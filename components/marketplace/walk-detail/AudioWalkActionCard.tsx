'use client';

import { useState } from 'react';
import { CirclePlay, Clock, Lock, MapPin, Smartphone, User } from '@/components/icons';
import { DownloadAppDialog } from '@/components/DownloadAppDialog';
import { UnlockFlow } from '@/components/unlock/UnlockFlow';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { Button } from '@/components/ui/button';
import { StoreBadges } from '@/components/site/StoreBadges';
import { Card, CardContent } from '@/components/ui/card';
import { formatWalkDurationLabel } from '@/lib/marketplace-api';
import type { WalkDetail } from '@/lib/marketplace-data';

type AudioWalkActionCardProps = {
  walk: WalkDetail;
  className?: string;
};

export function AudioWalkActionCard({ walk, className = '' }: AudioWalkActionCardProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const durationLabel = formatWalkDurationLabel(walk);

  return (
    <>
      <Card className={`rounded-3xl border-0 shadow-card ${className}`}>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <p className="eyebrow">Listen in the app</p>
          <UnlockFlow
            item={{ kind: 'storylist', id: walk.id, title: walk.title, price: walk.price, image: walk.image, city: walk.location, narrator: walk.narrator }}
            source="audio-walk-detail"
          >
            {({ state, status, start }) => (
              <>
                <div className="space-y-1">
                  {state === 'free' ? (
                    <p className="text-sm font-semibold text-emerald-700">Free to listen</p>
                  ) : state === 'unlocked' ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-emerald-700">Unlocked in your account</p>
                      {status && (
                        <p className={`flex items-center gap-1 text-xs font-semibold ${status.urgent ? 'text-sunset-600' : 'text-ink-soft'}`}>
                          <Clock className="h-3 w-3" aria-hidden />
                          {status.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <GamanaCoinIcon className="h-5 w-5" aria-hidden />
                      <p className="text-xl font-bold text-ink">{walk.price} Coins</p>
                    </div>
                  )}
                  <p className="text-sm text-ink-muted">
                    {state === 'locked'
                      ? 'Unlock with your coins, then walk it in the Gamana app.'
                      : 'Open in the Gamana app to start walking and listen offline.'}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={state === 'free' ? () => setDownloadOpen(true) : start}
                  className="h-12 w-full rounded-full bg-gradient-to-r from-sunset-400 to-sunset-500 text-base font-semibold text-white shadow-card hover:from-sunset-500 hover:to-sunset-500"
                >
                  {state === 'locked' ? (
                    <>
                      <Lock className="mr-2 h-5 w-5" aria-hidden />
                      Unlock for <GamanaCoinIcon className="mx-1 h-5 w-5" aria-hidden /> {walk.price}
                    </>
                  ) : state === 'unlocked' ? (
                    <>
                      <Smartphone className="mr-2 h-5 w-5" aria-hidden />
                      Open in app
                    </>
                  ) : (
                    <>
                      <CirclePlay className="mr-2 h-5 w-5" aria-hidden />
                      Start Walking Tour
                    </>
                  )}
                </Button>
              </>
            )}
          </UnlockFlow>

          <dl className="space-y-3 border-t border-ink/5 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-muted">
                <MapPin className="h-4 w-4 shrink-0 text-brand-600" weight="fill" />
                Location
              </dt>
              <dd className="text-right font-medium text-ink">{walk.location}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-muted">
                <MapPin className="h-4 w-4 shrink-0 text-brand-600" weight="fill" />
                Stops
              </dt>
              <dd className="font-medium text-ink">
                {walk.stopsCount} stop{walk.stopsCount === 1 ? '' : 's'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-muted">
                <Clock className="h-4 w-4 shrink-0 text-brand-600" weight="fill" />
                Duration
              </dt>
              <dd className="font-medium text-ink">{durationLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-ink-muted">
                <User className="h-4 w-4 shrink-0 text-brand-600" weight="fill" />
                Organized by
              </dt>
              <dd className="text-right font-medium text-ink">Gamana</dd>
            </div>
          </dl>

          <StoreBadges source="audio_walk_detail" keyword="audio tour app" className="gap-2 [&_img]:h-10 [&_img]:w-auto" />

          <p className="flex items-start gap-2 border-t border-ink/5 pt-4 text-xs text-ink-muted">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
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
