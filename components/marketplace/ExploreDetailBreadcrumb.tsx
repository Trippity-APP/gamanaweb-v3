'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getExploreBackHref } from '@/lib/explore-search';

export function ExploreDetailBreadcrumb() {
  const pathname = usePathname();
  const href = getExploreBackHref(pathname);

  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#159895] transition-colors hover:text-[#128a86]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to explore
    </Link>
  );
}
