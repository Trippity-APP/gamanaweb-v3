import { ArrowRight, Pause, Play } from "@/components/icons";
import { breakpoints, container, radii, shadows, spacing } from "@/lib/guidelines/tokens";
import { CopyChip } from "../CopyChip";
import { GridOverlay } from "../GridOverlay";
import { SectionHeader, SubHeading } from "../SectionHeader";

export function Layout() {
  return (
    <section id="layout" className="scroll-mt-32">
      <SectionHeader
        id="layout"
        number={8}
        title="Layout and spacing"
        intro="Mobile first, one container, generous whitespace. Everything snaps to Tailwind's 4px scale."
      />

      <SubHeading id="layout-grid">Grid and containers</SubHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-3xl border border-g-border bg-g-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Breakpoints</caption>
            <thead>
              <tr className="border-b border-g-border text-xs uppercase tracking-wider text-g-fg-subtle">
                <th scope="col" className="px-5 py-3 font-semibold">Breakpoint</th>
                <th scope="col" className="px-3 py-3 font-semibold">Min width</th>
                <th scope="col" className="px-5 py-3 font-semibold">Columns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-g-border">
              <tr>
                <td className="px-5 py-2.5 font-mono text-g-fg">base</td>
                <td className="px-3 py-2.5 text-g-fg-muted">0</td>
                <td className="px-5 py-2.5 text-g-fg-muted">4</td>
              </tr>
              {breakpoints.map((b) => (
                <tr key={b.name}>
                  <td className="px-5 py-2.5 font-mono text-g-fg">{b.name}</td>
                  <td className="px-3 py-2.5 text-g-fg-muted">{b.min}px</td>
                  <td className="px-5 py-2.5 text-g-fg-muted">{b.min >= 1024 ? 12 : b.min >= 768 ? 8 : 4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Container</p>
          <p className="mt-1 text-sm text-g-fg-muted">
            Max width {container.maxWidth}px, gutters {container.gutters}. Sections use{" "}
            <code className="font-mono">section</code> (80–112px vertical) or <code className="font-mono">section-tight</code>.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            <CopyChip value={container.className} label="Class" />
            <CopyChip value="section" label="Class" />
            <CopyChip value="section-tight" label="Class" />
          </div>
          <div className="mt-5">
            <GridOverlay />
          </div>
        </div>
      </div>

      <SubHeading id="layout-spacing">Spacing scale</SubHeading>
      <ul className="space-y-2 rounded-3xl border border-g-border bg-g-card p-6">
        {spacing.map((s) => (
          <li key={s.step} className="flex items-center gap-4 text-sm">
            <span className="w-12 font-mono text-g-fg">{s.step}</span>
            <span className="h-3 rounded-full bg-g-primary" style={{ width: s.px }} aria-hidden="true" />
            <span className="text-g-fg-subtle">{s.px}px</span>
          </li>
        ))}
      </ul>

      <SubHeading id="layout-radii">Radii</SubHeading>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {radii.map((r) => (
          <li key={r.name} className="flex flex-col items-center gap-2 text-center">
            <span className={`h-20 w-20 border-2 border-g-primary bg-g-info-bg ${r.tailwind}`} aria-hidden="true" />
            <span className="text-sm font-medium text-g-fg">{r.name}</span>
            <span className="text-xs text-g-fg-subtle">{r.usage}</span>
            <CopyChip value={r.tailwind} />
          </li>
        ))}
      </ul>

      <SubHeading id="layout-elevation">Elevation</SubHeading>
      <div className="grid gap-4 md:grid-cols-3">
        {shadows.map((s) => (
          <div key={s.name} className="flex flex-col gap-3 rounded-3xl bg-sand-50 p-6">
            <div className={`flex h-24 items-center justify-center rounded-3xl bg-white text-sm font-semibold text-ink ${s.tailwind}`}>
              {s.name}
            </div>
            <CopyChip value={s.tailwind} label="Class" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Dark surfaces (proposed) don&apos;t rely on shadows: raise elevation with a lighter surface (card, then elevated)
        and a translucent border.
      </p>

      <SubHeading id="layout-responsive">Responsive patterns</SubHeading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          ["Mobile first", "Write base styles for 375px, then add sm, md and lg."],
          ["Hero", "Stacked on mobile; copy and media side by side from lg."],
          ["Card grids", "Horizontal rail on mobile (CardRail), grid from md."],
          ["Navigation", "Sticky table of contents on desktop becomes a Sections sheet on mobile."],
          ["Sheets vs dialogs", "ResponsiveSheet: bottom sheet below md, dialog above."],
          ["Touch", "Every tap target at least 44 × 44px."],
        ].map(([t, b]) => (
          <li key={t} className="rounded-3xl border border-g-border bg-g-card p-5">
            <p className="font-semibold text-g-fg">{t}</p>
            <p className="mt-1 text-sm text-g-fg-muted">{b}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const A11Y_RULES = [
  ["Target", "WCAG 2.2 AA across the site and app."],
  ["Contrast", "4.5:1 for text, 3:1 for large text and UI. See the accessible pairs table in Color."],
  ["Touch targets", "At least 44 × 44px for every interactive element."],
  ["Focus", "Always visible: the focus-ring utility, on every link, button and control."],
  ["Keyboard", "Logical tab order, no traps outside dialogs, Escape closes overlays."],
  ["Audio state", "Announce play, pause and story changes with aria-live."],
  ["Captions", "Every story has a transcript; videos have captions."],
  ["Alt text", "Describe the place and the mood in under 125 characters; empty alt for decoration."],
  ["Motion", "Respect prefers-reduced-motion; nothing essential depends on animation."],
  ["Colour", "Never the only signal: pair colour with an icon or words."],
  ["Zoom", "Layouts survive 200% text size without loss of content."],
];

export function Accessibility() {
  return (
    <section id="accessibility" className="scroll-mt-32">
      <SectionHeader
        id="accessibility"
        number={9}
        title="Accessibility and languages"
        intro="Gamana is for people on the move, often one-handed, in bright sun, in a second language. Accessible design is the baseline."
      />

      <ul className="grid gap-3 sm:grid-cols-2">
        {A11Y_RULES.map(([t, b]) => (
          <li key={t} className="rounded-3xl border border-g-border bg-g-card p-5">
            <p className="font-semibold text-g-fg">{t}</p>
            <p className="mt-1 text-sm text-g-fg-muted">{b}</p>
          </li>
        ))}
      </ul>

      <SubHeading id="a11y-focus">Focus ring</SubHeading>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-g-border bg-g-card p-6">
        <span className="inline-flex min-h-[44px] items-center rounded-full bg-g-primary-strong px-5 text-sm font-semibold text-g-on-primary ring-2 ring-g-ring ring-offset-2 ring-offset-g-card">
          Focused button
        </span>
        <CopyChip value="focus-ring" label="Class" />
        <p className="text-sm text-g-fg-muted">2px ring with a 2px offset, visible in both themes.</p>
      </div>

      <SubHeading id="a11y-i18n">Languages and RTL</SubHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-g-border bg-g-card p-6 text-sm text-g-fg-muted">
          <ul className="space-y-2">
            <li><strong className="text-g-fg">7 languages</strong> in the app; design for +30% text expansion.</li>
            <li><strong className="text-g-fg">Dates and numbers</strong> follow the visitor&apos;s locale.</li>
            <li><strong className="text-g-fg">Currency:</strong> INR for India (₹1,499), local currency elsewhere (€14.99).</li>
            <li><strong className="text-g-fg">Flip in RTL:</strong> layout, navigation arrows, progress bars, carousels.</li>
            <li><strong className="text-g-fg">Never flip:</strong> play and pause, media controls, logo, numerals, Coins icon.</li>
          </ul>
        </div>
        <div dir="rtl" lang="ar" className="rounded-3xl border border-g-border bg-g-card p-6" aria-label="RTL smoke test">
          <p className="eyebrow !text-g-primary-text">اختبار الاتجاه</p>
          <p className="mt-2 font-display text-xl font-bold text-g-fg">جولة صوتية في دبي</p>
          <p className="mt-1 text-sm text-g-fg-muted">قصص تبدأ عند وصولك، بدون شاشة.</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-g-primary-strong text-g-on-primary" dir="ltr">
              <Play size={18} aria-hidden="true" />
              <span className="sr-only">Play</span>
            </span>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-g-border text-g-fg" dir="ltr">
              <Pause size={18} aria-hidden="true" />
              <span className="sr-only">Pause</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-g-primary-text">
              استكشف المدينة <ArrowRight size={16} className="rtl:-scale-x-100" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-g-surface">
            <div className="h-full w-1/3 rounded-full bg-g-primary" />
          </div>
          <p className="mt-2 text-xs text-g-fg-subtle" dir="ltr">
            Layout, arrow and progress mirror; play and pause don&apos;t.
          </p>
        </div>
      </div>
    </section>
  );
}
