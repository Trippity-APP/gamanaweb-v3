'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ExploreDetailBreadcrumb() {
  return (
    <Link
      href="/explore"
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#159895] transition-colors hover:text-[#128a86]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to explore
    </Link>
  );
}
