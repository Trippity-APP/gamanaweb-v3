'use client';

import Link from 'next/link';
import { MapPin } from '@/components/icons';
import { CardRail } from '@/components/site/CardRail';
import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
import { getTourHref } from '@/lib/marketplace-api';
import type { Tour } from '@/lib/marketplace-data';

/** "More in this city" rail under tour and story pages. */
export function RelatedRail({ title, tours }: { title: string; tours: Tour[] }) {
  if (tours.length === 0) return null;

  return (
    <section className="section-tight border-t border-ink/5 bg-white">
      <div className="container-site">
        <h2 className="text-h3 mb-6 text-ink">{title}</h2>
        <CardRail label={title}>
          {tours.map((tour) => {
            const isStory = (tour.contentKind ?? 'walk') === 'story';
            return (
              <Link
                key={tour.id}
                href={getTourHref(tour)}
                className="focus-ring group flex w-[16rem] flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-[18rem]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
                  {isPlaceholderTourImage(tour.image) ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100" />
                  ) : (
                    <MarketplaceCoverImage
                      src={tour.image}
                      alt={tour.title}
                      fill
                      useDefaultFallback={isStory}
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-ink shadow-sm">
                    {isStory ? 'Audio Story' : 'Audio Walk'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{tour.location}</span>
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-snug text-ink">{tour.title}</h3>
                  <p className="mt-auto pt-3 text-sm text-ink-muted">{tour.price === 0 ? 'Free' : `${tour.price} coins`} · {tour.duration}</p>
                </div>
              </Link>
            );
          })}
        </CardRail>
      </div>
    </section>
  );
}
