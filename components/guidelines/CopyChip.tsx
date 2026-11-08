"use client";

import { Copy } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export async function copyText(value: string, message = `Copied ${value}`) {
  try {
    await navigator.clipboard.writeText(value);
    toast({ title: message });
  } catch {
    toast({ title: "Couldn't copy", description: "Your browser blocked clipboard access. Select the text and copy it instead." });
  }
}

/** A token value that copies itself on click (native button, so Enter and Space work). */
export function CopyChip({ value, label, className }: { value: string; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => copyText(value)}
      aria-label={`Copy ${label ? `${label}: ` : ""}${value}`}
      className={cn(
        "focus-ring group inline-flex min-h-[44px] max-w-full items-center gap-1.5 rounded-full border border-g-border bg-g-card px-3 py-1 text-left font-mono text-xs text-g-fg-muted transition-colors hover:border-g-primary hover:text-g-fg",
        className
      )}
    >
      {label && <span className="font-sans font-medium text-g-fg-subtle">{label}</span>}
      <span className="truncate">{value}</span>
      <Copy size={14} aria-hidden="true" className="shrink-0 opacity-60 group-hover:opacity-100" />
    </button>
  );
}
