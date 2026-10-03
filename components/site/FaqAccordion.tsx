"use client";

import { useId, useState } from "react";
import { Plus } from "@/components/icons";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export type FaqItem = { question: string; answer: string };

type FaqAccordionProps = {
  items: FaqItem[];
  /** Emit FAQPage JSON-LD. Only enable once per page, and only if the page doesn't emit its own. */
  withSchema?: boolean;
  defaultOpen?: number | null;
  className?: string;
};

/**
 * Answers stay in the DOM when collapsed (height-animated, not unmounted) so the
 * full FAQ text is indexable and matches the FAQPage schema.
 */
export function FaqAccordion({ items, withSchema = false, defaultOpen = 0, className }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white shadow-card", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="focus-ring group flex w-full items-center justify-between gap-6 rounded-3xl px-6 py-5 text-left sm:px-8 sm:py-6"
              >
                <span className="text-base font-semibold text-ink sm:text-lg">{item.question}</span>
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
                <p className="px-6 pb-6 leading-relaxed text-ink-soft sm:px-8">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}

      {withSchema && <JsonLd data={faqJsonLd(items)} />}
    </div>
  );
}
