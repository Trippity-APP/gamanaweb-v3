"use client";

import { useEffect, useMemo, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ExperienceFilterOptions } from "@/lib/api/schemas/experiences";
import { languageLabel } from "@/lib/experiences/format";
import {
  DURATION_BUCKETS,
  categoryLabel,
  type DurationBucketId,
  type ExperienceFilters,
} from "@/lib/experiences/filters";
import { cn } from "@/lib/utils";

type PanelProps = {
  filters: ExperienceFilters;
  options: ExperienceFilterOptions | null;
  onChange: (next: ExperienceFilters) => void;
  formatPrice: (n: number) => string;
  className?: string;
};

const SECTIONS = ["price", "duration", "rating", "category", "language", "cancellation"];

export function ExperienceFiltersPanel({ filters, options, onChange, formatPrice, className }: PanelProps) {
  return (
    <div className={className}>
      {options?.featured_available && (
        <label className="flex items-center justify-between gap-3 border-b py-4 text-sm font-medium text-ink">
          Gamana picks only
          <Switch checked={filters.featured} onCheckedChange={(featured) => onChange({ ...filters, featured })} />
        </label>
      )}
      <Accordion type="multiple" defaultValue={SECTIONS}>
        <PriceSection filters={filters} options={options} onChange={onChange} formatPrice={formatPrice} />

        <AccordionItem value="duration">
          <AccordionTrigger className="text-sm font-semibold text-ink">Duration</AccordionTrigger>
          <AccordionContent className="space-y-3">
            {DURATION_BUCKETS.map((bucket) => (
              <CheckRow
                key={bucket.id}
                label={bucket.label}
                checked={filters.durations.includes(bucket.id)}
                onToggle={(on) =>
                  onChange({
                    ...filters,
                    durations: on
                      ? [...filters.durations, bucket.id as DurationBucketId]
                      : filters.durations.filter((d) => d !== bucket.id),
                  })
                }
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        {!!options?.rating.presets.length && (
          <AccordionItem value="rating">
            <AccordionTrigger className="text-sm font-semibold text-ink">Rating</AccordionTrigger>
            <AccordionContent>
              <div role="radiogroup" aria-label="Minimum rating" className="flex flex-wrap gap-2">
                <Pill role="radio" active={filters.ratingMin == null} onClick={() => onChange({ ...filters, ratingMin: undefined })}>
                  Any
                </Pill>
                {options.rating.presets.map((preset) => (
                  <Pill
                    key={preset.id}
                    role="radio"
                    active={filters.ratingMin === preset.min}
                    onClick={() => onChange({ ...filters, ratingMin: preset.min })}
                  >
                    {preset.label ?? `${preset.min}+`} ★
                  </Pill>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {!!options?.categories.length && (
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm font-semibold text-ink">Category</AccordionTrigger>
            <AccordionContent className="flex flex-wrap gap-2">
              {options.categories.map((category) => (
                <Pill
                  key={category}
                  active={filters.category === category}
                  onClick={() => onChange({ ...filters, category: filters.category === category ? "" : category })}
                >
                  {categoryLabel(category)}
                </Pill>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {!!options?.languages.length && (
          <AccordionItem value="language">
            <AccordionTrigger className="text-sm font-semibold text-ink">Language</AccordionTrigger>
            <AccordionContent className="max-h-60 space-y-3 overflow-y-auto">
              {options.languages.map((lang) => (
                <CheckRow
                  key={lang}
                  label={languageLabel(lang) === lang ? lang : `${languageLabel(lang)} (${lang})`}
                  checked={filters.languages.includes(lang)}
                  onToggle={(on) =>
                    onChange({
                      ...filters,
                      languages: on ? [...filters.languages, lang] : filters.languages.filter((l) => l !== lang),
                    })
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {!!options?.cancellation_policies.length && (
          <AccordionItem value="cancellation">
            <AccordionTrigger className="text-sm font-semibold text-ink">Cancellation</AccordionTrigger>
            <AccordionContent className="space-y-3">
              {options.cancellation_policies.map((policy) => (
                <CheckRow
                  key={policy}
                  label={policy}
                  checked={filters.cancellation === policy}
                  onToggle={(on) => onChange({ ...filters, cancellation: on ? policy : "" })}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {!!options?.operators.length && (
          <OperatorSection operators={options.operators} value={filters.operator} onSelect={(operator) => onChange({ ...filters, operator })} />
        )}
      </Accordion>
    </div>
  );
}

function PriceSection({ filters, options, onChange, formatPrice }: Omit<PanelProps, "className">) {
  const min = Math.floor(options?.price?.min ?? 0);
  const max = Math.ceil(options?.price?.max ?? 0);
  const committed: [number, number] = [filters.priceMin ?? min, filters.priceMax ?? max];
  const [draft, setDraft] = useState<[number, number]>(committed);

  useEffect(() => setDraft([filters.priceMin ?? min, filters.priceMax ?? max]), [filters.priceMin, filters.priceMax, min, max]);

  if (max <= min) return null;

  return (
    <AccordionItem value="price">
      <AccordionTrigger className="text-sm font-semibold text-ink">Price</AccordionTrigger>
      <AccordionContent>
        <p className="mb-4 text-sm text-ink-soft">
          {formatPrice(draft[0])} – {formatPrice(draft[1])}
        </p>
        <SliderPrimitive.Root
          className="relative flex h-5 w-full touch-none select-none items-center"
          min={min}
          max={max}
          step={Math.max(1, Math.round((max - min) / 100))}
          value={draft}
          minStepsBetweenThumbs={1}
          onValueChange={(v) => setDraft([v[0], v[1]])}
          onValueCommit={(v) =>
            onChange({
              ...filters,
              priceMin: v[0] > min ? v[0] : undefined,
              priceMax: v[1] < max ? v[1] : undefined,
            })
          }
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-sand-200">
            <SliderPrimitive.Range className="absolute h-full bg-brand-600" />
          </SliderPrimitive.Track>
          {[0, 1].map((i) => (
            <SliderPrimitive.Thumb
              key={i}
              aria-label={i === 0 ? "Minimum price" : "Maximum price"}
              className="focus-ring block h-5 w-5 rounded-full border-2 border-brand-600 bg-white shadow"
            />
          ))}
        </SliderPrimitive.Root>
      </AccordionContent>
    </AccordionItem>
  );
}

function OperatorSection({ operators, value, onSelect }: { operators: string[]; value: string; onSelect: (v: string) => void }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(
    () => operators.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase())),
    [operators, query]
  );

  return (
    <AccordionItem value="operator">
      <AccordionTrigger className="text-sm font-semibold text-ink">Operator</AccordionTrigger>
      <AccordionContent className="space-y-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search operators" aria-label="Search operators" className="h-9 rounded-full" />
        <div className="max-h-56 space-y-3 overflow-y-auto">
          {shown.map((op) => (
            <CheckRow key={op} label={op} checked={value === op} onToggle={(on) => onSelect(on ? op : "")} />
          ))}
          {!shown.length && <p className="text-sm text-ink-soft">No operators match.</p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: (on: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
      <Checkbox checked={checked} onCheckedChange={(v) => onToggle(v === true)} />
      {label}
    </label>
  );
}

export function Pill({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={props.role === "radio" ? undefined : active}
      aria-checked={props.role === "radio" ? active : undefined}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-brand-700 bg-brand-700 text-white" : "border-sand-200 bg-white text-ink hover:border-brand-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
