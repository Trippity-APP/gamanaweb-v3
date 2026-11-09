/* eslint-disable @next/next/no-img-element -- static export serves brand files as-is */
import type { ReactNode } from "react";
import { X } from "@/components/icons";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { getPhoto } from "@/lib/images";
import { DoDont } from "../DoDont";
import { LogoMark } from "../LogoMark";
import { Pill, ProposedBadge } from "../Badges";
import { SectionHeader, SubHeading } from "../SectionHeader";

const LOGO_PNG = "/gamana-logo.png";
const APP_ICON = "/favicon-gamana.png";
const COINS_ICON = "/coins-ic-gamana.png";

function Tile({ title, note, className, children }: { title: string; note?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <div className={`flex aspect-[16/9] items-center justify-center p-8 ${className ?? ""}`}>{children}</div>
      <figcaption className="border-t border-g-border px-5 py-3 text-sm">
        <span className="font-semibold text-g-fg">{title}</span>
        {note && <span className="mt-0.5 block text-g-fg-subtle">{note}</span>}
      </figcaption>
    </figure>
  );
}

const misuse: { label: string; render: ReactNode; className?: string }[] = [
  { label: "Don't stretch or squash", render: <LogoMark className="w-40 scale-x-150 text-ink" /> },
  { label: "Don't recolour", render: <LogoMark className="w-40 text-sunset-500" /> },
  { label: "Don't rotate", render: <LogoMark className="w-40 -rotate-12 text-ink" /> },
  {
    label: "Don't add effects or shadows",
    render: <img src={LOGO_PNG} alt="" className="w-40 drop-shadow-[4px_6px_4px_rgba(15,27,36,0.6)]" />,
  },
  {
    label: "Don't place on low-contrast backgrounds",
    render: <LogoMark className="w-40 text-sand-200" />,
    className: "bg-sand-50",
  },
  {
    label: "Don't crowd it",
    render: (
      <div className="flex w-full flex-col items-center gap-0.5 text-center text-xs font-semibold text-ink">
        <span>NEW · SALE · 50% OFF</span>
        <LogoMark className="w-40 text-ink" />
        <span>Download now!!</span>
      </div>
    ),
  },
  {
    label: "Don't outline it",
    render: (
      <LogoMark className="w-40 text-white [filter:drop-shadow(1px_0_0_rgb(15_27_36))_drop-shadow(-1px_0_0_rgb(15_27_36))_drop-shadow(0_1px_0_rgb(15_27_36))_drop-shadow(0_-1px_0_rgb(15_27_36))]" />
    ),
  },
  {
    label: "Don't retype the wordmark",
    render: (
      <span className="flex items-center gap-2">
        <img src={APP_ICON} alt="" className="h-10 w-10 rounded-lg" />
        <span className="font-script text-4xl text-ink">Gamana</span>
      </span>
    ),
  },
];

export function Logo() {
  const photo = getPhoto("hero-cities");
  return (
    <section id="logo" className="scroll-mt-32">
      <SectionHeader
        id="logo"
        number={2}
        title="Logo"
        intro="The pin-and-headphones mark says what Gamana is: stories tied to place, heard hands-free. Use the supplied files only, give the mark room and keep it legible."
      />

      <SubHeading id="lockups">Lockups and variants</SubHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <Tile title="Primary lockup, full colour" note="logo/gamana-logo-color.svg (vector) or gamana-logo.png." className="bg-white">
          <img src={LOGO_PNG} alt="Gamana logo, full colour" width={2000} height={589} className="h-auto w-56" />
        </Tile>
        <Tile title="Mono dark" note="For one-colour print and light photography." className="bg-white">
          <LogoMark className="w-56 text-ink" label="Gamana logo, mono dark" />
        </Tile>
        <Tile title="Reversed (white)" note="Default on dark and brand surfaces." className="bg-ink">
          <LogoMark className="w-56 text-white" label="Gamana logo, reversed white" />
        </Tile>
        <Tile title="App icon" note="favicon-gamana.png, 513 × 513." className="bg-g-surface">
          <img src={APP_ICON} alt="Gamana app icon" width={513} height={513} className="h-24 w-24 rounded-[22%]" />
        </Tile>
        <Tile title="Gamana Coins icon" note="coins-ic-gamana.png. Always shown with the word “Coins”." className="bg-g-surface">
          <span className="flex items-center gap-3">
            <img src={COINS_ICON} alt="Gamana Coins icon" width={249} height={249} className="h-16 w-16" />
            <span className="font-display text-2xl font-bold text-g-fg">120 Coins</span>
          </span>
        </Tile>
        <Tile title="Icon only" note="logo/gamana-icon.svg, plus white and black versions." className="bg-white">
          <span className="flex items-center gap-6">
            <img src="/logo/gamana-icon.svg" alt="Gamana icon, full colour" className="h-20 w-auto" />
            <img src="/logo/gamana-icon-black.svg" alt="Gamana icon, black" className="h-20 w-auto" />
            <span className="rounded-2xl bg-ink p-3">
              <img src="/logo/gamana-icon-white.svg" alt="Gamana icon, white" className="h-14 w-auto" />
            </span>
          </span>
        </Tile>
        <Tile title="Stacked lockup" note="logo/gamana-logo-stacked.svg, for square and narrow spaces." className="bg-white">
          <img src="/logo/gamana-logo-stacked.svg" alt="Gamana stacked logo, full colour" className="h-32 w-auto" />
        </Tile>
        <Tile title="Stacked, reversed" note="logo/gamana-logo-stacked-white.svg" className="bg-ink">
          <img src="/logo/gamana-logo-stacked-white.svg" alt="Gamana stacked logo, white" className="h-32 w-auto" />
        </Tile>
      </div>

      <SubHeading id="clear-space">Clear space and minimum size</SubHeading>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <figure className="rounded-3xl border border-g-border bg-white p-6">
          <div className="relative mx-auto w-fit border border-dashed border-sunset-500 p-[38px]">
            <img src={LOGO_PNG} alt="Gamana logo inside its clear-space boundary" width={2000} height={589} className="h-[76px] w-auto" />
            <span className="absolute left-0 top-1/2 flex w-[38px] -translate-y-1/2 justify-center text-xs font-bold text-sunset-600">
              ½x
            </span>
            <span className="absolute right-0 top-1/2 flex w-[38px] -translate-y-1/2 justify-center text-xs font-bold text-sunset-600">
              ½x
            </span>
            <span className="absolute left-1/2 top-0 flex h-[38px] -translate-x-1/2 items-center text-xs font-bold text-sunset-600">
              ½x
            </span>
            <span className="absolute bottom-0 left-1/2 flex h-[38px] -translate-x-1/2 items-center text-xs font-bold text-sunset-600">
              ½x
            </span>
          </div>
          <figcaption className="mt-4 text-sm text-ink-soft">
            <strong className="text-ink">x</strong> = the height of the pin icon. Keep at least ½x clear on every side, more
            in busy layouts.
          </figcaption>
        </figure>
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-lg font-bold text-g-fg">Minimum sizes</p>
            <ProposedBadge>Proposed</ProposedBadge>
          </div>
          <dl className="mt-4 divide-y divide-g-border text-sm">
            {[
              ["Lockup, digital", "96 px wide"],
              ["Lockup, print", "25 mm wide"],
              ["Icon only, digital", "24 px"],
              ["Icon only, print", "8 mm"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-g-fg-muted">{k}</dt>
                <dd className="font-mono text-g-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-g-fg-muted">Placement default: top left in headers, aligned to the content grid.</p>
        </div>
      </div>

      <SubHeading id="backgrounds">Approved backgrounds</SubHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile title="Light" note="Full colour or mono dark" className="bg-white">
          <img src={LOGO_PNG} alt="Gamana logo on a light background" width={2000} height={589} className="w-full" />
        </Tile>
        <Tile title="Dark" note="Reversed white" className="bg-ink">
          <LogoMark className="w-full text-white" label="Gamana logo on a dark background" />
        </Tile>
        <Tile title="Brand teal" note="Reversed white on brand 700" className="bg-brand-700">
          <LogoMark className="w-full text-white" label="Gamana logo on brand teal" />
        </Tile>
        <figure className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
          <div className="relative flex aspect-[16/9] items-center justify-center p-8">
            <ResponsiveImage image={photo} alt={photo.alt} sizes="(min-width: 1024px) 240px, 50vw" fill />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" aria-hidden="true" />
            <LogoMark className="relative w-full text-white" label="Gamana logo on a photo with a dark scrim" />
          </div>
          <figcaption className="border-t border-g-border px-5 py-3 text-sm">
            <span className="font-semibold text-g-fg">Photo with scrim</span>
            <span className="mt-0.5 block text-g-fg-subtle">Reversed white over the photo scrim</span>
          </figcaption>
        </figure>
      </div>

      <SubHeading id="misuse">Misuse</SubHeading>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {misuse.map((m) => (
          <li key={m.label} className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
            <div className={`relative flex aspect-square items-center justify-center overflow-hidden p-4 ${m.className ?? "bg-white"}`}>
              {m.render}
              <span
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-g-error text-g-bg"
                aria-hidden="true"
              >
                <X size={14} />
              </span>
            </div>
            <p className="border-t border-g-border px-4 py-3 text-sm font-medium text-g-fg">{m.label}</p>
          </li>
        ))}
      </ul>

      <SubHeading id="app-icon">App icon</SubHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <figure className="flex flex-col items-center rounded-3xl border border-g-border bg-g-card p-6">
          <img src="/logo/app-icon/ios-1024.png" alt="Gamana app icon in the iOS rounded-square mask" width={1024} height={1024} className="h-32 w-32 rounded-[22%]" />
          <figcaption className="mt-4 text-center text-sm text-g-fg-muted">
            <strong className="text-g-fg">iOS:</strong> supply a square 1024 × 1024 file with no transparency; iOS applies the mask.
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center rounded-3xl border border-g-border bg-g-card p-6">
          <div className="relative h-32 w-32">
            <img src="/logo/app-icon/android-adaptive-background.png" alt="" width={432} height={432} className="absolute inset-0 h-32 w-32 rounded-full" />
            <img src="/logo/app-icon/android-adaptive-foreground.png" alt="Gamana app icon in the Android adaptive circle mask" width={432} height={432} className="relative h-32 w-32 rounded-full" />
            <span className="absolute inset-[17%] rounded-full border-2 border-dashed border-white" aria-hidden="true" />
          </div>
          <figcaption className="mt-4 text-center text-sm text-g-fg-muted">
            <strong className="text-g-fg">Android adaptive:</strong> keep the mark inside the central 66% safe zone (dashed).
          </figcaption>
        </figure>
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Files: <code className="font-mono">app-icon/ios-1024.png</code>, <code className="font-mono">android-512.png</code>,{" "}
        <code className="font-mono">android-adaptive-foreground.png</code> and{" "}
        <code className="font-mono">android-adaptive-background.png</code>, all in Downloads.
      </p>

      <SubHeading id="store-badges">Store badges</SubHeading>
      <div className="rounded-3xl border border-g-border bg-g-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <img src="/badges/app-store-badge.svg" alt="Download on the App Store badge" className="h-12 w-auto" />
          <img src="/badges/google-play-badge.svg" alt="Get it on Google Play badge" className="h-12 w-auto" />
        </div>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-g-fg-muted">
          <li>Use the official badges unaltered: no recolouring, cropping or added effects.</li>
          <li>Minimum height 40 px on screen; keep a gap of at least ¼ of the badge height between badges.</li>
          <li>Show both badges at the same height, App Store first.</li>
          <li>
            Vendor rules:{" "}
            <a
              className="focus-ring rounded text-g-primary-text underline"
              href="https://developer.apple.com/app-store/marketing/guidelines/"
              target="_blank"
              rel="noreferrer"
            >
              Apple
            </a>{" "}
            ·{" "}
            <a
              className="focus-ring rounded text-g-primary-text underline"
              href="https://partnermarketinghub.withgoogle.com/brands/google-play/"
              target="_blank"
              rel="noreferrer"
            >
              Google Play
            </a>
          </li>
        </ul>
        <p className="mt-3">
          <Pill>google-play-badge.png is supplied as SVG in the repo</Pill>
        </p>
      </div>

      <DoDont
        items={[
          {
            do: <LogoMark className="w-48 text-g-fg" label="Logo with generous clear space" />,
            doCaption: "Give the logo clear space and a calm background.",
            dont: (
              <div className="relative h-24 w-48 overflow-hidden rounded-2xl">
                <ResponsiveImage image={photo} alt="" sizes="200px" fill />
                <LogoMark className="relative mx-auto mt-8 w-36 text-brand-600" label="Logo directly on a busy photo" />
              </div>
            ),
            dontCaption: "Put the teal logo straight onto a busy photo without a scrim.",
          },
        ]}
      />
    </section>
  );
}
