"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion, useInView } from "@/hooks/use-in-view";

/**
 * Counts a stat like "700+" up from zero when it enters the viewport. The final
 * value is what's server-rendered, so crawlers and no-JS visitors see real numbers.
 */
export function CountUp({ value, duration = 1400, className }: { value: string; duration?: number; className?: string }) {
  const match = value.match(/^(\D*)([\d,.]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, "")) : NaN;
  const [display, setDisplay] = useState(value);
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.6 });

  useEffect(() => {
    if (!inView || !match || Number.isNaN(target) || prefersReducedMotion()) return;
    const [, prefix, , suffix] = match;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(`${prefix}${Math.round(target * eased).toLocaleString("en-US")}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
