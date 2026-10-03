import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/CountUp";
import { SITE_STATS } from "@/lib/data/site-stats";

type StatsStripProps = {
  stats?: readonly { value: string; label: string }[];
  tone?: "light" | "dark";
  className?: string;
};

export function StatsStrip({ stats = SITE_STATS, tone = "light", className }: StatsStripProps) {
  const dark = tone === "dark";
  return (
    <dl className={cn("grid grid-cols-3 gap-4 sm:gap-8", className)}>
      {stats.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <dt className={cn("text-xs font-medium uppercase tracking-[0.16em]", dark ? "text-white/65" : "text-ink-muted")}>
            {s.label}
          </dt>
          <dd className={cn("font-display text-3xl font-extrabold sm:text-4xl", dark ? "text-white" : "text-ink")}>
            <CountUp value={s.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
