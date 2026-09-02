import Image from "next/image";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export const GAMANA_COIN_ICON_SRC = "/coins-ic-gamana.png";

export function GamanaCoinIcon({ className, "aria-hidden": ariaHidden }: LucideProps) {
  return (
    <Image
      src={GAMANA_COIN_ICON_SRC}
      alt={ariaHidden ? "" : "Gamana Coins"}
      aria-hidden={ariaHidden}
      width={24}
      height={24}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
