"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** Thin bar under the header that fills as the reader moves through the article. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setProgress(total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-sunset-400 to-sunset-500"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

type TocItem = { id: string; text: string };

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);

/** Builds a contents list from the article's h2s (CMS HTML has no ids, so they are added here). */
export function TableOfContents({ target }: { target: RefObject<HTMLElement | null> }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = target.current;
    if (!root) return;
    const used = new Set<string>();
    const headings = Array.from(root.querySelectorAll("h2")).filter((h) => h.textContent?.trim());
    const next = headings.map((h) => {
      if (!h.id) {
        let id = slugify(h.textContent ?? "") || "section";
        while (used.has(id) || document.getElementById(id)) id = `${id}-${used.size + 1}`;
        h.id = id;
      }
      used.add(h.id);
      h.classList.add("scroll-mt-32");
      return { id: h.id, text: h.textContent!.trim() };
    });
    setItems(next);

    if (typeof IntersectionObserver === "undefined" || headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [target]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="rounded-3xl bg-white p-5 shadow-card">
      <p className="eyebrow mb-3">On this page</p>
      <ol className="max-h-[60vh] space-y-1 overflow-y-auto pr-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "focus-ring block rounded-lg border-l-2 py-1.5 pl-3 leading-snug transition-colors",
                active === item.id
                  ? "border-sunset-500 font-semibold text-ink"
                  : "border-transparent text-ink-muted hover:border-ink/20 hover:text-ink"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
