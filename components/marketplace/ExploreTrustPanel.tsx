'use client';

import { CloudDownload, Globe, Headphones, Smartphone, Users2 } from '@/components/icons';
import { IconTile, type IconTone, type TileIcon } from '@/components/icons/IconTile';
import { GetAppFreeButton } from '@/components/DownloadAppDialog';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeader } from '@/components/site/SectionHeader';

const WHY_GAMANA: { icon: TileIcon; tone: IconTone; title: string; description: string }[] = [
  { icon: Headphones, tone: 'teal', title: 'Audio-first', description: 'Hands-free, made for walking and looking up, not down.' },
  { icon: CloudDownload, tone: 'sunset', title: 'Works offline', description: 'Download once, then listen with no signal.' },
  { icon: Users2, tone: 'lilac', title: 'Your pick of narrator', description: 'Scholarly, devotional, comic or local, choose the voice that suits you.' },
  { icon: Globe, tone: 'mint', title: 'Global coverage', description: 'Heritage walks across India and landmarks around the world.' },
];

/** "Why Gamana" band shown below the explore catalog results. */
export function ExploreWhyGamana() {
  return (
    <section aria-labelledby="why-gamana-heading" className="container-site pb-16 pt-10 sm:pb-20">
      <div className="rounded-4xl border border-ink/5 bg-white/60 p-5 sm:p-8 lg:p-10">
        <SectionHeader
          align="left"
          eyebrow="Why Gamana"
          title={<span id="why-gamana-heading">Made for exploring on foot</span>}
          className="mb-8 sm:mb-10"
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_GAMANA.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 80} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-ink/5 bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-lift">
                <IconTile icon={item.icon} tone={item.tone} />
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-sand-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-sm text-ink-soft">
            <Smartphone className="h-4 w-4 shrink-0 text-brand-700" weight="fill" aria-hidden />
            Unlocks play in the Gamana app. Sign in with the same account.
          </p>
          <GetAppFreeButton
            source="explore-why-gamana"
            className="focus-ring inline-flex min-h-11 shrink-0 items-center rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          />
        </div>
      </div>
    </section>
  );
}
