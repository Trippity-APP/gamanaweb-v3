import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/gamana-logo.svg";
export const LOGO_ASPECT = 1341.66 / 370.99;

const maskStyle: CSSProperties = {
  WebkitMaskImage: `url(${LOGO_SRC})`,
  maskImage: `url(${LOGO_SRC})`,
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  aspectRatio: `${LOGO_ASPECT}`,
};

/**
 * The Gamana lockup drawn in `currentColor` (mono and reversed variants), so its colour always
 * comes from a documented token. Set the width with a class; height follows the aspect ratio.
 */
export function LogoMark({ className, style, label = "Gamana" }: { className?: string; style?: CSSProperties; label?: string }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return <span {...a11y} className={cn("block bg-current", className)} style={{ ...maskStyle, ...style }} />;
}
