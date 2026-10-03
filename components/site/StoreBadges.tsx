"use client";

import { cn } from "@/lib/utils";
import { STORE_URLS, trackStoreClick } from "@/lib/analytics";
import type { StoreBadgeLabels } from "@/lib/data/nav-config";

const BADGES = {
  play: {
    src: "/badges/google-play-badge.svg",
    store: "Google Play",
    width: 180,
    height: 53,
  },
  apple: {
    src: "/badges/app-store-badge.svg",
    store: "the App Store",
    width: 135,
    height: 40,
  },
} as const;

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/ (On|The|And|Of|In|For)\b/g, (m) => m.toLowerCase());

type StoreBadgesProps = {
  /** Analytics source, e.g. "home_hero". */
  source: string;
  /** Keyword used in alt/title, e.g. "travel guide app" → "Download Gamana travel guide app on Google Play". */
  keyword?: string;
  /** Exact alt/title per store; overrides `keyword`. */
  labels?: StoreBadgeLabels;
  size?: "md" | "lg";
  /** Load eagerly for above-the-fold placements. */
  priority?: boolean;
  className?: string;
};

export function StoreBadges({ source, keyword = "app", labels, size = "md", priority = false, className }: StoreBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {(Object.keys(BADGES) as (keyof typeof BADGES)[]).map((key) => {
        const badge = BADGES[key];
        const alt = labels?.[key].alt ?? `Download Gamana ${keyword} on ${badge.store}`;
        const title = labels?.[key].title ?? titleCase(alt);
        return (
          <a
            key={key}
            href={STORE_URLS[key]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackStoreClick(key, source)}
            className="focus-ring rounded-xl transition-transform duration-300 ease-spring hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.src}
              alt={alt}
              title={title}
              width={badge.width}
              height={badge.height}
              className={cn("w-auto", size === "lg" ? "h-14" : "h-12")}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
            />
          </a>
        );
      })}
    </div>
  );
}
