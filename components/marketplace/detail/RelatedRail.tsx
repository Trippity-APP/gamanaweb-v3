'use client';

import { CardRail } from '@/components/site/CardRail';
import { CatalogCard } from '@/components/marketplace/CatalogCard';
import type { Tour } from '@/lib/marketplace-data';

/** "More in this city" rail under tour and story pages. */
export function RelatedRail({ title, tours }: { title: string; tours: Tour[] }) {
  if (tours.length === 0) return null;

  return (
    <section className="section-tight border-t border-ink/5 bg-white">
      <div className="container-site">
        <h2 className="text-h3 mb-6 text-ink">{title}</h2>
        <CardRail label={title}>
          {tours.map((tour, index) => (
            <div key={tour.id} className="w-[16rem] sm:w-[18rem]">
              <CatalogCard tour={tour} index={index} />
            </div>
          ))}
        </CardRail>
      </div>
    </section>
  );
}
