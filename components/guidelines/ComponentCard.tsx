"use client";

import { useId, useState, type ReactNode } from "react";
import { Copy } from "@/components/icons";
import { cn } from "@/lib/utils";
import { copyText } from "./CopyChip";

type Control = { label: string; options: readonly string[] };

/**
 * Live preview of a real site component. The stage is always a light surface because the
 * product has no dark mode yet; links inside previews are inert so you stay on this page.
 */
export function ComponentCard<C extends Record<string, Control>>({
  title,
  source,
  usage,
  code,
  controls,
  stage = "light",
  children,
}: {
  title: string;
  source: string;
  usage: ReactNode;
  code: string;
  controls?: C;
  stage?: "light" | "brand" | "sand";
  children: (state: { [K in keyof C]: C[K]["options"][number] }) => ReactNode;
}) {
  const id = useId();
  const initial = Object.fromEntries(Object.entries(controls ?? {}).map(([k, c]) => [k, c.options[0]])) as {
    [K in keyof C]: C[K]["options"][number];
  };
  const [state, setState] = useState(initial);

  return (
    <article className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <header className="flex flex-wrap items-start justify-between gap-2 px-5 pt-5">
        <div>
          <h4 className="font-display text-lg font-bold text-g-fg">{title}</h4>
          <p className="font-mono text-xs text-g-fg-subtle">{source}</p>
        </div>
      </header>

      {controls && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 pt-4">
          {Object.entries(controls).map(([key, control]) => (
            <div key={key} role="radiogroup" aria-label={`${title}: ${control.label}`} className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-g-fg-subtle">{control.label}</span>
              {control.options.map((opt) => {
                const active = state[key as keyof C] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setState((s) => ({ ...s, [key]: opt }))}
                    className={cn(
                      "focus-ring min-h-[44px] rounded-full px-3 text-xs font-medium transition-colors",
                      active ? "bg-g-primary-strong text-g-on-primary" : "text-g-fg-muted hover:bg-g-surface hover:text-g-fg"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "m-5 flex min-h-[140px] flex-wrap items-center justify-center gap-4 rounded-2xl p-6",
          stage === "light" && "bg-white",
          stage === "sand" && "bg-sand-50",
          stage === "brand" && "bg-brand-950"
        )}
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest("a")) e.preventDefault();
        }}
      >
        {children(state)}
      </div>

      <div className="px-5 pb-5">
        <p className="text-sm text-g-fg-muted">{usage}</p>
        <details className="group mt-3 rounded-2xl border border-g-border">
          <summary className="focus-ring flex min-h-[44px] cursor-pointer list-none items-center justify-between rounded-2xl px-4 text-sm font-semibold text-g-fg">
            Show code
            <span className="text-g-fg-subtle group-open:rotate-180" aria-hidden="true">
              ▾
            </span>
          </summary>
          <div className="relative border-t border-g-border">
            <pre id={id} className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-g-fg">
              <code>{code}</code>
            </pre>
            <button
              type="button"
              onClick={() => copyText(code, "Code copied")}
              aria-label={`Copy ${title} code`}
              className="focus-ring absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-g-surface text-g-fg-muted hover:text-g-fg"
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          </div>
        </details>
      </div>
    </article>
  );
}
