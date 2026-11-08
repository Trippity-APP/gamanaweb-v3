import type { ReactNode } from "react";
import { Check, X } from "@/components/icons";

export type DoDontItem = { do: ReactNode; dont: ReactNode; doCaption?: string; dontCaption?: string };

function Card({ kind, children, caption }: { kind: "do" | "dont"; children: ReactNode; caption?: string }) {
  const isDo = kind === "do";
  return (
    <figure
      className={`flex flex-col rounded-3xl border-2 bg-g-card p-5 ${isDo ? "border-g-success" : "border-g-error"}`}
    >
      <div className="flex min-h-[120px] flex-1 items-center justify-center">{children}</div>
      <figcaption className="mt-4 flex items-start gap-2 text-sm text-g-fg">
        <span
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isDo ? "bg-g-success-bg text-g-success" : "bg-g-error-bg text-g-error"
          }`}
          aria-hidden="true"
        >
          {isDo ? <Check size={12} /> : <X size={12} />}
        </span>
        <span>
          <strong className={isDo ? "text-g-success" : "text-g-error"}>{isDo ? "Do" : "Don't"}</strong>
          {caption ? `: ${caption}` : ""}
        </span>
      </figcaption>
    </figure>
  );
}

/** Two cards, do and don't. Meaning is carried by the label and icon, not colour alone. */
export function DoDont({ items }: { items: DoDontItem[] }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="contents">
          <Card kind="do" caption={item.doCaption}>
            {item.do}
          </Card>
          <Card kind="dont" caption={item.dontCaption}>
            {item.dont}
          </Card>
        </div>
      ))}
    </div>
  );
}
