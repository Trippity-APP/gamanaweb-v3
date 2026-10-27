'use client';

import Link from 'next/link';
import { Lock, MapPin, Smartphone } from '@/components/icons';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { Button } from '@/components/ui/button';
import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
import { UnlockFlow } from '@/components/unlock/UnlockFlow';
import { getTourHref } from '@/lib/marketplace-api';
import { getCatalogAccessBadgeClass, getCatalogAccessBadgeText, isCatalogFree, type Tour } from '@/lib/marketplace-data';
import { cn } from '@/lib/utils';

export type CatalogKind = 'story' | 'walk';

export function catalogKindOf(tour: Pick<Tour, 'contentKind'>): CatalogKind {
  return (tour.contentKind ?? 'walk') === 'story' ? 'story' : 'walk';
}

function CatalogAction({ tour, kind }: { tour: Tour; kind: CatalogKind }) {
  if (isCatalogFree(tour)) {
    return (
      <Button asChild variant="outline" size="sm" className="min-h-11 rounded-full px-4">
        <Link href={getTourHref(tour)} aria-label={`View ${tour.title}`}>
          View
        </Link>
      </Button>
    );
  }

  return (
    <UnlockFlow
      item={{
        kind: kind === 'walk' ? 'storylist' : 'place',
        id: tour.id,
        title: tour.title,
        price: tour.price,
        image: tour.image,
        city: tour.location,
        narrator: tour.narrator,
      }}
      source={kind === 'walk' ? 'explore-walk-unlock' : 'explore-story-unlock'}
    >
      {({ state, start }) =>
        state === 'unlocked' ? (
          <Button size="sm" variant="outline" onClick={start} className="min-h-11 rounded-full px-4">
            <Smartphone className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Open in app
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={start}
            aria-label={`Unlock ${tour.title} for ${tour.price} coins`}
            className="min-h-11 rounded-full bg-ink px-4 text-white hover:bg-black"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Unlock
          </Button>
        )
      }
    </UnlockFlow>
  );
}

/** The marketplace's Audio Story / Audio Tour card, shared by every surface that lists catalog items. */
export function CatalogCard({
  tour,
  kind = catalogKindOf(tour),
  index = 0,
  recommended = false,
  eyebrow,
  className,
}: {
  tour: Tour;
  kind?: CatalogKind;
  index?: number;
  recommended?: boolean;
  /** Overrides the "Recommended for you" / "Special offer" line. */
  eyebrow?: string;
  className?: string;
}) {
  const label = eyebrow ?? (recommended ? 'Recommended for you' : tour.discount ? 'Special offer' : null);
  const labelTone = eyebrow || recommended ? 'text-brand-700' : 'text-red-700';

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <Link href={getTourHref(tour)} className="focus-ring flex flex-1 flex-col rounded-t-3xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
          {kind === 'walk' && isPlaceholderTourImage(tour.image) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100" />
          ) : (
            <MarketplaceCoverImage
              src={tour.image}
              alt={tour.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
              priority={index < 3}
              useDefaultFallback={kind !== 'walk'}
            />
          )}
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getCatalogAccessBadgeClass(tour)}`}
          >
            {tour.price > 0 && <GamanaCoinIcon className="h-3 w-3" aria-hidden />}
            {getCatalogAccessBadgeText(tour)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pb-3">
          {label && <p className={cn('mb-1.5 text-[11px] font-semibold uppercase tracking-wider', labelTone)}>{label}</p>}
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{tour.location}</span>
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">{tour.title}</h3>
          <p className="mt-1.5 text-sm text-ink-muted">
            {tour.duration}
            {' · '}
            {kind === 'walk' ? 'Organized by Gamana' : `Narrated by ${tour.narrator}`}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-ink/5 px-5 py-3.5">
        {tour.price === 0 ? (
          <p className="text-base font-bold text-emerald-700">Free</p>
        ) : (
          <div className="flex items-center gap-1.5">
            <GamanaCoinIcon className="h-4 w-4" aria-hidden />
            <p className="text-base font-bold text-ink">{tour.price}</p>
            <span className="text-sm text-ink-muted">{tour.price === 1 ? 'coin' : 'coins'}</span>
            {tour.originalPrice && <p className="text-xs text-ink-muted line-through">{tour.originalPrice}</p>}
          </div>
        )}
        <CatalogAction tour={tour} kind={kind} />
      </div>
    </article>
  );
}
