import Image from "next/image";
import { cn } from "@/lib/utils";

export const GAMANA_COIN_ICON_SRC = "/coins-ic-gamana.png";

type GamanaCoinIconProps = {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
  /** Accepted so the coin can stand in for any icon component; the artwork has one style. */
  weight?: unknown;
};

export function GamanaCoinIcon({ className, "aria-hidden": ariaHidden }: GamanaCoinIconProps) {
  const hidden = ariaHidden === true || ariaHidden === "true";
  return (
    <Image
      src={GAMANA_COIN_ICON_SRC}
      alt={hidden ? "" : "Gamana Coins"}
      aria-hidden={hidden || undefined}
      width={24}
      height={24}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
