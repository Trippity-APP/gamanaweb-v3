import type { CSSProperties } from "react";
import { fonts, typeScale } from "@/lib/guidelines/tokens";
import { CopyChip } from "../CopyChip";
import { ProposedBadge } from "../Badges";
import { DoDont } from "../DoDont";
import { SectionHeader, SubHeading } from "../SectionHeader";

const FONT_STYLE: Record<(typeof fonts)[number]["id"], { className: string; style?: CSSProperties }> = {
  display: { className: "font-display" },
  sans: { className: "", style: { fontFamily: "var(--font-sans)" } },
  script: { className: "font-script" },
};

const scripts = [
  { script: "Latin", languages: "English, French, Spanish, Portuguese, German", font: "Inter / Plus Jakarta Sans (loaded today)" },
  { script: "Devanagari", languages: "Hindi, Marathi", font: "Noto Sans Devanagari" },
  { script: "South Indian scripts", languages: "Kannada, Tamil, Telugu, Malayalam", font: "Noto Sans Kannada / Tamil / Telugu / Malayalam" },
  { script: "Arabic (RTL)", languages: "Arabic", font: "Noto Sans Arabic, with dir=\"rtl\" layout mirroring" },
  { script: "CJK", languages: "Mandarin, Japanese", font: "Noto Sans SC / Noto Sans JP, system fallback first" },
];

export function Typography() {
  return (
    <section id="typography" className="scroll-mt-32">
      <SectionHeader
        id="typography"
        number={4}
        title="Typography"
        intro="Plus Jakarta Sans gives headings their friendly confidence; Inter keeps everything else easy to read. Both load through next/font in app/layout.tsx."
      />

      <SubHeading id="type-families">Families</SubHeading>
      <div className="grid gap-4 lg:grid-cols-3">
        {fonts.map((f) => (
          <div key={f.id} className="flex flex-col rounded-3xl border border-g-border bg-g-card p-6">
            <p className={`text-6xl text-g-fg ${FONT_STYLE[f.id].className}`} style={FONT_STYLE[f.id].style}>
              Aa
            </p>
            <p className="mt-4 font-display text-lg font-bold text-g-fg">{f.name}</p>
            <p className="text-sm text-g-fg-muted">{f.role}</p>
            <p
              className={`mt-4 break-words text-g-fg ${FONT_STYLE[f.id].className}`}
              style={FONT_STYLE[f.id].style}
            >
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789 ₹ € $ · ! ? &amp;
            </p>
            <p className="mt-4 text-xs text-g-fg-subtle">{f.weights}</p>
            <div className="mt-auto flex flex-wrap gap-1 pt-4">
              <CopyChip value={f.tailwind} label="Class" />
              <CopyChip value={f.cssVar} label="Var" />
              <CopyChip value={f.stack} label="Stack" />
            </div>
          </div>
        ))}
      </div>

      <SubHeading id="type-scale">Type scale</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">
        Headings scale fluidly with <code className="font-mono text-sm">clamp()</code> from mobile to desktop, so one class
        covers every breakpoint.
      </p>
      <ul className="divide-y divide-g-border rounded-3xl border border-g-border bg-g-card">
        {typeScale.map((t) => (
          <li key={t.name} className="grid gap-4 p-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-g-fg-subtle">{t.name}</p>
              <p className={`mt-2 break-words text-g-fg ${t.className} ${t.className === "eyebrow" ? "!text-g-primary-text" : ""}`}>
                {t.sample}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-g-fg-muted">
                <dt>Size</dt>
                <dd className="text-g-fg">{t.size}</dd>
                <dt>Line height</dt>
                <dd className="text-g-fg">{t.lineHeight}</dd>
                <dt>Weight</dt>
                <dd className="text-g-fg">{t.weight}</dd>
                <dt>Tracking</dt>
                <dd className="text-g-fg">{t.tracking}</dd>
              </dl>
              <CopyChip value={t.className} label="Class" />
            </div>
          </li>
        ))}
      </ul>

      <SubHeading id="type-rules">Rules</SubHeading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          ["Sentence case", "Headings, buttons and labels: “Explore by city”, not “Explore By City”."],
          ["Comfortable measure", "Keep body text between 65 and 75 characters per line (max-w-[68ch])."],
          ["Tabular stats", "Stat numbers use the display face, extra bold, with tabular-nums."],
          ["Caps only for eyebrows", "No all-caps text beyond the eyebrow style."],
          ["Underline only links", "Never underline for emphasis; use weight instead."],
          ["Script sparingly", "Caveat is for one short flourish per view, never body or headings."],
        ].map(([title, body]) => (
          <li key={title} className="rounded-3xl border border-g-border bg-g-card p-5">
            <p className="font-semibold text-g-fg">{title}</p>
            <p className="mt-1 text-sm text-g-fg-muted">{body}</p>
          </li>
        ))}
      </ul>

      <SubHeading id="type-multilingual">Multilingual</SubHeading>
      <div className="rounded-3xl border border-g-border bg-g-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-g-fg">Fallback per script</p>
          <ProposedBadge>Proposed · no per-script fonts in the codebase yet</ProposedBadge>
        </div>
        <p className="mt-2 text-sm text-g-fg-muted">
          Gamana ships 7 languages in the app. The website only loads Latin subsets today, so other scripts fall back to
          the system font. Proposed stacks below; the exact language list is for the owner to confirm.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-g-border text-xs uppercase tracking-wider text-g-fg-subtle">
                <th scope="col" className="py-2 pr-3 font-semibold">Script</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Languages</th>
                <th scope="col" className="py-2 font-semibold">Font</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-g-border">
              {scripts.map((s) => (
                <tr key={s.script}>
                  <td className="py-2.5 pr-3 font-medium text-g-fg">{s.script}</td>
                  <td className="py-2.5 pr-3 text-g-fg-muted">{s.languages}</td>
                  <td className="py-2.5 text-g-fg-muted">{s.font}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-g-fg-muted">
          <strong className="text-g-fg">RTL:</strong> mirror layout, navigation arrows and progress direction. Do not mirror
          media controls (play, skip), the logo, numerals or the Coins icon.
        </p>
      </div>

      <DoDont
        items={[
          {
            do: <p className="text-h3 text-g-fg">Explore by city</p>,
            doCaption: "Sentence case headings.",
            dont: <p className="text-h3 uppercase text-g-fg">Explore By City</p>,
            dontCaption: "Title case or all caps headings.",
          },
        ]}
      />
    </section>
  );
}
