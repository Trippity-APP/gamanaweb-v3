import { Suspense } from "react";
import MarketplaceRedirectPage from "./redirect-client";

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to explore...
        </div>
      }
    >
      <MarketplaceRedirectPage />
    </Suspense>
  );
}
