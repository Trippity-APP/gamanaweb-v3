"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MarketplaceRedesignRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/marketplace?${query}` : "/marketplace");
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to marketplace...
    </div>
  );
}
