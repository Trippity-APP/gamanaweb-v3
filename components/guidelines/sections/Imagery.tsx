/* eslint-disable @next/next/no-img-element -- narrator portraits are static files */
import type { ReactNode } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Download,
  Gift,
  Globe,
  Headphones,
  Heart,
  Languages,
  Lock,
  Map,
  MapPin,
  Pause,
  Play,
  Search,
  Share2,
  Star,
  Ticket,
  User,
  WifiOff,
  X,
  type LucideIcon,
} from "@/components/icons";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { NARRATORS } from "@/lib/data/narrators";
import { getPhoto, type PhotoKey } from "@/lib/images";
import { CopyChip } from "../CopyChip";
import { Placeholder } from "../Badges";
import { SectionHeader, SubHeading } from "../SectionHeader";

const DO_PHOTOS: { key: PhotoKey; why: string }[] = [
  { key: "slide-jaipur", why: "Golden hour, real landmark" },
  { key: "hero-storytelling", why: "Ritual shown with respect" },
  { key: "hero-ecosystem", why: "Local people, real moment" },
  { key: "hero-local-languages", why: "Dusk light, sense of place" },
  { key: "hero-immersive", why: "Human scale, product in use" },
  { key: "slide-rome", why: "Warm light, no heavy edit" },
];

function PhotoTile({ k, caption, className, children }: { k: PhotoKey; caption: string; className?: string; children?: ReactNode }) {
  const photo = getPhoto(k);
  return (
    <figure className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ResponsiveImage image={photo} alt={photo.alt} sizes="(min-width: 1024px) 300px, 50vw" fill className={className} />
        {children}
      </div>
      <figcaption className="px-4 py-3 text-sm text-g-fg">{caption}</figcaption>
    </figure>
  );
}

const ICONS: [string, LucideIcon][] = [
  ["MapPin", MapPin],
  ["Headphones", Headphones],
  ["Play", Play],
  ["Pause", Pause],
  ["Download", Download],
  ["WifiOff", WifiOff],
  ["Languages", Languages],
  ["Search", Search],
  ["Star", Star],
  ["Clock", Clock],
  ["Compass", Compass],
  ["Map", Map],
  ["Ticket", Ticket],
  ["Gift", Gift],
  ["Heart", Heart],
  ["Share2", Share2],
  ["Lock", Lock],
  ["Check", Check],
  ["X", X],
  ["ChevronRight", ChevronRight],
  ["ArrowRight", ArrowRight],
  ["Globe", Globe],
  ["Calendar", Calendar],
  ["User", User],
];

const AI_POLICY = [
  "Allowed only for abstract backgrounds, illustrations and internal concepts.",
  "Never depict a real destination as if it were a photograph.",
  "Never depict religious figures, rituals or real people.",
  "Any image near a sacred site gets a human cultural review before use.",
  "Label AI use in the filename (…-ai.png) and in the brand-kit metadata.",
];

export function Imagery() {
  const narratorPhoto = NARRATORS[1];
  return (
    <section id="imagery" className="scroll-mt-32">
      <SectionHeader
        id="imagery"
        number={6}
        title="Imagery, narrators and icons"
        intro="Real places in real light, with people at human scale. Imagery should make you want to stand there, not look like an advert."
      />

      <SubHeading id="imagery-photo">Photography</SubHeading>
      <ul className="mb-6 grid gap-2 text-sm text-g-fg-muted sm:grid-cols-2">
        {[
          "Real destinations only; golden hour and dusk preferred.",
          "Human scale: local life over empty landmarks.",
          "No staged stock tourists, no heavy filters or HDR.",
          "Only photos licensed in the repo (lib/data/image-manifest.json).",
        ].map((r) => (
          <li key={r} className="flex gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-g-success" aria-hidden="true" />
            {r}
          </li>
        ))}
      </ul>
      <p className="mb-3 text-sm font-semibold text-g-success">Do</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {DO_PHOTOS.map((p) => (
          <PhotoTile key={p.key} k={p.key} caption={p.why} />
        ))}
      </div>
      <p className="mb-3 mt-8 text-sm font-semibold text-g-error">Don't</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PhotoTile k="slide-jaipur" caption="Heavy filters or colour shifts" className="saturate-[2.5] hue-rotate-[40deg] contrast-150" />
        <PhotoTile k="slide-goa" caption="Text on a photo without a scrim">
          <p className="absolute inset-x-3 top-1/3 text-center font-display text-xl font-extrabold text-white">Explore Goa today</p>
        </PhotoTile>
        <PhotoTile k="slide-delhi" caption="Stretched or distorted crops" className="!object-fill scale-x-150" />
        <figure className="overflow-hidden rounded-3xl border border-g-border bg-g-card">
          <Placeholder name="staged-stock-tourists.jpg" className="aspect-[4/3] rounded-none border-0" />
          <figcaption className="px-4 py-3 text-sm text-g-fg">Staged stock tourists</figcaption>
        </figure>
      </div>

      <SubHeading id="imagery-crop">Crops and text on photos</SubHeading>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { ratio: "aspect-[16/9]", label: "Hero 16:9" },
          { ratio: "aspect-[4/3]", label: "Card 4:3" },
          { ratio: "aspect-square", label: "Story 1:1" },
          { ratio: "aspect-[4/5]", label: "Portrait 4:5" },
        ].map((r) => {
          const photo = getPhoto("hero-virtual-guides");
          return (
            <figure key={r.label}>
              <div className={`relative overflow-hidden rounded-2xl ${r.ratio}`}>
                <ResponsiveImage image={photo} alt={`${photo.alt}, cropped ${r.label}`} sizes="25vw" fill />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" aria-hidden="true" />
                <p className="absolute bottom-3 left-3 font-display text-sm font-bold text-white">Jodhpur</p>
              </div>
              <figcaption className="mt-2 text-sm text-g-fg-muted">{r.label}</figcaption>
            </figure>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-g-fg-muted">
        Text on photography always sits on the photo scrim, and the text must reach 4.5:1 against the darkest part
        behind it.
      </p>
      <div className="mt-2">
        <CopyChip value="bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" label="Scrim" />
      </div>

      <SubHeading id="imagery-narrators">Narrators</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">
        Narrators come from <code className="font-mono text-sm">lib/data/narrators.ts</code>. Caption format:{" "}
        <strong className="text-g-fg">Name · Role</strong>, then demographics in small text.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NARRATORS.map((n) => (
          <li key={n.name} className="flex items-center gap-4 rounded-3xl border border-g-border bg-g-card p-4">
            <img src={n.image} alt={`${n.name}, Gamana narrator`} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="font-display font-bold text-g-fg">
                {n.name} · <span className="font-sans font-medium text-g-fg-muted">{n.role}</span>
              </p>
              <p className="text-xs text-g-fg-subtle">{n.demographics}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Sizes and states</p>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            {[24, 40, 64, 96].map((s) => (
              <figure key={s} className="text-center">
                <img
                  src={narratorPhoto.image}
                  alt=""
                  width={s}
                  height={s}
                  style={{ width: s, height: s }}
                  className="rounded-full object-cover"
                />
                <figcaption className="mt-1 font-mono text-xs text-g-fg-subtle">{s}px</figcaption>
              </figure>
            ))}
            <figure className="text-center">
              <img
                src={narratorPhoto.image}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-g-primary ring-offset-2 ring-offset-g-card"
              />
              <figcaption className="mt-1 text-xs text-g-fg-subtle">Now playing</figcaption>
            </figure>
            <figure className="text-center">
              <img src={narratorPhoto.image} alt="" width={96} height={120} className="h-[120px] w-24 rounded-3xl object-cover" />
              <figcaption className="mt-1 text-xs text-g-fg-subtle">Portrait 4:5</figcaption>
            </figure>
          </div>
          <p className="mt-4 text-sm text-g-fg-muted">
            Circles for lists and the player; portraits for narrator cards. Only the now-playing narrator gets the primary
            ring.
          </p>
        </div>
        <div className="rounded-3xl border border-g-border bg-g-card p-6">
          <p className="font-semibold text-g-fg">Adding a new narrator</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-g-fg-muted">
            <li>Voice model signed off by the content lead.</li>
            <li>Avatar matches the existing illustration style.</li>
            <li>Caption copy: name, role, demographics.</li>
            <li>Language coverage listed.</li>
            <li>Cultural review for the regions they narrate.</li>
          </ol>
        </div>
      </div>

      <SubHeading id="imagery-icons">Icons</SubHeading>
      <p className="-mt-2 mb-5 max-w-[65ch] text-g-fg-muted">
        Phosphor icons through <code className="font-mono text-sm">@/components/icons</code>. Bold weight by default; add a{" "}
        <code className="font-mono text-sm">fill-*</code> class for the solid weight. Sizes 16, 20 and 24; colour inherits from
        text. Never mix in another icon set.
      </p>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {ICONS.map(([name, Icon]) => (
          <li key={name} className="flex flex-col items-center gap-2 rounded-2xl border border-g-border bg-g-card p-3 text-g-fg">
            <Icon size={24} aria-hidden="true" />
            <span className="w-full truncate text-center font-mono text-[11px] text-g-fg-subtle">{name}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-end gap-6 text-g-fg">
        {[16, 20, 24].map((s) => (
          <span key={s} className="flex flex-col items-center gap-1">
            <Headphones size={s} aria-hidden="true" />
            <span className="font-mono text-xs text-g-fg-subtle">{s}</span>
          </span>
        ))}
      </div>

      <SubHeading id="imagery-ai">AI imagery policy</SubHeading>
      <ol className="space-y-2 rounded-3xl border border-g-border bg-g-card p-6">
        {AI_POLICY.map((p, i) => (
          <li key={p} className="flex gap-3 text-sm text-g-fg">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-g-info-bg font-mono text-xs font-bold text-g-info">
              {i + 1}
            </span>
            {p}
          </li>
        ))}
      </ol>
    </section>
  );
}
