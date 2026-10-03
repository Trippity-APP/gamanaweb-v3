"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "@/components/icons";

const DISMISSED_KEY = "gamana_side_cta_dismissed";

/**
 * The "Get App" panel of the right-edge rail. Positioning lives in the rail wrapper
 * (components/side-rail.tsx) rather than here, so this panel and the Feedback button
 * stack in one column instead of overlapping each other at right-0 top-1/2 — which is
 * exactly what they used to do.
 */
export default function GlobalStickyDownload() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISSED_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  // Tour, story and blog post pages carry their own sticky app prompt.
  const hasOwnAppCard =
    /^\/(marketplace\/(tours|story)|blog|cities)\/[^/]+/.test(pathname ?? "") || /^\/download-app\/?$/.test(pathname ?? "");
  if (dismissed || !visible || hasOwnAppCard) return null;

  return (
    <div className="relative hidden sm:flex flex-col items-center gap-3 bg-white/95 backdrop-blur-sm border border-gray-200 border-r-0 rounded-l-xl shadow-lg px-2.5 py-4">
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -left-2 p-1 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
        aria-label="Dismiss download widget"
      >
        <X className="h-3 w-3" />
      </button>

      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1A5F7A] whitespace-nowrap">
        Get App
      </span>

      <a
        href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform"
      >
        <img
          src="/badges/google-play-badge.svg"
          alt="Download Gamana on Google Play"
          className="w-[110px] h-auto"
        />
      </a>

      <a
        href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform"
      >
        <img
          src="/badges/app-store-badge.svg"
          alt="Download Gamana on the App Store"
          className="w-[110px] h-auto"
        />
      </a>
    </div>
  );
}
