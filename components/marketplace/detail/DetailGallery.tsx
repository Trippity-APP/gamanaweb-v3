'use client';

import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
import { cn } from '@/lib/utils';

type GalleryImage = { src: string; alt: string };

/** Gallery header: the cover fills the frame, with up to two supporting photos beside it on desktop. */
export function DetailGallery({ cover, extras = [] }: { cover: GalleryImage; extras?: GalleryImage[] }) {
  const side = extras.filter((e) => e.src && !isPlaceholderTourImage(e.src) && e.src !== cover.src).slice(0, 2);
  const hasSide = side.length === 2;

  return (
    <div
      className={cn(
        'grid h-[240px] gap-2 overflow-hidden rounded-4xl bg-sand-100 shadow-card sm:h-[340px] sm:gap-3 lg:h-[420px]',
        hasSide && 'lg:grid-cols-4 lg:grid-rows-2'
      )}
    >
      <div className={cn('relative', hasSide && 'lg:col-span-3 lg:row-span-2')}>
        {isPlaceholderTourImage(cover.src) ? (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-700/25 via-brand-500/15 to-sand-100" />
        ) : (
          <MarketplaceCoverImage src={cover.src} alt={cover.alt} fill priority useDefaultFallback={false} className="object-cover" />
        )}
      </div>
      {hasSide &&
        side.map((img) => (
          <div key={img.src} className="relative hidden lg:block">
            <MarketplaceCoverImage src={img.src} alt={img.alt} fill useDefaultFallback={false} className="object-cover" />
          </div>
        ))}
    </div>
  );
}

/** "Narrated by" pill with an initial avatar. */
export function NarratorChip({ label, name }: { label: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3.5 text-sm text-ink-soft shadow-card">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white" aria-hidden>
        {name.trim().charAt(0).toUpperCase() || 'G'}
      </span>
      <span>
        {label} <span className="font-semibold text-ink">{name}</span>
      </span>
    </span>
  );
}
