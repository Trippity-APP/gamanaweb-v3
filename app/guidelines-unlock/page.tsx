import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "@/components/icons";
import { UnlockForm } from "@/components/guidelines/UnlockForm";
import { BRAND_OWNER_EMAIL, BRAND_OWNER_NAME } from "@/lib/guidelines/config";

export const metadata: Metadata = {
  title: { absolute: "Unlock brand guidelines | Gamana" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: null,
  openGraph: null,
  twitter: null,
  other: { "gmn-analytics": "off" },
};

export default function GuidelinesUnlockPage() {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-sand-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="focus-ring mx-auto mb-8 flex w-fit rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gamana-logo.svg" alt="Gamana home" className="h-9 w-auto" />
        </Link>
        <div className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <p className="eyebrow mt-6">Internal</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Brand guidelines</h1>
          <p className="mt-2 text-ink-soft">Enter the password to view Gamana&apos;s brand guidelines and assets.</p>
          <UnlockForm />
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          Need access? Ask{" "}
          <a
            href={`mailto:${BRAND_OWNER_EMAIL}?subject=${encodeURIComponent("Brand guidelines access")}`}
            className="focus-ring rounded font-semibold text-brand-700 underline-offset-2 hover:text-brand-800 hover:underline"
          >
            {BRAND_OWNER_NAME.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
