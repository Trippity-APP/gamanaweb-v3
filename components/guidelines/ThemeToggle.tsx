"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "@/components/icons";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme ?? "system" : undefined;

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-g-border bg-g-card p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors",
              active ? "bg-g-primary-strong text-g-on-primary" : "text-g-fg-muted hover:text-g-fg"
            )}
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
