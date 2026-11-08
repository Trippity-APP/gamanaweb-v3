import { changelog } from "@/lib/guidelines/changelog";
import {
  APPROVAL_SLA_DAYS,
  BRAND_OWNER_EMAIL,
  BRAND_OWNER_ROLE,
  FIGMA_URL,
  GUIDELINES_DATE,
  GUIDELINES_STATUS,
  GUIDELINES_VERSION,
  isPlaceholder,
} from "@/lib/guidelines/config";
import { Pill } from "../Badges";
import { reportMailto } from "../Shell";
import { SectionHeader } from "../SectionHeader";

export function Changelog() {
  const ownerSet = !isPlaceholder(BRAND_OWNER_EMAIL);
  const figmaSet = !isPlaceholder(FIGMA_URL);

  return (
    <section id="changelog" className="scroll-mt-32">
      <SectionHeader
        id="changelog"
        number={13}
        title="Changelog and ownership"
        intro="What changed, when, and who to ask. Anything not covered here needs the brand owner's sign-off."
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ol className="space-y-4">
          {changelog.map((entry) => (
            <li key={entry.version} className="rounded-3xl border border-g-border bg-g-card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-bold text-g-fg">{entry.version}</span>
                <time dateTime={entry.date} className="text-sm text-g-fg-subtle">
                  {entry.date}
                </time>
              </div>
              <p className="mt-2 text-g-fg-muted">{entry.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {entry.sections.map((s) => (
                  <li key={s}>
                    <Pill>{s}</Pill>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-g-border bg-g-card p-6">
            <p className="font-semibold text-g-fg">Version</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-g-fg-subtle">Version</dt>
              <dd className="text-g-fg">{GUIDELINES_VERSION}</dd>
              <dt className="text-g-fg-subtle">Date</dt>
              <dd className="text-g-fg">{GUIDELINES_DATE}</dd>
              <dt className="text-g-fg-subtle">Status</dt>
              <dd className="text-g-fg">{GUIDELINES_STATUS}</dd>
            </dl>
          </div>
          <div className="rounded-3xl border border-g-border bg-g-card p-6 text-sm">
            <p className="font-semibold text-g-fg">Owner and approvals</p>
            <p className="mt-2 text-g-fg-muted">
              {BRAND_OWNER_ROLE} (brand owner). New uses and exceptions are reviewed within {APPROVAL_SLA_DAYS} business days.
            </p>
            <p className="mt-2">
              {ownerSet ? (
                <a className="focus-ring rounded text-g-primary-text underline" href={`mailto:${BRAND_OWNER_EMAIL}`}>
                  {BRAND_OWNER_EMAIL}
                </a>
              ) : (
                <span className="font-mono text-g-fg-muted">{BRAND_OWNER_EMAIL}</span>
              )}
            </p>
            {figmaSet && (
              <p className="mt-2">
                <a className="focus-ring rounded text-g-primary-text underline" href={FIGMA_URL} target="_blank" rel="noreferrer">
                  Figma file
                </a>
              </p>
            )}
            <div className="mt-4">
              {ownerSet ? (
                <a
                  href={reportMailto(BRAND_OWNER_EMAIL)}
                  className="focus-ring inline-flex min-h-[44px] items-center rounded-full bg-g-primary-strong px-5 font-semibold text-g-on-primary"
                >
                  Report an inconsistency
                </a>
              ) : (
                <p className="text-g-fg-subtle">“Report an inconsistency” activates once the owner email is set.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
