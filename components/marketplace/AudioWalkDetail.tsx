'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ExploreDetailBreadcrumb } from '@/components/marketplace/ExploreDetailBreadcrumb';
import { getExploreBackHref } from '@/lib/explore-search';
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
import { isStaticSpaParam } from '@/lib/static-spa';

const ACCESS_WINDOW_DAYS = 30;

function resolveTourId(paramId: string): string {
  if (!isStaticSpaParam(paramId)) return paramId;
  if (typeof window === 'undefined') return paramId;
  const match = window.location.pathname.match(/\/(?:explore|marketplace)\/tours\/([^/]+)/);
  return match?.[1] ?? paramId;
}

function isObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
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
  const pathname = usePathname();
  const backHref = getExploreBackHref(pathname);
  const [walk, setWalk] = useState<WalkDetail | null>(initialWalk);
  const [loading, setLoading] = useState(
    !initialWalk && (isStaticSpaParam(paramTourId) || isObjectId(paramTourId)),
  );
  const [error, setError] = useState<string | null>(
    initialWalk
      ? null
      : isStaticSpaParam(paramTourId) || isObjectId(paramTourId)
        ? null
        : 'This walk is not available.',
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
    if (initialWalk) return;
    const resolved = resolveTourId(paramTourId);
    if (isStaticSpaParam(resolved)) return;
    if (!isStaticSpaParam(paramTourId) && !isObjectId(resolved)) return;
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
    if (isStaticSpaParam(resolved)) return;
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
        <p className="text-ink-muted">{error ?? 'Walk not found.'}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href={backHref}>Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-site pb-28 pt-6 sm:pt-8 lg:pb-12">
        <ExploreDetailBreadcrumb title={walk.title} />

        <AudioWalkHero walk={walk} unlockState={unlockState} daysLeft={daysLeft} />

        {/* Action card visible on mobile/tablet before route */}
        <div className="mt-6 lg:hidden">
          <AudioWalkActionCard
            walk={walk}
            unlockState={unlockState}
            daysLeft={daysLeft}
          />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <TourRouteTimeline stops={walk.stops} />

          <aside className="hidden lg:sticky lg:top-32 lg:block">
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
