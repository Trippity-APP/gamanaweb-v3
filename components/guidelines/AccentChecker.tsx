"use client";

import { useId, useState } from "react";
import { AA_THRESHOLD, contrastRatio } from "@/lib/guidelines/contrast";
import { PRIMARY_HEX, themes } from "@/lib/guidelines/tokens";
import { Pill } from "./Badges";

const SURFACES = [
  { name: "White", bg: themes.light.bg },
  { name: "Dark", bg: themes.dark.bg },
];

/** Partner accent check: must reach 3:1 (UI) on white and dark, else the Gamana teal is used. */
export function AccentChecker() {
  const id = useId();
  const [accent, setAccent] = useState(PRIMARY_HEX);
  const results = SURFACES.map((s) => ({ ...s, ratio: contrastRatio(accent, s.bg) }));
  const passes = results.every((r) => r.ratio >= AA_THRESHOLD.ui);
  const applied = passes ? accent : PRIMARY_HEX;

  return (
    <div className="rounded-3xl border border-g-border bg-g-card p-6">
      <label htmlFor={id} className="font-semibold text-g-fg">
        Try a partner accent
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          id={id}
          type="color"
          value={accent}
          onChange={(e) => setAccent(e.target.value.toUpperCase())}
          className="focus-ring h-11 w-16 cursor-pointer rounded-lg border border-g-border bg-transparent"
        />
        <span className="font-mono text-sm text-g-fg">{accent}</span>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2" aria-live="polite">
        {results.map((r) => (
          <li key={r.name}>
            <Pill tone={r.ratio >= AA_THRESHOLD.ui ? "success" : "error"}>
              {r.name}: {r.ratio.toFixed(2)}:1 {r.ratio >= AA_THRESHOLD.ui ? "pass" : "fail"}
            </Pill>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-10 w-10 rounded-full" style={{ backgroundColor: applied }} aria-hidden="true" />
        <p className="text-sm text-g-fg-muted">
          {passes ? "Accent accepted for buttons and active states." : "Fails on one surface, so the Gamana teal is used instead."}
        </p>
      </div>
    </div>
  );
}
