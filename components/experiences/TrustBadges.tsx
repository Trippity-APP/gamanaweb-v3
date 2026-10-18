import type { ComponentType } from "react";
import { CheckCircle2, Hotel, Languages, Zap, type IconProps } from "@/components/icons";
import type { ExperienceDetail } from "@/lib/api/schemas/experiences";
import { hasFreeCancellation, languageLabels } from "@/lib/experiences/format";
import { cn } from "@/lib/utils";

type Badge = { key: string; label: string; Icon: ComponentType<IconProps> };

export function trustBadgesFor(experience: ExperienceDetail): Badge[] {
  const badges: Badge[] = [];
  if (hasFreeCancellation(experience)) badges.push({ key: "cancel", label: "Free cancellation", Icon: CheckCircle2 });
  if (experience.instant_confirmation === true) badges.push({ key: "instant", label: "Instant confirmation", Icon: Zap });
  if (experience.meeting_type === "PICK_UP") badges.push({ key: "pickup", label: "Hotel pickup", Icon: Hotel });
  const langs = languageLabels(experience.languages);
  if (langs.length) {
    const label = langs.length > 2 ? `${langs.slice(0, 2).join(", ")} +${langs.length - 2}` : langs.join(", ");
    badges.push({ key: "lang", label, Icon: Languages });
  }
  return badges;
}

export function TrustBadges({ experience, max = 3, className }: { experience: ExperienceDetail; max?: number; className?: string }) {
  const badges = trustBadgesFor(experience).slice(0, max);
  if (!badges.length) return null;

  return (
    <ul className={cn("space-y-2", className)}>
      {badges.map(({ key, label, Icon }) => (
        <li key={key} className="flex items-center gap-2 text-sm text-ink">
          <Icon className={cn("h-4 w-4 shrink-0", key === "cancel" ? "text-forest" : "text-brand-700")} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
