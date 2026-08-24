"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Cross-fading photo backdrop for the sitewide hero pattern, replacing the single static
 * image each hero used to carry.
 *
 * Drop-in for the `<Image fill className="object-cover" />` it replaces: it renders the
 * same absolutely-positioned fill images inside whatever `relative`/`absolute inset-0`
 * wrapper the hero already provides, and the colour overlay/scrim stays a sibling on top,
 * so per-page filters are unaffected.
 *
 * Notes:
 *  - Only the first image gets `priority`; the rest are lazy, so the extra photos cost
 *    nothing on first paint and don't compete with LCP.
 *  - Honours prefers-reduced-motion by holding on the first frame — a slow ambient
 *    cross-fade behind text is exactly the kind of motion that setting exists to stop.
 *  - Single-image callers are handled too: the interval never starts.
 */
export function HeroSlideshow({
  images,
  intervalMs = 9000,
  className = "object-cover",
}: {
  images: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  // Only starts rotating once the second image has actually decoded. Without this the
  // first transition can land on a half-loaded photo and read as a flash rather than a
  // fade — the images are large and lazy, so on a slow connection the timer would
  // otherwise fire long before the file is ready.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (images.length < 2 || !ready) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [images.length, intervalMs, ready]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          onLoad={i === 1 ? () => setReady(true) : undefined}
          /* Slower than the quote fade and eased at both ends, so the change registers as
             ambient drift rather than a slideshow advancing. */
          className={`${className} transition-opacity duration-[2200ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* No dot controls: every photo hero on the site is overlapped by a floating card
          (quotes on About, search/trust strip on Explore, stats on Cities/Contact), which
          sat directly on top of them. The rotation is ambient rather than something the
          visitor needs to steer. */}
    </>
  );
}
