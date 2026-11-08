"use client";

import type { ReactNode } from "react";
import { Link } from "@/components/icons";
import { copyText } from "./CopyChip";

export function AnchorHeading({
  id,
  level = 2,
  children,
  className,
  ownId = false,
}: {
  id: string;
  level?: 2 | 3;
  /** Put the id on the heading itself (sub-sections); sections carry their own id. */
  ownId?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const Tag = level === 2 ? "h2" : "h3";
  const copy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, "", `#${id}`);
    copyText(url, "Link copied");
  };
  return (
    <Tag id={ownId ? id : undefined} className={`group flex items-center gap-2 ${className ?? ""}`}>
      <span>{children}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy link to ${typeof children === "string" ? children : "this section"}`}
        className="focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-g-fg-subtle opacity-0 transition-opacity hover:text-g-primary-text focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Link size={18} aria-hidden="true" />
      </button>
    </Tag>
  );
}

export function SectionHeader({
  id,
  number,
  title,
  intro,
}: {
  id: string;
  number: number;
  title: string;
  intro: ReactNode;
}) {
  return (
    <header className="mb-10">
      <p className="eyebrow !text-g-primary-text">{String(number).padStart(2, "0")}</p>
      <AnchorHeading id={id} className="text-h2 mt-3 text-g-fg">
        {title}
      </AnchorHeading>
      <p className="text-lead mt-4 max-w-[68ch] text-g-fg-muted">{intro}</p>
    </header>
  );
}

export function SubHeading({ id, children }: { id: string; children: string }) {
  return (
    <AnchorHeading id={id} level={3} ownId className="text-h3 mb-4 mt-14 scroll-mt-28 text-g-fg">
      {children}
    </AnchorHeading>
  );
}
