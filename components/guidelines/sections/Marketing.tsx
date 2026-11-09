/* eslint-disable @next/next/no-img-element -- brand files are served as-is */
import type { ReactNode } from "react";
import { Download } from "@/components/icons";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { getPhoto, type PhotoKey } from "@/lib/images";
import { QR_HEADLINE, QR_MULTILINGUAL_LINE } from "@/lib/guidelines/config";
import { emailSignature } from "@/lib/guidelines/content";
import { LogoMark } from "../LogoMark";
import { SectionHeader, SubHeading } from "../SectionHeader";

const QR = "/badges/download-qr.svg";
const APP_ICON = "/favicon-gamana.png";
const KIT = "/brand/templates";
const GAMANA_COLOR_LOGO = "/logo/gamana-logo-color.svg";
const PLACEHOLDER_SCREEN = "/brand-templates/store-listing/placeholder-screen.png";

/** Download link for one template export in the brand kit. */
function FileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border border-g-border-strong px-4 text-sm font-semibold text-g-fg"
    >
      <Download size={16} aria-hidden="true" />
      {label}
    </a>
  );
}

/** A scaled-down social frame: photo, scrim, safe zone, logo, headline, CTA pill. */
function SocialFrame({
  name,
  size,
  ratio,
  photo,
  headline,
  safe,
  file,
}: {
  name: string;
  size: string;
  ratio: string;
  photo: PhotoKey;
  headline: string;
  safe: string;
  file: string;
}) {
  const p = getPhoto(photo);
  return (
    <figure>
      <div className={`relative overflow-hidden rounded-2xl ${ratio}`}>
        <ResponsiveImage image={p} alt={p.alt} sizes="(min-width: 1024px) 280px, 45vw" fill />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-ink/40 to-transparent" aria-hidden="true" />
        <div className={`absolute border border-dashed border-white/70 ${safe}`} aria-hidden="true" />
        <div className={`absolute flex flex-col justify-between ${safe}`}>
          <LogoMark className="w-20 text-white" label="Gamana" />
          <div>
            <p className="font-display text-lg font-extrabold leading-tight text-white">{headline}</p>
            <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">Get the app</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-sm">
        <span className="font-semibold text-g-fg">{name}</span> <span className="text-g-fg-subtle">· {size}</span>
        <span className="mt-2 flex flex-wrap gap-2">
          <FileLink href={`${KIT}/social/${file}.png`} label={`${name} PNG`} />
          <FileLink href={`${KIT}/social/${file}-guides.png`} label="Guides" />
        </span>
      </figcaption>
    </figure>
  );
}

function Frame({ title, note, links, children }: { title: string; note: string; links?: ReactNode; children: ReactNode }) {
  return (
    <figure className="flex flex-col rounded-3xl border border-g-border bg-g-card p-5">
      <div className="flex flex-1 items-center justify-center rounded-2xl bg-sand-50 p-6">{children}</div>
      <figcaption className="mt-3 text-sm">
        <span className="font-semibold text-g-fg">{title}</span>
        <span className="mt-0.5 block text-g-fg-subtle">{note}</span>
        {links && <span className="mt-2 flex flex-wrap gap-2">{links}</span>}
      </figcaption>
    </figure>
  );
}

function QrBlock({ small }: { small?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={GAMANA_COLOR_LOGO} alt="Gamana" width={96} height={27} className={small ? "h-auto w-16" : "h-auto w-24"} />
      <p className={`mt-2 font-display font-extrabold text-ink ${small ? "text-sm" : "text-lg"}`}>{QR_HEADLINE}</p>
      <img src={QR} alt="QR code to download the Gamana app" className={`mt-2 rounded-lg bg-white p-1.5 ${small ? "h-16 w-16" : "h-24 w-24"}`} />
      <p className="mt-2 text-[10px] text-ink-soft">{QR_MULTILINGUAL_LINE}</p>
    </div>
  );
}

const CAPTIONS = ["Stories start as you arrive", "Works offline", "7 languages"];

export function Marketing() {
  return (
    <section id="marketing" className="scroll-mt-32">
      <SectionHeader
        id="marketing"
        number={10}
        title="Marketing templates"
        intro="Starting points built from the real tokens. Keep the logo in the safe zone, headlines in sentence case and one clear CTA."
      />

      <SubHeading id="marketing-social">Social</SubHeading>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <SocialFrame name="Instagram post" size="1080 × 1350" ratio="aspect-[4/5]" photo="slide-jaipur" headline="Hear the Pink City's stories" safe="inset-[6%]" file="instagram-post-1080x1350" />
        <SocialFrame name="Instagram story" size="1080 × 1920" ratio="aspect-[9/16]" photo="hero-storytelling" headline="The Ganga Aarti, explained" safe="inset-x-[6%] inset-y-[13%]" file="instagram-story-1080x1920" />
        <SocialFrame name="LinkedIn" size="1200 × 627" ratio="aspect-[1200/627]" photo="hero-ecosystem" headline="Partner with Gamana" safe="inset-[6%]" file="linkedin-1200x627" />
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-g-fg-muted sm:grid-cols-2">
        <li>Safe zone (dashed): 6% margin; stories keep 13% clear top and bottom for app UI.</li>
        <li>Reversed white logo top left; headline in the display face, sentence case.</li>
        <li>Photos always under the ink scrim; no filters.</li>
        <li>One CTA pill: “Get the app”, “Listen” or “Explore city”.</li>
      </ul>

      <SubHeading id="marketing-store">App Store and Play listing</SubHeading>
      <div className="grid gap-4 sm:grid-cols-3">
        {CAPTIONS.map((caption, i) => (
          <Frame
            key={caption}
            title={`Screenshot layout ${i + 1}`}
            note={["Caption top, device centred", "Device left, caption right", "Full-bleed photo, device overlap"][i]}
            links={
              <>
                <FileLink href={`${KIT}/store-listing/app-store-1290x2796-layout-${i + 1}.png`} label="App Store" />
                <FileLink href={`${KIT}/store-listing/play-1080x1920-layout-${i + 1}.png`} label="Play" />
              </>
            }
          >
            <div className={`flex w-full max-w-[180px] flex-col items-center gap-3 rounded-3xl bg-brand-950 p-4 ${i === 1 ? "!flex-row" : ""}`}>
              {i !== 2 && <p className="font-display text-sm font-bold text-white">{caption}</p>}
              <div className="relative aspect-[9/19] w-20 overflow-hidden rounded-[14px] border-4 border-ink bg-white">
                <img src={PLACEHOLDER_SCREEN} alt="Placeholder screen: drop the app screenshot here" className="h-full w-full object-cover" />
              </div>
              {i === 2 && <p className="font-display text-sm font-bold text-white">{caption}</p>}
            </div>
          </Frame>
        ))}
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Icon: use the app icon file unaltered, no added text or badges. Captions are five words or fewer, sentence case.
        Each export marks the exact screen area in pixels; replace the placeholder with a real app screenshot.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <img src={APP_ICON} alt="Gamana app icon" width={48} height={48} className="h-12 w-12 rounded-[22%]" />
        <span className="text-sm text-g-fg-subtle">Store icon</span>
      </div>

      <SubHeading id="marketing-qr">QR collateral for hotels and temples</SubHeading>
      <div className="grid gap-4 md:grid-cols-3">
        <Frame title="Table tent" note="A6 folded, both faces identical" links={<FileLink href={`${KIT}/qr/table-tent-a6.pdf`} label="Print PDF" />}>
          <div className="w-44 rounded-t-[40px] bg-white p-4 shadow-card">
            <QrBlock small />
          </div>
        </Frame>
        <Frame title="Key-card sleeve" note="Credit-card size insert" links={<FileLink href={`${KIT}/qr/key-card-sleeve.pdf`} label="Print PDF" />}>
          <div className="flex w-56 items-center gap-3 rounded-xl bg-white p-3 shadow-card">
            <img src={QR} alt="" className="h-16 w-16 rounded-md" />
            <div>
              <img src={GAMANA_COLOR_LOGO} alt="Gamana" width={64} height={18} className="h-auto w-16" />
              <p className="mt-1 font-display text-sm font-extrabold text-ink">{QR_HEADLINE}</p>
            </div>
          </div>
        </Frame>
        <Frame title="Entrance sign" note="A3 portrait, eye level" links={<FileLink href={`${KIT}/qr/entrance-sign-a3.pdf`} label="Print PDF" />}>
          <div className="w-44 rounded-2xl bg-white p-5 shadow-card">
            <QrBlock />
          </div>
        </Frame>
      </div>
      <ul className="mt-4 grid gap-2 text-sm text-g-fg-muted sm:grid-cols-2">
        <li>QR at least 25 mm (2 cm absolute minimum), dark on white.</li>
        <li>Quiet zone of 4 modules on every side; never place on a photo.</li>
        <li>Logo clear space applies; logo never inside the code.</li>
        <li>Headline “{QR_HEADLINE}” plus one local-language line.</li>
        <li>Print PDFs are at final size with 3 mm bleed and crop marks; the table tent folds on the marked line.</li>
      </ul>

      <SubHeading id="marketing-email">Email header and signature</SubHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <Frame title="Email header" note="600px wide, logo left, 1 line of copy">
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-card">
            <div className="flex items-center justify-between bg-brand-950 px-4 py-3">
              <LogoMark className="w-20 text-white" label="Gamana" />
              <span className="text-xs text-white/80">Your stories are waiting</span>
            </div>
            <div className="space-y-2 p-4">
              <div className="h-2 w-3/4 rounded-full bg-sand-200" />
              <div className="h-2 w-1/2 rounded-full bg-sand-200" />
            </div>
          </div>
        </Frame>
        <Frame
          title="Signature"
          note="HTML table, inline styles, Arial (mail clients skip web fonts) and the colour PNG logo; no banners"
          links={<FileLink href={`${KIT}/email/signature.html`} label="HTML signature" />}
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-4 font-[Arial,Helvetica,sans-serif] leading-[1.45] shadow-card">
            <p className="pb-1.5 text-sm font-bold text-ink">{emailSignature.signOff}</p>
            <p className="text-lg font-bold text-brand-900">{emailSignature.name}</p>
            <p className="pb-2 text-[13px] italic text-ink">{emailSignature.role}</p>
            <img src="/gamana-logo.png" alt="Gamana" width={emailSignature.logo.width} className="mb-2 block h-auto" />
            <p className="pb-1.5 text-[15px] font-bold text-ink">{emailSignature.website.label}</p>
            <p className="pb-2.5 text-xs text-ink">{emailSignature.company}</p>
            {emailSignature.lines.map((line, i) => (
              <p key={line.label} className={`text-[13px] text-ink ${i === emailSignature.lines.length - 1 ? "pb-3" : ""}`}>
                <span className="text-brand-700">{line.label}</span> {line.value}
              </p>
            ))}
            <p className="text-[10px] italic leading-[1.4] text-ink-muted">{emailSignature.disclaimer}</p>
          </div>
        </Frame>
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Download the editable exports in Downloads.
      </p>
    </section>
  );
}
