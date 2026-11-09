/* eslint-disable @next/next/no-img-element -- partner logo files are shown as supplied */
import { Check } from "@/components/icons";
import { APPROVAL_SLA_DAYS, BRAND_OWNER_EMAIL, BRAND_OWNER_NAME, isPlaceholder } from "@/lib/guidelines/config";
import { AccentChecker } from "../AccentChecker";
import { LogoMark } from "../LogoMark";
import { ProposedBadge } from "../Badges";
import { SectionHeader, SubHeading } from "../SectionHeader";

/** Example partner used to demonstrate the lockups; swap per partner. */
const PARTNER_LOGO = {
  name: "The Organization Learning Labs",
  light: "/brand-templates/partners/partner-logo-light.png",
  dark: "/brand-templates/partners/partner-logo-dark.png",
};

const GAMANA_COLOR_LOGO = "/logo/gamana-logo-color.svg";

function Lockup({ label, stacked, dark }: { label: string; stacked?: boolean; dark?: boolean }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <div className={`flex min-h-[160px] items-center justify-center p-6 ${dark ? "bg-ink" : "bg-white"}`}>
        <div className={`flex items-center gap-4 ${stacked ? "flex-col" : ""}`}>
          <img
            src={dark ? PARTNER_LOGO.dark : PARTNER_LOGO.light}
            alt={`${PARTNER_LOGO.name} logo (example partner)`}
            width={177}
            height={68}
            className="h-12 w-auto"
          />
          <span className={stacked ? "h-px w-24 bg-sand-200" : "h-10 w-px bg-sand-200"} aria-hidden="true" />
          <div className={`flex flex-col ${stacked ? "items-center" : "items-start"}`}>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-white/80" : "text-ink-soft"}`}>
              {label}
            </span>
            {dark ? (
              <LogoMark className="mt-1 w-24 text-white" label="Gamana" />
            ) : (
              <img src={GAMANA_COLOR_LOGO} alt="Gamana" width={96} height={27} className="mt-1 h-auto w-24" />
            )}
          </div>
        </div>
      </div>
      <figcaption className="border-t border-g-border px-5 py-3 text-sm text-g-fg">
        “{label} Gamana”, {stacked ? "stacked" : "horizontal"}, {dark ? "dark" : "light"}
      </figcaption>
    </figure>
  );
}

const LOCKED = [
  "Gamana logo geometry and colour",
  "Core type families (Plus Jakarta Sans, Inter)",
  "Semantic colours (success, warning, error)",
  "Player controls layout",
  "Coins iconography",
];
const OVERRIDABLE = [
  "Partner logo",
  "Accent colour, within contrast limits",
  "Intro audio",
  "Welcome copy",
];

const STEPS = [
  `Submit the brief and assets to ${BRAND_OWNER_NAME}.`,
  `${BRAND_OWNER_NAME} reviews within ${APPROVAL_SLA_DAYS} business days.`,
  "Provide a proof (mockup) of the final placement.",
  "Get written sign-off before anything is printed or published.",
  "Log the approval in the changelog and approvals register.",
];

const NEEDS_APPROVAL = [
  ["New co-branded print or signage", true],
  ["Partner accent colour in the app", true],
  ["Paid ads using the Gamana name", true],
  ["Sharing a gamana.app link or store badges as supplied", false],
  ["Using the supplied social templates unchanged", false],
] as const;

const CHECKLIST = [
  "Using the supplied logo files, not a redrawn or screenshotted logo",
  "Gamana logo no larger than the partner logo",
  "Clear space respected around both logos",
  "Logo on an approved background",
  "Partner colour only on accents, never body text",
  "Text passes 4.5:1 contrast",
  "Copy in sentence case and Gamana's voice",
  "Store badges official and unaltered",
];

export function Partners() {
  const ownerSet = !isPlaceholder(BRAND_OWNER_EMAIL);
  return (
    <section id="partners" className="scroll-mt-32">
      <SectionHeader
        id="partners"
        number={11}
        title="Partner co-brand"
        intro="Hotels, attractions and tour partners can carry Gamana inside their own brand. These rules keep both brands clear."
      />

      <SubHeading id="partners-lockups">Lockups</SubHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <Lockup label="Powered by" />
        <Lockup label="In partnership with" />
        <Lockup label="Powered by" stacked />
        <Lockup label="In partnership with" stacked dark />
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Use the full-colour teal Gamana logo on light backgrounds and the reversed white logo on dark; never black. Gamana is never taller than 100% of the partner logo height. Clear space applies to both marks. Approved
        backgrounds are the same as for the Gamana logo.
      </p>

      <SubHeading id="partners-locked">Locked and overridable</SubHeading>
      <div className="mb-3">
        <ProposedBadge>Proposed · owner to confirm</ProposedBadge>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Locked</p>
          <ul className="mt-3 space-y-2 text-sm text-g-fg-muted">
            {LOCKED.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Overridable by partner (in-app org branding)</p>
          <ul className="mt-3 space-y-2 text-sm text-g-fg-muted">
            {OVERRIDABLE.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AccentChecker />
        <div className="rounded-3xl border border-g-border bg-g-card p-6 text-sm text-g-fg-muted">
          <p className="font-semibold text-g-fg">White-label rules</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Partner colour goes on accents only: buttons, active states and the header strip.</li>
            <li>Never on body text, and never on Gamana-owned marks (logo, Coins).</li>
            <li>Accents must reach 3:1 on white and dark surfaces, otherwise Gamana teal is used.</li>
          </ul>
        </div>
      </div>

      <SubHeading id="partners-approval">Approval process</SubHeading>
      <div className="grid gap-4 lg:grid-cols-2">
        <ol className="space-y-3 rounded-3xl border border-g-border bg-g-card p-6">
          {STEPS.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-g-fg">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-g-info-bg font-mono text-xs font-bold text-g-info">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
          <li className="pt-1 text-sm text-g-fg-muted">
            Contact:{" "}
            {ownerSet ? (
              <a className="focus-ring rounded text-g-primary-text underline" href={`mailto:${BRAND_OWNER_EMAIL}`}>
                {BRAND_OWNER_EMAIL}
              </a>
            ) : (
              <span className="font-mono">{BRAND_OWNER_EMAIL}</span>
            )}
          </li>
        </ol>
        <div className="overflow-x-auto rounded-3xl border border-g-border bg-g-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">What needs approval</caption>
            <thead>
              <tr className="border-b border-g-border text-xs uppercase tracking-wider text-g-fg-subtle">
                <th scope="col" className="px-5 py-3 font-semibold">Use</th>
                <th scope="col" className="px-5 py-3 font-semibold">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-g-border">
              {NEEDS_APPROVAL.map(([use, needed]) => (
                <tr key={use}>
                  <td className="px-5 py-2.5 text-g-fg">{use}</td>
                  <td className={`px-5 py-2.5 font-semibold ${needed ? "text-g-warning" : "text-g-success"}`}>
                    {needed ? "Needed" : "Not needed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SubHeading id="partners-checklist">Self-review checklist</SubHeading>
      <ul className="grid gap-2 rounded-3xl border border-g-border bg-g-card p-6 sm:grid-cols-2">
        {CHECKLIST.map((c) => (
          <li key={c} className="flex gap-2 text-sm text-g-fg">
            <Check size={16} className="mt-0.5 shrink-0 text-g-success" aria-hidden="true" />
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}
