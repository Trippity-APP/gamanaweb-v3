"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/download-app");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to download app...
    </div>
  );
}
