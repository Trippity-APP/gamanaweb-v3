"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Plus, Search, X } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { FaqSection } from "@/lib/data/faq";

const EMAIL_RE = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;

function withEmailLinks(text: string) {
  return text.split(EMAIL_RE).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={`mailto:${part}`} className="font-semibold text-brand-700 underline-offset-2 hover:underline">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

const matches = (q: string, ...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q));

/**
 * Every question stays in the HTML; search only toggles `hidden`, and collapsed answers are
 * height-animated rather than unmounted, so the page text always matches the FAQPage JSON-LD.
 */
export function FaqExplorer({ sections }: { sections: FaqSection[] }) {
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(`${sections[0].id}-0`);
  const [active, setActive] = useState(sections[0].id);
  const q = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.id,
          s.faqs.map((f) => !q || matches(q, f.question, f.answer, s.title)),
        ])
      ) as Record<string, boolean[]>,
    [sections, q]
  );
  const total = Object.values(visible).flat().filter(Boolean).length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <section className="relative z-10 -mt-12 pb-12 sm:-mt-14">
      <div className="container-site">
        <div className="rounded-4xl border border-ink/5 bg-white p-4 shadow-lift sm:p-5">
          <label htmlFor={`${baseId}-search`} className="sr-only">
            Search questions
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input
              id={`${baseId}-search`}
              type="search"
              value={query}
              onChange={(e) => {
                const next = e.target.value;
                setQuery(next);
                const nq = next.trim().toLowerCase();
                if (!nq) return;
                for (const s of sections) {
                  const i = s.faqs.findIndex((f) => matches(nq, f.question, f.answer, s.title));
                  if (i >= 0) return setOpen(`${s.id}-${i}`);
                }
              }}
              placeholder="Search questions, e.g. offline, refund, languages"
              className="w-full rounded-full border border-ink/10 bg-sand-50 py-4 pl-14 pr-12 text-ink outline-none transition-all duration-300 placeholder:text-ink-muted focus:border-brand-600 focus:bg-white focus:ring-4 focus:ring-brand-600/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="focus-ring absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 animate-pop place-items-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <nav aria-label="FAQ categories" className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300",
                  active === s.id ? "border-brand-700 bg-brand-700 text-white" : "border-ink/10 text-ink-soft hover:border-brand-600 hover:text-brand-700"
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>
          <p className="sr-only" aria-live="polite">
            {q ? `${total} matching question${total === 1 ? "" : "s"}` : ""}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          <nav aria-label="FAQ categories" className="hidden lg:block">
            <ul className="sticky top-28 space-y-1 border-l border-ink/10">
              {sections.map((s) => {
                const count = visible[s.id].filter(Boolean).length;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "focus-ring -ml-px flex items-center justify-between border-l-2 py-2.5 pl-5 pr-2 text-sm font-semibold transition-all duration-300",
                        active === s.id ? "border-brand-600 text-brand-700" : "border-transparent text-ink-soft hover:border-ink/30 hover:text-ink",
                        q && count === 0 && "opacity-40"
                      )}
                    >
                      {s.title}
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", active === s.id ? "bg-brand-50" : "bg-ink/5")}>{count}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-14">
            {sections.map((section) => {
              const shown = visible[section.id];
              return (
                <div key={section.id} id={section.id} hidden={!shown.some(Boolean)} className="scroll-mt-28">
                  <h2 className="mb-5 font-display text-2xl font-bold text-ink sm:text-3xl">{section.title}</h2>
                  <div className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white shadow-card">
                    {section.faqs.map((faq, i) => {
                      const key = `${section.id}-${i}`;
                      const isOpen = open === key;
                      const panelId = `${baseId}-${key}-panel`;
                      const buttonId = `${baseId}-${key}-button`;
                      return (
                        <div key={key} hidden={!shown[i]}>
                          <h3>
                            <button
                              id={buttonId}
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={panelId}
                              onClick={() => setOpen(isOpen ? null : key)}
                              className="focus-ring group flex w-full items-center justify-between gap-6 rounded-3xl px-6 py-5 text-left sm:px-8 sm:py-6"
                            >
                              <span className="text-base font-semibold text-ink sm:text-lg">{faq.question}</span>
                              <span
                                className={cn(
                                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo",
                                  isOpen
                                    ? "rotate-45 border-brand-600 bg-brand-600 text-white"
                                    : "border-ink/15 text-ink-soft group-hover:border-brand-600 group-hover:text-brand-700"
                                )}
                                aria-hidden
                              >
                                <Plus className="h-4 w-4" />
                              </span>
                            </button>
                          </h3>
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            className={cn(
                              "grid transition-[grid-template-rows] duration-500 ease-out-expo",
                              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            )}
                          >
                            <div className="overflow-hidden">
                              <p className="px-6 pb-6 leading-relaxed text-ink-soft sm:px-8">{withEmailLinks(faq.answer)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {q && total === 0 && (
              <div className="animate-fade-in rounded-3xl border border-dashed border-ink/15 bg-white p-10 text-center">
                <p className="font-semibold text-ink">No questions match &ldquo;{query}&rdquo;.</p>
                <p className="mt-2 text-ink-soft">
                  Try another word, or email{" "}
                  <a href="mailto:support@gamana.app" className="font-semibold text-brand-700 hover:underline">
                    support@gamana.app
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
