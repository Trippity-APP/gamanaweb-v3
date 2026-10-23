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
import {
  clearMarketplaceCache,
  fetchPublicWalkDetailById,
} from '@/lib/marketplace-api';
import type { WalkDetail } from '@/lib/marketplace-data';
import {
  isStaticSpaParam,
  resolveDetailIdFromPath,
  shouldClientFetchDetail,
} from '@/lib/static-spa';
import { useAuth } from '@/lib/auth/auth-context';
import { daysLeft, useLibrary } from '@/lib/library/library-context';

const TOUR_PATH = /\/(?:explore|marketplace)\/tours\/([^/]+)/;

function resolveTourId(paramId: string): string {
  return resolveDetailIdFromPath(paramId, TOUR_PATH);
}

type AudioWalkDetailProps = {
  tourId: string;
  walk: WalkDetail | null;
};

export function AudioWalkDetail({ tourId: paramTourId, walk: initialWalk }: AudioWalkDetailProps) {
  const pathname = usePathname();
  const backHref = getExploreBackHref(pathname);
  const [walk, setWalk] = useState<WalkDetail | null>(initialWalk);
  const needsFetch = shouldClientFetchDetail(paramTourId, Boolean(initialWalk), TOUR_PATH);
  const [loading, setLoading] = useState(needsFetch);
  const [error, setError] = useState<string | null>(
    initialWalk || needsFetch ? null : 'This walk is not available.',
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

  // Pre-rendered pages carry image and audio SAS URLs signed at build time, which expire after 24h.
  useEffect(() => {
    if (!initialWalk) return;
    let cancelled = false;
    fetchPublicWalkDetailById(initialWalk.id)
      .then((fresh) => {
        if (!cancelled && fresh) setWalk(fresh);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initialWalk]);

  useEffect(() => {
    if (!shouldClientFetchDetail(paramTourId, Boolean(initialWalk), TOUR_PATH)) return;
    const resolved = resolveTourId(paramTourId);
    if (isStaticSpaParam(resolved)) {
      setLoading(false);
      setError('This walk is not available.');
      return;
    }
    void loadWalkById(resolved);
  }, [paramTourId, initialWalk]);

  const { status: authStatus } = useAuth();
  const library = useLibrary();
  const unlock = walk && authStatus === 'authenticated' ? library.find('storylist', walk.id) : undefined;
  const unlockState = useMemo(
    () => (walk?.price === 0 ? ('free' as const) : unlock ? ('unlocked' as const) : ('locked' as const)),
    [walk, unlock],
  );
  const unlockDays = unlock ? daysLeft(unlock) : null;

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

        <AudioWalkHero walk={walk} unlockState={unlockState} daysLeft={unlockDays} />

        {/* Action card visible on mobile/tablet before route */}
        <div className="mt-6 lg:hidden">
          <AudioWalkActionCard walk={walk} />
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <TourRouteTimeline stops={walk.stops} />

          <aside className="hidden lg:sticky lg:top-32 lg:block">
            <AudioWalkActionCard walk={walk} />
          </aside>
        </div>
      </div>

      <AudioWalkMobileCTA />
    </>
  );
}
