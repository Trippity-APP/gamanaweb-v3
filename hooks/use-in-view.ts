"use client";

import { useEffect, useRef, useState } from "react";

type Callback = (entry: IntersectionObserverEntry) => void;

// One observer per option-set keeps dozens of reveal sections cheap.
const observers = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, Callback> }>();

function getObserver(rootMargin: string, threshold: number) {
  const key = `${rootMargin}|${threshold}`;
  let entry = observers.get(key);
  if (!entry) {
    const callbacks = new Map<Element, Callback>();
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => callbacks.get(e.target)?.(e)),
      { rootMargin, threshold }
    );
    entry = { observer, callbacks };
    observers.set(key, entry);
  }
  return entry;
}

export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.15,
}: { once?: boolean; rootMargin?: string; threshold?: number } = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const { observer, callbacks } = getObserver(rootMargin, threshold);
    callbacks.set(node, (e) => {
      if (e.isIntersecting) {
        setInView(true);
        if (once) {
          observer.unobserve(node);
          callbacks.delete(node);
        }
      } else if (!once) {
        setInView(false);
      }
    });
    observer.observe(node);
    return () => {
      observer.unobserve(node);
      callbacks.delete(node);
    };
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
