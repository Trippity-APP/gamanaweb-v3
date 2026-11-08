"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TYPING = /^(INPUT|TEXTAREA|SELECT)$/;

/** 12-column overlay on the site container; press G (outside form fields) to toggle. */
export function GridOverlay() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key.toLowerCase() !== "g" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (TYPING.test(target.tagName) || target.isContentEditable) return;
      setOn((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-g-border-strong px-5 text-sm font-semibold text-g-fg"
      >
        Grid overlay: {on ? "on" : "off"} <kbd className="rounded border border-g-border px-1.5 font-mono text-xs">G</kbd>
      </button>
      <div aria-hidden="true" className={cn("pointer-events-none fixed inset-0 z-50", on ? "block" : "hidden")}>
        <div className="container-site grid h-full grid-cols-4 gap-4 sm:gap-6 md:grid-cols-8 lg:grid-cols-12 lg:gap-8">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={cn("h-full bg-g-error opacity-10", i >= 4 && "hidden md:block", i >= 8 && "md:hidden lg:block")}
            />
          ))}
        </div>
      </div>
    </>
  );
}
