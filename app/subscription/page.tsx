"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Legacy static subscription plans page — permanently redirected to /pricing
 * (dynamic Gamana Coins packs + Razorpay).
 */
export default function SubscriptionRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pricing/");
  }, [router]);

  return (
    <main className="min-h-[50vh] flex items-center justify-center px-4">
      <p className="text-sm text-gray-600">
        Subscription plans have moved.{" "}
        <Link href="/pricing/" className="font-semibold text-[#159895] hover:underline">
          Go to Pricing
        </Link>
        …
      </p>
    </main>
  );
}
