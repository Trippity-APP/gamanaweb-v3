"use client";

import { useEffect, useState } from "react";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { CardRail } from "@/components/site/CardRail";
import { SectionHeader } from "@/components/site/SectionHeader";
import type { ExperienceSummary } from "@/lib/api/schemas/experiences";
import { listExperiences, type ExperienceListQuery } from "@/lib/experiences/api";
import { cn } from "@/lib/utils";

type ExperiencesRailProps = {
  title: string;
  eyebrow?: string;
  lead?: string;
  query: ExperienceListQuery;
  /** Tried when `query` returns nothing, e.g. featured → everything. */
  fallbackQuery?: ExperienceListQuery;
  seeAllHref: string;
  excludeId?: string;
  className?: string;
};

/** Client-side experience shelf for cross-links. Renders nothing until it has cards. */
export function ExperiencesRail({
  title,
  eyebrow,
  lead,
  query,
  fallbackQuery,
  seeAllHref,
  excludeId,
  className,
}: ExperiencesRailProps) {
  const [items, setItems] = useState<ExperienceSummary[]>([]);
  const queryKey = JSON.stringify(query);
  const fallbackKey = JSON.stringify(fallbackQuery ?? null);

  useEffect(() => {
    const controller = new AbortController();
    const primary: ExperienceListQuery = JSON.parse(queryKey);
    const fallback: ExperienceListQuery | null = JSON.parse(fallbackKey);
    const usable = (list: ExperienceSummary[]) => list.filter((item) => item.slug && item.id !== excludeId);

    void (async () => {
      try {
        let found = usable((await listExperiences(primary, controller.signal)).items);
        if (!found.length && fallback) {
          found = usable((await listExperiences(fallback, controller.signal)).items);
        }
        setItems(found.slice(0, primary.page_size ?? 12));
      } catch {
        if (!controller.signal.aborted) setItems([]);
      }
    })();
    return () => controller.abort();
  }, [queryKey, fallbackKey, excludeId]);

  if (!items.length) return null;

  return (
    <section className={cn("section-tight border-t border-ink/5 bg-white", className)}>
      <div className="container-site">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          align="left"
          action={{ href: seeAllHref, label: "See all" }}
          className="mb-6 sm:mb-8"
        />
        <CardRail label={title}>
          {items.map((item, index) => (
            <div key={item.id} className="w-[280px] sm:w-[320px]">
              <ExperienceCard experience={item} position={index + 1} />
            </div>
          ))}
        </CardRail>
      </div>
    </section>
  );
}
