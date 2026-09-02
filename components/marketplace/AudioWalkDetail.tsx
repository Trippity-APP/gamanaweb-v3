'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExploreDetailBreadcrumb } from '@/components/marketplace/ExploreDetailBreadcrumb';
import {
  AudioWalkHero,
} from '@/components/marketplace/walk-detail/AudioWalkHero';
import { AudioWalkActionCard } from '@/components/marketplace/walk-detail/AudioWalkActionCard';
import { AudioWalkMobileCTA } from '@/components/marketplace/walk-detail/AudioWalkMobileCTA';
import { TourRouteTimeline } from '@/components/marketplace/walk-detail/TourRouteTimeline';
import { useAccount } from '@/lib/account-context';
import {
  clearMarketplaceCache,
  fetchPublicWalkDetailById,
} from '@/lib/marketplace-api';
import type { WalkDetail } from '@/lib/marketplace-data';

const ACCESS_WINDOW_DAYS = 30;

function resolveTourId(paramId: string): string {
  if (paramId !== '[id]') return paramId;
  if (typeof window === 'undefined') return paramId;
  const match = window.location.pathname.match(/\/(?:explore|marketplace)\/tours\/([^/]+)/);
  return match?.[1] ?? paramId;
}

function getDaysLeft(unlockedAt: string): number {
  const expiry = new Date(unlockedAt);
  expiry.setDate(expiry.getDate() + ACCESS_WINDOW_DAYS);
  const diff = expiry.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

type AudioWalkDetailProps = {
  tourId: string;
  walk: WalkDetail | null;
};

export function AudioWalkDetail({ tourId: paramTourId, walk: initialWalk }: AudioWalkDetailProps) {
  const { isUnlocked, unlockedItems } = useAccount();
  const [walk, setWalk] = useState<WalkDetail | null>(initialWalk);
  const [loading, setLoading] = useState(paramTourId === '[id]' && !initialWalk);
  const [error, setError] = useState<string | null>(
    initialWalk ? null : paramTourId === '[id]' ? null : 'This walk is not available.'
  );

  const loadWalkById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchPublicWalkDetailById(id);
      if (!detail) {
        setWalk(null);
        setError('This walk is not available.');
        return;
      }
      setWalk(detail);
    } catch {
      setWalk(null);
      setError("We couldn't load this walk right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialWalk || paramTourId !== '[id]') return;
    const resolved = resolveTourId(paramTourId);
    if (resolved === '[id]') return;
    void loadWalkById(resolved);
  }, [paramTourId, initialWalk]);

  const unlockState = useMemo(() => {
    if (!walk) return 'locked' as const;
    if (walk.price === 0) return 'free' as const;
    if (isUnlocked(walk.id, 'tour')) return 'unlocked' as const;
    return 'locked' as const;
  }, [walk, isUnlocked]);

  const daysLeft = useMemo(() => {
    if (!walk || unlockState !== 'unlocked') return null;
    const unlocked = unlockedItems.find((item) => item.id === walk.id && item.type === 'tour');
    if (!unlocked?.unlockedAt) return null;
    return getDaysLeft(unlocked.unlockedAt);
  }, [walk, unlockState, unlockedItems]);

  const retry = () => {
    clearMarketplaceCache();
    const resolved = resolveTourId(paramTourId);
    if (resolved === '[id]') return;
    void loadWalkById(resolved);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
        <ExploreDetailBreadcrumb />
        <TourRouteTimeline stops={[]} loading />
      </div>
    );
  }

  if (error || !walk) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-gray-500">{error ?? 'Walk not found.'}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/explore">Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        <ExploreDetailBreadcrumb />

        <AudioWalkHero walk={walk} unlockState={unlockState} daysLeft={daysLeft} />

        {/* Action card visible on mobile/tablet before route */}
        <div className="mt-6 lg:hidden">
          <AudioWalkActionCard
            walk={walk}
            unlockState={unlockState}
            daysLeft={daysLeft}
          />
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <TourRouteTimeline stops={walk.stops} />

          <aside className="hidden lg:block lg:sticky lg:top-24">
            <AudioWalkActionCard
              walk={walk}
              unlockState={unlockState}
              daysLeft={daysLeft}
            />
          </aside>
        </div>
      </div>

      <AudioWalkMobileCTA />
    </>
  );
}
