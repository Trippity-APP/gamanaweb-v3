"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "@/components/icons";

const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

/** `/place/{id}` is the app's share link; without the app installed it lands here. */
export function PlaceRedirectClient() {
  const router = useRouter();
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.match(/\/place\/([^/]+)/)?.[1] ?? "";
    if (!SAFE_ID.test(id) || id === "__spa__") {
      setInvalid(true);
      return;
    }
    router.replace(`/marketplace/story/${id}/?via=app_link`);
  }, [router]);

  return (
    <main className="grid min-h-[60vh] place-items-center bg-sand-50 px-4">
      {invalid ? (
        <div className="text-center">
          <h1 className="text-h3 text-ink">This link doesn&apos;t look right</h1>
          <p className="mt-2 text-ink-soft">Ask the sender for a new link, or browse stories instead.</p>
          <Link
            href="/marketplace/story/"
            className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-6 font-semibold text-white"
          >
            Browse audio stories
          </Link>
        </div>
      ) : (
        <p role="status" className="flex items-center gap-2 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          Opening story…
        </p>
      )}
    </main>
  );
}
