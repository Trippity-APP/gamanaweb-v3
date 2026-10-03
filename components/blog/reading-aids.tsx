"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";
import type { ArticleBlock } from "@/content/blog/types";

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
    .replace(/&[a-z0-9#]+;/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);

/**
 * Gives every h2 a stable id in the rendered markup. Ids must be part of the HTML React renders:
 * ids patched onto the DOM afterwards are wiped whenever React re-renders the article.
 */
export function withHeadingIds(blocks: ArticleBlock[]): { blocks: ArticleBlock[]; headingIds: Record<number, string> } {
  const used = new Set<string>();
  const unique = (text: string) => {
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };
  const headingIds: Record<number, string> = {};
  const next = blocks.map((block, index) => {
    if (block.type === "heading" && block.level === 2) {
      headingIds[index] = unique(block.content);
      return block;
    }
    if (block.type !== "html") return block;
    const content = block.content.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, attrs = "", inner: string) => {
      const existing = /\sid=["']([^"']+)["']/i.exec(attrs);
      if (existing) {
        used.add(existing[1]);
        return match;
      }
      if (!inner.replace(/<[^>]+>/g, "").trim()) return match;
      return `<h2 id="${unique(inner)}"${attrs}>${inner}</h2>`;
    });
    return content === block.content ? block : { ...block, content };
  });
  return { blocks: next, headingIds };
}

/** Contents list built from the article's h2s; ids come from `withHeadingIds`. */
export function TableOfContents({ target }: { target: RefObject<HTMLElement | null> }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = target.current;
    if (!root) return;
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    // Re-collect when React replaces article nodes, so the active-section observer never watches detached headings.
    const collect = () => {
      frame = 0;
      const headings = Array.from(root.querySelectorAll<HTMLHeadingElement>("h2[id]")).filter((h) => h.textContent?.trim());
      setItems((prev) => {
        const next = headings.map((h) => ({ id: h.id, text: h.textContent!.trim() }));
        return prev.length === next.length && prev.every((p, i) => p.id === next[i].id && p.text === next[i].text) ? prev : next;
      });
      observer?.disconnect();
      if (typeof IntersectionObserver === "undefined" || headings.length === 0) return;
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: "-120px 0px -65% 0px" }
      );
      headings.forEach((h) => observer!.observe(h));
    };

    collect();
    const mutations = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(collect);
    });
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [target]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="rounded-3xl bg-white p-5 shadow-card">
      <p className="eyebrow mb-3">On this page</p>
      <ol className="max-h-[calc(100vh-17rem)] space-y-1 overflow-y-auto pr-1 text-sm">
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
