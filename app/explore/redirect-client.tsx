"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Legacy /explore bookmark → /marketplace */
export default function ExploreToMarketplaceRedirect({
  targetPath = "/marketplace",
}: {
  targetPath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `${targetPath}?${query}` : targetPath);
  }, [router, searchParams, targetPath]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to marketplace...
    </div>
  );
}
