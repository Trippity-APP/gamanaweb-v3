"use client";

import { cn } from "@/lib/utils";

/**
 * Shared with the Start Your Gamana Journey wizard and the /account Personalization
 * editor — one chip look across both surfaces.
 */
export function Chip({
  label,
  selected,
  onClick,
  disabled,
  small,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "focus-ring rounded-full border-2 font-medium transition-all duration-300 ease-spring",
        small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        selected
          ? "scale-105 border-brand-700 bg-brand-700 text-white shadow-sm"
          : disabled
          ? "cursor-not-allowed border-ink/5 text-ink-muted/50"
          : "border-ink/10 text-ink-soft hover:-translate-y-0.5 hover:border-brand-400 hover:text-ink active:scale-95"
      )}
    >
      {label}
    </button>
  );
}
