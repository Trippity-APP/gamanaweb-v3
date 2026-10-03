import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
  /** Heading level. Defaults to h2; pass "h1" only for page-level heroes. */
  as?: "h1" | "h2" | "h3";
  action?: { href: string; label: string };
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  as: Heading = "h2",
  action,
  tone = "light",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <Reveal
      className={cn(
        "mb-10 sm:mb-14",
        centered ? "mx-auto max-w-3xl text-center" : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn(!centered && "max-w-2xl")}>
        {eyebrow && (
          <p className={cn("eyebrow mb-4", dark && "text-brand-200")}>
            <span className={cn("h-px w-6", dark ? "bg-brand-200" : "bg-brand-600")} aria-hidden />
            {eyebrow}
          </p>
        )}
        <Heading className={cn("text-h2", dark ? "text-white" : "text-ink")}>{title}</Heading>
        {lead && <p className={cn("text-lead mt-4", dark ? "text-white/75" : "text-ink-soft")}>{lead}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "focus-ring group inline-flex shrink-0 items-center gap-2 rounded-full text-sm font-semibold",
            centered && "mt-6",
            dark ? "text-white" : "text-brand-700 hover:text-brand-800"
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}
