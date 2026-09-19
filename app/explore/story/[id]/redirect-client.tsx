"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExploreStoryDetailRedirect({ storyId }: { storyId: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/marketplace/story/${encodeURIComponent(storyId)}`);
  }, [router, storyId]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to marketplace...
    </div>
  );
}
