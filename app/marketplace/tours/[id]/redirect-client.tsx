"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketplaceTourRedirectPage({ tourId }: { tourId: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/explore/tours/${encodeURIComponent(tourId)}`);
  }, [router, tourId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to explore...
    </div>
  );
}
