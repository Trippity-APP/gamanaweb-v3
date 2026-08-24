"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function StickyDownloadCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-gradient-to-r from-[#1A5F7A] to-[#159895] shadow-2xl border-t border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-white text-sm font-medium hidden sm:block">
          Turn this trip into an audio-guided adventure
        </p>
        <p className="text-white text-sm font-medium sm:hidden">
          Get the Gamana app
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Download Gamana on Google Play"
              className="h-9 w-auto"
            />
          </a>
          <a
            href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download Gamana on the App Store"
              className="h-9 w-auto"
            />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss download banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
