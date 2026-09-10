import { Suspense } from "react";
import MarketplaceRedesignRedirectPage from "./redirect-client";

export default function MarketplaceRedesignPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to marketplace...
        </div>
      }
    >
      <MarketplaceRedesignRedirectPage />
    </Suspense>
  );
}
