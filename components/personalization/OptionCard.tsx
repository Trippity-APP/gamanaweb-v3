"use client";

import { Check } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Shared with the Start Your Gamana Journey wizard and the /account Personalization
 * editor — one selectable card look across both surfaces.
 */
export function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "focus-ring group text-left rounded-2xl border-2 p-4 transition-all duration-300 ease-spring active:scale-[0.98]",
        selected
          ? "scale-[1.01] border-brand-600 bg-brand-50 shadow-card"
          : "border-ink/10 bg-white hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-ink">{label}</span>
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ease-spring",
            selected ? "scale-100 border-brand-600 bg-brand-600" : "scale-90 border-ink/15 group-hover:border-brand-400"
          )}
        >
          <Check className={cn("h-3.5 w-3.5 text-white transition-transform duration-300 ease-spring", selected ? "scale-100" : "scale-0")} />
        </span>
      </div>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </button>
  );
}
