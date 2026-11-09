import type { ReactNode } from "react";
import { Download } from "@/components/icons";
import {
  BRAND_OWNER_EMAIL,
  BRAND_OWNER_NAME,
  BRAND_OWNER_ROLE,
  GUIDELINES_DATE,
  GUIDELINES_STATUS,
  GUIDELINES_VERSION,
  SECTIONS,
  isPlaceholder,
} from "@/lib/guidelines/config";
import { LogoMark } from "./LogoMark";
import { ThemeToggle } from "./ThemeToggle";
import { Toc } from "./Toc";

export const REPORT_SUBJECT = "Guidelines v1 inconsistency";
export const reportMailto = (email: string) =>
  `mailto:${email}?subject=${encodeURIComponent(REPORT_SUBJECT)}&body=${encodeURIComponent(
    "Section:\nWhat I saw:\nWhat the guidelines say:\nScreenshot/URL:"
  )}`;

export function Shell({ children }: { children: ReactNode }) {
  const ownerEmailSet = !isPlaceholder(BRAND_OWNER_EMAIL);

  return (
    <>
      <p className="bg-g-warning-bg px-4 py-2 text-center text-sm font-medium text-g-warning">
        Internal — do not share outside Gamana and approved partners.
      </p>

      <header className="sticky top-0 z-40 border-b border-g-border bg-g-bg">
        <div className="container-site flex h-16 items-center gap-3">
          {/* Plain <a>: a full page load drops the guidelines theme before the live site renders. */}
          <a href="/" aria-label="Gamana home" className="focus-ring flex min-h-[44px] items-center rounded-lg text-g-fg">
            <LogoMark className="w-28" label="" />
          </a>
          <span className="hidden text-sm font-semibold text-g-fg sm:inline">Brand guidelines</span>
          <span className="rounded-full border border-g-border px-2 py-0.5 font-mono text-xs text-g-fg-muted">
            {GUIDELINES_VERSION}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#downloads"
              className="focus-ring hidden min-h-[44px] items-center gap-2 rounded-full bg-g-primary-strong px-5 text-sm font-semibold text-g-on-primary transition-transform duration-300 ease-spring hover:-translate-y-0.5 md:inline-flex"
            >
              <Download size={16} aria-hidden="true" />
              Download brand kit
            </a>
          </div>
        </div>
      </header>

      <div className="container-site lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:py-12">
          <Toc sections={[...SECTIONS]} />
        </aside>
        <main id="main" className="min-w-0 max-w-[960px] py-12">
          <div className="mb-16">
            <p className="eyebrow !text-g-primary-text">
              {GUIDELINES_VERSION} · {GUIDELINES_DATE} · {GUIDELINES_STATUS}
            </p>
            <h1 className="text-display mt-4 text-g-fg">Gamana brand guidelines</h1>
            <p className="text-lead mt-5 max-w-[68ch] text-g-fg-muted">
              How Gamana looks, sounds and behaves, built from the same tokens and components as gamana.app.
              Click any value to copy it.
            </p>
          </div>
          {children}
        </main>
      </div>

      <footer className="border-t border-g-border bg-g-surface">
        <div className="container-site flex flex-col gap-4 py-10 text-sm text-g-fg-muted md:flex-row md:items-center md:justify-between">
          <p>
            Owner: <strong className="text-g-fg">{BRAND_OWNER_NAME}</strong>, {BRAND_OWNER_ROLE}
            {" · "}
            {ownerEmailSet ? (
              <a className="focus-ring rounded text-g-primary-text underline" href={`mailto:${BRAND_OWNER_EMAIL}`}>
                {BRAND_OWNER_EMAIL}
              </a>
            ) : (
              <span className="font-mono">{BRAND_OWNER_EMAIL}</span>
            )}
          </p>
          {ownerEmailSet ? (
            <a
              href={reportMailto(BRAND_OWNER_EMAIL)}
              className="focus-ring inline-flex min-h-[44px] items-center rounded-full border border-g-border-strong px-5 font-semibold text-g-fg"
            >
              Report an inconsistency
            </a>
          ) : (
            <p>Report an inconsistency: available once the owner email is set.</p>
          )}
        </div>
      </footer>
    </>
  );
}
