"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";

type CardRailProps = {
  children: ReactNode;
  /** Accessible name for the scroll region, e.g. "Featured cities". */
  label: string;
  className?: string;
};

/**
 * Horizontal scroll-snap rail (Klook/GetYourGuide style). Native scrolling, so it
 * works with touch, trackpad and keyboard; arrows are a desktop enhancement.
 */
export function CardRail({ children, label, className }: CardRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const arrow = "focus-ring absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lift transition-all duration-300 ease-out-expo hover:scale-105 disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div className={cn("relative", className)}>
      <button type="button" aria-label="Scroll left" onClick={() => scroll(-1)} disabled={edges.start} className={cn(arrow, "-left-5")}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="focus-ring -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden [&>*]:snap-start [&>*]:shrink-0"
      >
        {children}
      </div>
      <button type="button" aria-label="Scroll right" onClick={() => scroll(1)} disabled={edges.end} className={cn(arrow, "-right-5")}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
