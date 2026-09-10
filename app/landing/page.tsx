import { Suspense } from "react";
import LandingRedirectPage from "./redirect-client";

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
          Redirecting to download app...
        </div>
      }
    >
      <LandingRedirectPage />
    </Suspense>
  );
}
