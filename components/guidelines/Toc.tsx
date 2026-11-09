"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu } from "@/components/icons";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Section = { id: string; label: string };

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        const first = ids.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function Links({ sections, active, onNavigate }: { sections: Section[]; active: string; onNavigate?: () => void }) {
  return (
    <ol className="space-y-1">
      {sections.map((s, i) => {
        const isActive = s.id === active;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={onNavigate}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "focus-ring flex min-h-[44px] items-center gap-3 rounded-full px-4 text-sm transition-colors",
                isActive
                  ? "bg-g-info-bg font-semibold text-g-primary-text"
                  : "text-g-fg-muted hover:bg-g-surface hover:text-g-fg"
              )}
            >
              <span className="w-5 font-mono text-xs tabular-nums text-g-fg-subtle">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function Toc({ sections }: { sections: Section[] }) {
  const key = sections.map((s) => s.id).join(",");
  const ids = useMemo(() => key.split(","), [key]);
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const activeLabel = sections.find((s) => s.id === active)?.label;

  return (
    <>
      <nav aria-label="Guidelines sections" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block">
        <p className="eyebrow mb-3 px-4 !text-g-fg-subtle">Sections</p>
        <Links sections={sections} active={active} />
      </nav>

      <div className="sticky top-16 z-30 -mx-4 border-b border-g-border bg-g-bg px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="focus-ring inline-flex min-h-[44px] w-full items-center justify-between gap-3 rounded-full border border-g-border bg-g-card px-4 text-sm font-medium text-g-fg"
            >
              <span>
                Sections<span className="text-g-fg-subtle">{activeLabel ? ` · ${activeLabel}` : ""}</span>
              </span>
              <Menu size={18} aria-hidden="true" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            data-guidelines=""
            className="w-[300px] overflow-y-auto border-g-border bg-g-bg text-g-fg"
          >
            <SheetTitle className="mb-4 text-g-fg">Sections</SheetTitle>
            <nav aria-label="Guidelines sections (mobile)">
              <Links sections={sections} active={active} onNavigate={() => setOpen(false)} />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
