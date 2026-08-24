import type { LucideIcon } from "lucide-react";

/**
 * The small translucent pill that sits above a hero heading — first used on the Blog
 * ("Gamana Blog") and now shared across the photo-hero pages so they announce themselves
 * consistently.
 *
 * Rendered as a plain element rather than a heading: it's a label for the section below,
 * not a rung in the document outline, so it stays out of the h1/h2 hierarchy.
 */
export function HeroEyebrow({
  icon: Icon,
  label,
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold tracking-widest uppercase text-white ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}
