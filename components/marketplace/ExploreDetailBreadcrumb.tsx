'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from '@/components/icons';
import { getExploreBackHref } from '@/lib/explore-search';

/** Visible trail for tour and story pages; the matching BreadcrumbList JSON-LD is emitted by the route. */
export function ExploreDetailBreadcrumb({ title }: { title?: string }) {
  const pathname = usePathname();
  const listHref = getExploreBackHref(pathname);
  const listLabel =
    listHref === '/marketplace/tours' ? 'Audio Walks' : listHref === '/marketplace/story' ? 'Audio Stories' : null;

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/marketplace/' },
    ...(listLabel ? [{ label: listLabel, href: `${listHref}/` }] : []),
  ];

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <Link href={c.href} className="focus-ring rounded transition-colors hover:text-brand-700">
              {c.label}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-ink/30" aria-hidden />
          </li>
        ))}
        {title && (
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-ink sm:max-w-md">
            {title}
          </li>
        )}
      </ol>
    </nav>
  );
}
