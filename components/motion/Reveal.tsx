"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms, for staggering siblings. */
  delay?: number;
  variant?: "up" | "fade" | "scale";
  id?: string;
};

/** Fades/slides content in once it scrolls into view. Visible by default without JS. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, variant = "up", id }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant === "up" ? "" : variant}
      className={cn(inView && "is-visible", className)}
      style={style}
    >
      {children}
    </Tag>
  );
}
