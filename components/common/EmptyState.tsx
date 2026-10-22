import type { ComponentType, ReactNode } from "react";
import { Search, type IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  hint?: string;
  icon?: ComponentType<IconProps>;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, hint, icon: Icon = Search, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center rounded-3xl bg-white px-6 py-12 text-center shadow-card", className)}>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-soft">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
