import { Suspense } from "react";
import ExploreToMarketplaceRedirect from "../redirect-client";

export default function ExploreStoriesRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to marketplace...
        </div>
      }
    >
      <ExploreToMarketplaceRedirect targetPath="/marketplace/story" />
    </Suspense>
  );
}
