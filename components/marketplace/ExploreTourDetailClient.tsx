'use client';

import { useEffect, useState } from 'react';
import { AudioWalkDetail } from '@/components/marketplace/AudioWalkDetail';
import { MarketplaceTourDetail } from '@/components/marketplace/MarketplaceTourDetail';
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicWalkDetailById,
} from '@/lib/marketplace-api';
import type { Tour, WalkDetail } from '@/lib/marketplace-data';

function resolveTourId(paramId: string): string {
  if (paramId !== '[id]') return paramId;
  if (typeof window === 'undefined') return paramId;
  const match = window.location.pathname.match(/\/(?:explore|marketplace)\/tours\/([^/]+)/);
  return match?.[1] ?? paramId;
}

type ExploreTourDetailClientProps = {
  tourId: string;
  walk: WalkDetail | null;
  tour: Tour | null;
  relatedTours: Tour[];
};

export function ExploreTourDetailClient({
  tourId,
  walk: initialWalk,
  tour: initialTour,
  relatedTours: initialRelatedTours,
}: ExploreTourDetailClientProps) {
  const [walk, setWalk] = useState<WalkDetail | null>(initialWalk);
  const [tour, setTour] = useState<Tour | null>(initialTour);
  const [relatedTours, setRelatedTours] = useState(initialRelatedTours);
  const [resolving, setResolving] = useState(
    tourId === '[id]' && !initialWalk && !initialTour
  );

  useEffect(() => {
    if (tourId !== '[id]' || initialWalk || initialTour) return;

    const resolved = resolveTourId(tourId);
    if (resolved === '[id]') return;

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

        const storyTour = await fetchPublicTourById(resolved);
        if (cancelled) return;
        setTour(storyTour);
        setWalk(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tourId, initialWalk, initialTour]);

  if (walk?.contentKind === 'walk') {
    return <AudioWalkDetail tourId={tourId} walk={walk} />;
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
      tourId={tourId}
      tour={tour}
      relatedTours={relatedTours}
    />
  );
}

export function clearTourDetailCache() {
  clearMarketplaceCache();
}
