"use client";

import type { MouseEvent } from "react";

/** Pages render their own <main> without a shared id, so focus the first one on activation. */
export function SkipLink() {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector("main");
    if (!main) return;
    e.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView();
  };

  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:outline-none focus:ring-2 focus:ring-brand-400"
    >
      Skip to content
    </a>
  );
}
