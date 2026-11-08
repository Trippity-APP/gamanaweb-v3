import { Pill } from "../Badges";
import { SectionHeader, SubHeading } from "../SectionHeader";
import {
  audienceSummary,
  audiences,
  mission,
  personality,
  positioning,
  principles,
  promise,
  taglines,
  whoWeAre,
} from "@/lib/guidelines/content";

export function Foundation() {
  return (
    <section id="foundation" className="scroll-mt-32">
      <SectionHeader
        id="foundation"
        number={1}
        title="Brand foundation"
        intro="Who we are, what we promise and how we behave. Everything else in these guidelines follows from this page."
      />

      <div className="rounded-3xl bg-g-surface p-6 sm:p-10">
        <p className="eyebrow !text-g-fg-subtle">Who we are</p>
        <p className="text-h3 mt-3 max-w-[40ch] text-g-fg">{whoWeAre}</p>
        <p className="mt-6 text-sm font-semibold text-g-fg-subtle">Positioning line</p>
        <p className="mt-1 max-w-[65ch] text-lg text-g-fg">“{positioning}”</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {taglines.map((t) => (
            <li key={t}>
              <Pill tone="info">{t}</Pill>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Mission", text: mission },
          { label: "Promise", text: promise },
          { label: "Audience", text: audienceSummary },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-g-border bg-g-card p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-lg font-bold text-g-fg">{item.label}</p>
              <Pill>Editable draft</Pill>
            </div>
            <p className="mt-3 text-g-fg-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <SubHeading id="personality">Brand personality</SubHeading>
      <div className="grid gap-4 md:grid-cols-3">
        {personality.map((p) => (
          <div key={p.trait} className="rounded-3xl border border-g-border bg-g-card p-6">
            <p className="font-display text-lg font-bold text-g-fg">{p.trait}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-g-success">We are</dt>
                <dd className="mt-1 text-g-fg-muted">{p.weAre}</dd>
              </div>
              <div>
                <dt className="font-semibold text-g-error">We are not</dt>
                <dd className="mt-1 text-g-fg-muted">{p.weAreNot}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <SubHeading id="principles">Principles</SubHeading>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((p, i) => (
          <li key={p.title} className="rounded-3xl border border-g-border bg-g-card p-6">
            <span className="font-display text-3xl font-extrabold tabular-nums text-g-primary-text">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="mt-2 font-display text-lg font-bold text-g-fg">{p.title}</p>
            <p className="mt-1 text-sm text-g-fg-muted">{p.body}</p>
          </li>
        ))}
      </ol>

      <SubHeading id="audience">Audience snapshot</SubHeading>
      <ul className="divide-y divide-g-border rounded-3xl border border-g-border bg-g-card">
        {audiences.map((a) => (
          <li key={a.name} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:gap-6">
            <span className="font-semibold text-g-fg sm:w-64 sm:shrink-0">{a.name}</span>
            <span className="text-g-fg-muted">{a.line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
