import type { ReactNode } from "react";
import { DARK_TOKENS_APPROVED } from "@/lib/guidelines/config";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "warning" | "success" | "error";

const TONES: Record<Tone, string> = {
  neutral: "border-g-border bg-g-surface text-g-fg-muted",
  info: "border-transparent bg-g-info-bg text-g-info",
  warning: "border-transparent bg-g-warning-bg text-g-warning",
  success: "border-transparent bg-g-success-bg text-g-success",
  error: "border-transparent bg-g-error-bg text-g-error",
};

export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProposedBadge({ children = "Proposed · pending design sign-off" }: { children?: ReactNode }) {
  return <Pill tone="warning">{children}</Pill>;
}

export function DarkProposedBadge() {
  return DARK_TOKENS_APPROVED ? null : <ProposedBadge />;
}

export function Placeholder({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-g-border-strong p-4 text-center",
        className
      )}
    >
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-g-warning">Placeholder</span>
      <span className="font-mono text-xs text-g-fg-muted">{name}</span>
    </div>
  );
}
