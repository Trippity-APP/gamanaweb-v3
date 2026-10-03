import type { ComponentType } from "react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import type { IconWeight } from "@/components/icons";
import { cn } from "@/lib/utils";

export const ICON_TONES = ["teal", "sunset", "lilac", "mint", "sand"] as const;
export type IconTone = (typeof ICON_TONES)[number];

const TONE: Record<IconTone, string> = {
  teal: "bg-brand-100 text-brand-700",
  sunset: "bg-sunset-100 text-sunset-600",
  lilac: "bg-lilac-100 text-lilac-700",
  mint: "bg-mint-100 text-mint-700",
  sand: "bg-sand-100 text-sand-700",
};

const SIZE = {
  sm: { tile: "h-9 w-9 rounded-xl", icon: "h-[18px] w-[18px]" },
  md: { tile: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
  lg: { tile: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
} as const;

/** Rotates through the pastel tones so neighbouring tiles in a list differ. */
export const toneFor = (index: number): IconTone => ICON_TONES[index % ICON_TONES.length];

export type TileIcon = ComponentType<{ className?: string; weight?: IconWeight; "aria-hidden"?: boolean | "true" | "false" }>;

type IconTileProps = {
  icon: TileIcon;
  tone?: IconTone;
  size?: keyof typeof SIZE;
  className?: string;
};

/** Toggl-style icon: a solid rounded glyph on a soft pastel tile. Gamana Coins show the coin artwork. */
export function IconTile({ icon: Icon, tone = "teal", size = "md", className }: IconTileProps) {
  const s = SIZE[size];
  return (
    <span className={cn("grid shrink-0 place-items-center", s.tile, TONE[tone], className)} aria-hidden>
      {Icon === GamanaCoinIcon ? (
        <GamanaCoinIcon className={cn(s.icon, "scale-110")} aria-hidden />
      ) : (
        <Icon className={s.icon} weight="fill" aria-hidden />
      )}
    </span>
  );
}
