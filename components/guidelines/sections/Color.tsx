import { AlertCircle, Check, CheckCircle2 } from "@/components/icons";
import { contrastRatio, evaluatePairs, toHslString, toRgbString } from "@/lib/guidelines/contrast";
import { cssVarName, paletteVarName } from "@/lib/guidelines/css";
import {
  colorGroups,
  gradients,
  themeTokenMeta,
  themes,
  usageRatio,
  type Swatch,
  type ThemeKey,
} from "@/lib/guidelines/tokens";
import { CopyChip } from "../CopyChip";
import { DarkProposedBadge, Pill } from "../Badges";
import { DoDont } from "../DoDont";
import { SectionHeader, SubHeading } from "../SectionHeader";

const INK = themes.light.fg;
const WHITE = themes.light.bg;

function readableOn(hex: string) {
  return contrastRatio(INK, hex) >= contrastRatio(WHITE, hex) ? INK : WHITE;
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <li className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <div
        className="flex h-24 items-end p-3 text-xs font-semibold"
        style={{ backgroundColor: swatch.hex, color: readableOn(swatch.hex) }}
      >
        {swatch.name}
      </div>
      <div className="space-y-1.5 p-3">
        {swatch.usage && <p className="text-xs text-g-fg-muted">{swatch.usage}</p>}
        <div className="flex flex-wrap gap-1">
          <CopyChip value={swatch.hex} label="HEX" />
          <CopyChip value={toRgbString(swatch.hex)} label="RGB" />
          <CopyChip value={toHslString(swatch.hex)} label="HSL" />
          <CopyChip value={`var(${paletteVarName(swatch.tailwind)})`} label="CSS" />
          <CopyChip value={swatch.tailwind} label="Tailwind" />
        </div>
      </div>
    </li>
  );
}

const THEME_KEYS = Object.keys(themeTokenMeta) as ThemeKey[];
const GROUPS = ["Surfaces", "Text", "Brand", "Semantic"] as const;

function ThemeColumn({ theme }: { theme: "light" | "dark" }) {
  const t = themes[theme];
  return (
    <div className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-g-border px-5 py-3">
        <p className="font-display text-lg font-bold text-g-fg">{theme === "light" ? "Light" : "Dark"}</p>
        {theme === "dark" ? <DarkProposedBadge /> : <Pill tone="success">Live on gamana.app</Pill>}
      </div>
      {GROUPS.map((group) => (
        <div key={group} className="px-5 py-4">
          <p className="eyebrow !text-g-fg-subtle">{group}</p>
          <ul className="mt-3 space-y-2">
            {THEME_KEYS.filter((k) => themeTokenMeta[k].group === group).map((key) => (
              <li key={key} className="flex items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-xl border border-g-border"
                  style={{ background: t.bg, boxShadow: `inset 0 0 0 999px ${t[key]}` }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-g-fg">{themeTokenMeta[key].label}</span>
                  <span className="block font-mono text-xs text-g-fg-subtle">{cssVarName(key)}</span>
                </span>
                <CopyChip value={t[key]} className="max-w-[12rem]" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PairsTable({ theme }: { theme: "light" | "dark" }) {
  const rows = evaluatePairs(theme);
  const t = themes[theme];
  return (
    <div className="overflow-x-auto rounded-3xl border border-g-border bg-g-card">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="px-5 pt-4 text-left font-display text-lg font-bold text-g-fg">
          {theme === "light" ? "Light theme" : "Dark theme"}
        </caption>
        <thead>
          <tr className="border-b border-g-border text-xs uppercase tracking-wider text-g-fg-subtle">
            <th scope="col" className="px-5 py-3 font-semibold">Sample</th>
            <th scope="col" className="px-3 py-3 font-semibold">Pair</th>
            <th scope="col" className="px-3 py-3 font-semibold">Use</th>
            <th scope="col" className="px-3 py-3 font-semibold">Ratio</th>
            <th scope="col" className="px-5 py-3 font-semibold">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-g-border">
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="px-5 py-2.5">
                <span
                  className="inline-flex h-9 min-w-[3.5rem] items-center justify-center rounded-lg px-2 font-semibold"
                  style={{ color: r.fgValue, background: t.bg, boxShadow: `inset 0 0 0 999px ${r.bgValue}` }}
                >
                  Aa
                </span>
              </td>
              <td className="px-3 py-2.5">
                <span className="block text-g-fg">{r.label}</span>
                <span className="block font-mono text-xs text-g-fg-subtle">
                  {cssVarName(r.fg)} on {cssVarName(r.bg)}
                </span>
              </td>
              <td className="px-3 py-2.5 text-g-fg-muted">{r.usage === "text" ? "Text" : r.usage === "large" ? "Large text" : "UI"}</td>
              <td className="px-3 py-2.5 font-mono tabular-nums text-g-fg">{r.ratio.toFixed(2)}:1</td>
              <td className="px-5 py-2.5">
                <span className="flex flex-wrap gap-1">
                  <Pill tone={r.aa ? "success" : "error"}>
                    {r.aa ? <Check size={12} aria-hidden="true" /> : <AlertCircle size={12} aria-hidden="true" />}
                    AA {r.aa ? "pass" : "fail"}
                  </Pill>
                  {r.aaa && <Pill tone="success">AAA</Pill>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Color() {
  const ratioColors: Record<(typeof usageRatio)[number]["token"], string> = {
    neutral: colorGroups[1].swatches.find((s) => s.tailwind === "sand-200")!.hex,
    primary: themes.light.primary,
    accent: themes.light.accent,
  };

  return (
    <section id="color" className="scroll-mt-32">
      <SectionHeader
        id="color"
        number={3}
        title="Color"
        intro="Teal leads, warm neutrals carry the page and sunset adds energy. Every value here comes from the site's Tailwind config; click any value to copy it."
      />

      {colorGroups.map((group) => (
        <div key={group.id}>
          <SubHeading id={`color-${group.id}`}>{group.title}</SubHeading>
          <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">{group.intent}</p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.swatches.map((s) => (
              <SwatchCard key={`${group.id}-${s.name}`} swatch={s} />
            ))}
          </ul>
        </div>
      ))}

      <SubHeading id="color-gradients">Gradients</SubHeading>
      <ul className="grid gap-4 sm:grid-cols-2">
        {gradients.map((g) => (
          <li key={g.name} className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
            <div className="h-24" style={{ backgroundImage: g.css }} aria-hidden="true" />
            <div className="space-y-2 p-4">
              <p className="font-semibold text-g-fg">{g.name}</p>
              <p className="text-sm text-g-fg-muted">{g.usage}</p>
              <div className="flex flex-wrap gap-1">
                <CopyChip value={g.tailwind} label="Tailwind" />
                <CopyChip value={g.css} label="CSS" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <SubHeading id="color-themes">Theme tokens, light and dark</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">
        Components use these semantic tokens, never raw palette values. Dark values are derived from the light palette:
        teal-tinted near-black surfaces, brand 400 as primary, translucent borders and low-alpha status tints.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <ThemeColumn theme="light" />
        <ThemeColumn theme="dark" />
      </div>

      <SubHeading id="color-ratio">Usage ratio</SubHeading>
      <div className="rounded-3xl border border-g-border bg-g-card p-6">
        <div className="flex h-10 overflow-hidden rounded-full" role="img" aria-label="Neutrals 70%, brand teal 20%, accents 10%">
          {usageRatio.map((r) => (
            <span key={r.token} style={{ width: `${r.percent}%`, backgroundColor: ratioColors[r.token] }} />
          ))}
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {usageRatio.map((r) => (
            <li key={r.token} className="flex items-center gap-2 text-g-fg-muted">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ratioColors[r.token] }} aria-hidden="true" />
              <strong className="tabular-nums text-g-fg">{r.percent}%</strong> {r.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-g-fg-subtle">Guidance from how gamana.app pages are composed, not a hard rule.</p>
      </div>

      <SubHeading id="color-pairs">Accessible pairs</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">
        Computed live from the tokens with the same function as <code className="font-mono text-sm">npm run check:contrast</code>,
        which fails the build if any pair drops below AA (4.5:1 text, 3:1 large text and UI).
      </p>
      <div className="space-y-4">
        <PairsTable theme="light" />
        <PairsTable theme="dark" />
      </div>

      <DoDont
        items={[
          {
            do: (
              <span className="inline-flex items-center gap-2 rounded-full bg-g-success-bg px-4 py-2 text-sm font-semibold text-g-success">
                <CheckCircle2 size={16} aria-hidden="true" /> Booking confirmed
              </span>
            ),
            doCaption: "Pair status colour with an icon and words.",
            dont: (
              <span className="flex gap-3" aria-label="Two dots, one green and one red, with no labels">
                <span className="h-6 w-6 rounded-full bg-g-success" />
                <span className="h-6 w-6 rounded-full bg-g-error" />
              </span>
            ),
            dontCaption: "Use red and green alone to carry meaning.",
          },
          {
            do: <span className="rounded-full bg-g-primary-strong px-5 py-2.5 text-sm font-semibold text-g-on-primary">Listen now</span>,
            doCaption: "Use the primary-strong fill for small button labels (AA).",
            dont: <span className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">Listen now</span>,
            dontCaption: "Put small white text on mid-teal (brand 500 is 2.7:1).",
          },
        ]}
      />
    </section>
  );
}
