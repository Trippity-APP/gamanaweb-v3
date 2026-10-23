'use client';

import { useEffect, useState } from 'react';
import { AudioWalkDetail } from '@/components/marketplace/AudioWalkDetail';
import { MarketplaceTourDetail } from '@/components/marketplace/MarketplaceTourDetail';
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicWalkDetailById,
} from '@/lib/marketplace-api';
import {
  isStaticSpaParam,
  resolveDetailIdFromPath,
  shouldClientFetchDetail,
} from '@/lib/static-spa';

const TOUR_PATH = /\/(?:explore|marketplace)\/tours\/([^/]+)/;

function resolveTourId(paramId: string): string {
  return resolveDetailIdFromPath(paramId, TOUR_PATH);
}

type ExploreTourDetailClientProps = {
  tourId: string;
  walk: import('@/lib/marketplace-data').WalkDetail | null;
  tour: import('@/lib/marketplace-data').Tour | null;
  relatedTours: import('@/lib/marketplace-data').Tour[];
};

export function ExploreTourDetailClient({
  tourId,
  walk: initialWalk,
  tour: initialTour,
  relatedTours: initialRelatedTours,
}: ExploreTourDetailClientProps) {
  const [walk, setWalk] = useState(initialWalk);
  const [tour, setTour] = useState(initialTour);
  const [relatedTours, setRelatedTours] = useState(initialRelatedTours);
  const [resolving, setResolving] = useState(
    shouldClientFetchDetail(tourId, Boolean(initialWalk || initialTour), TOUR_PATH),
  );

  useEffect(() => {
    if (!shouldClientFetchDetail(tourId, Boolean(initialWalk || initialTour), TOUR_PATH)) {
      setResolving(false);
      return;
    }

    const resolved = resolveTourId(tourId);
    if (isStaticSpaParam(resolved)) {
      setResolving(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setResolving(true);
      try {
        const walkDetail = await fetchPublicWalkDetailById(resolved);
        if (cancelled) return;
        if (walkDetail) {
          setWalk(walkDetail);
          setTour(null);
          return;
        }

        const legacyTour = await fetchPublicTourById(resolved);
        if (cancelled) return;
        setTour(legacyTour);
        setWalk(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tourId, initialWalk, initialTour]);

  const resolvedId = resolveTourId(tourId);

  if (walk?.contentKind === 'walk') {
    return <AudioWalkDetail tourId={resolvedId} walk={walk} />;
  }

  if (resolving) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <MarketplaceTourDetail
      tourId={resolvedId}
      tour={tour}
      relatedTours={relatedTours}
    />
  );
}

export function clearTourDetailCache() {
  clearMarketplaceCache();
}
