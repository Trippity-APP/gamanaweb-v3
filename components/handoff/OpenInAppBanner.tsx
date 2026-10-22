"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Smartphone, X } from "@/components/icons";
import { StoreBadges } from "@/components/site/StoreBadges";
import { Button } from "@/components/ui/button";
import { openInApp } from "@/lib/app-links";

/**
 * Shown on mobile when a visitor arrives from an app share link (`/place/{id}` → `?via=app_link`)
 * that didn't open the app.
 */
export function OpenInAppBanner() {
  const searchParams = useSearchParams();
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    if (searchParams.get("via") !== "app_link") return;
    setPlaceId(window.location.pathname.match(/\/marketplace\/story\/([^/]+)/)?.[1] ?? null);
  }, [searchParams]);

  if (!placeId || dismissed) return null;

  const open = () => {
    openInApp(`https://www.gamana.app/place/${placeId}`);
    window.setTimeout(() => {
      if (document.visibilityState === "visible") setShowBadges(true);
    }, 1200);
  };

  return (
    <div className="border-b border-brand-100 bg-brand-50 md:hidden" role="region" aria-label="Open in the Gamana app">
      <div className="container-site flex items-center gap-3 py-3">
        <Smartphone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <p className="flex-1 text-sm text-ink">Listen to this story in the Gamana app.</p>
        <Button type="button" onClick={open} size="sm" className="h-11 rounded-full bg-gradient-to-r from-brand-600 to-brand-800 px-4 text-white">
          Open in app
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="focus-ring -mr-2 grid h-11 w-11 place-items-center rounded-full text-ink-soft hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {showBadges && (
        <div className="container-site pb-3">
          <StoreBadges source="place_link_banner" keyword="travel app" className="justify-center" />
        </div>
      )}
    </div>
  );
}
