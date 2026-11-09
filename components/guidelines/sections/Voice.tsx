import { AlertCircle } from "@/components/icons";
import {
  CONTENT_DOC_URL,
  bannedPhrases,
  copyPairs,
  ctaVocabulary,
  errorPatterns,
  narrationNote,
  toneMap,
  voicePillars,
  writingRules,
} from "@/lib/guidelines/voice";
import { isPlaceholder } from "@/lib/guidelines/config";
import { Pill } from "../Badges";
import { DoDont } from "../DoDont";
import { SectionHeader, SubHeading } from "../SectionHeader";

export function Voice() {
  return (
    <section id="voice" className="scroll-mt-32">
      <SectionHeader
        id="voice"
        number={5}
        title="Voice and tone"
        intro="Gamana sounds like a well-travelled friend who knows the story behind the place, and knows when to stay quiet."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {voicePillars.map((p) => (
          <div key={p.name} className="flex flex-col rounded-3xl border border-g-border bg-g-card p-6">
            <p className="font-display text-lg font-bold text-g-fg">{p.name}</p>
            <p className="mt-2 text-sm text-g-fg-muted">{p.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-g-success">Sounds like</p>
            <p className="mt-1 text-sm text-g-fg">{p.soundsLike}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-g-error">Never sounds like</p>
            <p className="mt-1 text-sm text-g-fg">{p.neverSoundsLike}</p>
          </div>
        ))}
      </div>

      <SubHeading id="voice-rules">Writing rules</SubHeading>
      <ul className="grid gap-3 sm:grid-cols-2">
        {writingRules.map((r) => (
          <li key={r.rule} className="rounded-3xl border border-g-border bg-g-card p-5">
            <p className="font-semibold text-g-fg">{r.rule}</p>
            <p className="mt-1 text-sm text-g-fg-muted">{r.example}</p>
          </li>
        ))}
      </ul>

      <SubHeading id="voice-tone-map">Tone map</SubHeading>
      <div className="overflow-x-auto rounded-3xl border border-g-border bg-g-card">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-g-border text-xs uppercase tracking-wider text-g-fg-subtle">
              <th scope="col" className="px-5 py-3 font-semibold">Moment</th>
              <th scope="col" className="px-3 py-3 font-semibold">Tone shift</th>
              <th scope="col" className="px-5 py-3 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-g-border">
            {toneMap.map((t) => (
              <tr key={t.moment}>
                <th scope="row" className="px-5 py-3 font-semibold text-g-fg">{t.moment}</th>
                <td className="px-3 py-3 text-g-fg-muted">{t.shift}</td>
                <td className="px-5 py-3 text-g-fg">“{t.example}”</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubHeading id="voice-pairs">Do and don't</SubHeading>
      <DoDont
        items={copyPairs.map((p) => ({
          do: <p className="text-center text-lg font-medium text-g-fg">“{p.do}”</p>,
          dont: <p className="text-center text-lg font-medium text-g-fg">“{p.dont}”</p>,
        }))}
      />

      <SubHeading id="voice-cta">CTA vocabulary</SubHeading>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ul className="divide-y divide-g-border rounded-3xl border border-g-border bg-g-card">
          {ctaVocabulary.map((c) => (
            <li key={c.cta} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
              <span className="w-40 shrink-0">
                <span className="inline-flex rounded-full bg-g-primary-strong px-4 py-1.5 text-sm font-semibold text-g-on-primary">
                  {c.cta}
                </span>
              </span>
              <span className="text-sm text-g-fg-muted">{c.when}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-3xl border border-g-border bg-g-card p-5">
          <p className="font-semibold text-g-fg">Banned phrases</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {bannedPhrases.map((b) => (
              <li key={b}>
                <Pill tone="error">{b}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SubHeading id="voice-errors">Error and empty states</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">Say what happened, why, and what to do next. Never blame the user.</p>
      <div className="grid gap-4 md:grid-cols-3">
        {errorPatterns.map((e) => (
          <div key={e.title} className="rounded-3xl border border-g-border bg-g-card p-5">
            <div className="flex items-start gap-3 rounded-2xl bg-g-surface p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-g-warning" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-g-fg">{e.problem}</p>
                <p className="mt-1 text-g-fg-muted">{e.cause}</p>
                <p className="mt-2 font-semibold text-g-primary-text">{e.next}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-1 text-xs text-g-fg-subtle">
              <div><dt className="inline font-semibold">Problem · </dt><dd className="inline">first line</dd></div>
              <div><dt className="inline font-semibold">Cause · </dt><dd className="inline">second line</dd></div>
              <div><dt className="inline font-semibold">Next step · </dt><dd className="inline">action</dd></div>
            </dl>
          </div>
        ))}
      </div>

      <SubHeading id="voice-narration">Narration voice</SubHeading>
      <div className="rounded-3xl border border-g-border bg-g-card p-6 text-g-fg-muted">
        <p>{narrationNote}</p>
        <p className="mt-2 text-sm">
          Content team doc:{" "}
          {isPlaceholder(CONTENT_DOC_URL) ? (
            <span className="font-mono">{CONTENT_DOC_URL}</span>
          ) : (
            <a className="focus-ring rounded text-g-primary-text underline" href={CONTENT_DOC_URL}>
              open
            </a>
          )}
        </p>
      </div>
    </section>
  );
}
