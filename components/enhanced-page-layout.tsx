import { LucideIcon, Check, Sparkles, Star, TrendingUp, ArrowRight } from '@/components/icons';
import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeroHeader from '@/components/navigation/hero-header';
import Footer from '@/components/navigation/footer';
import { PageHero } from '@/components/site/PageHero';
import { SectionHeader } from '@/components/site/SectionHeader';
import { StoreBadges } from '@/components/site/StoreBadges';
import { DownloadBand } from '@/components/site/DownloadBand';
import { CardRail } from '@/components/site/CardRail';
import { Reveal } from '@/components/motion/Reveal';
import { FEATURES, featureHref, type FeatureSlug } from '@/lib/data/features';
import { HERITAGE_BADGE_LABELS } from '@/lib/data/nav-config';
import type { ImageVariant } from '@/lib/images';

import { IconTile, toneFor } from "@/components/icons/IconTile";
interface Benefit {
  text: string;
}

interface Example {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface QuickFeature {
  icon: LucideIcon;
  title: string;
}

interface EnhancedPageLayoutProps {
  slug: FeatureSlug;
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  introTitle: string;
  introText: string[];
  benefits: Benefit[];
  examples: Example[];
  quickFeatures?: QuickFeature[];
  /** Overrides the feature's manifest photo. */
  heroImage?: string | ImageVariant;
  /** Page h1; falls back to `title`, which stays the short feature name used in links. */
  heading?: string;
  heroAlt?: string;
  heroTitle?: string;
}

const defaultQuickFeatures: QuickFeature[] = [
  { icon: Sparkles, title: 'Story-Rich' },
  { icon: Star, title: 'Premium Quality' },
  { icon: TrendingUp, title: 'Constantly Improving' },
];

export default function EnhancedPageLayout({
  slug,
  icon: Icon,
  title,
  subtitle,
  introTitle,
  introText,
  benefits,
  examples,
  quickFeatures = defaultQuickFeatures,
  heroImage,
  heading,
  heroAlt = '',
  heroTitle,
}: EnhancedPageLayoutProps) {
  const feature = FEATURES.find((f) => f.slug === slug)!;
  const siblings = FEATURES.filter((f) => f.slug !== slug);

  return (
    <>
      <HeroHeader transparent />
      <main>
        <PageHero
          size="lg"
          image={heroImage ?? feature.photo}
          imageAlt={heroAlt}
          imageTitle={heroTitle}
          breadcrumbs={[
            { label: 'Features', href: '/features/' },
            { label: title, href: featureHref(slug) },
          ]}
          eyebrow={title}
          heading={heading ?? title}
          subtitle={subtitle}
        >
          <StoreBadges source={`feature_${slug}_hero`} labels={HERITAGE_BADGE_LABELS} size="lg" priority />
          <ul className="flex basis-full flex-wrap gap-2.5 pt-2">
            {quickFeatures.map((q) => {
              const QIcon = q.icon;
              return (
                <li
                  key={q.title}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md"
                >
                  <QIcon className="h-4 w-4 text-sunset-300" aria-hidden />
                  {q.title}
                </li>
              );
            })}
          </ul>
        </PageHero>

        <section className="section bg-white">
          <div className="container-site grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <Reveal className="space-y-6">
              <p className="eyebrow text-brand-700">
                <span className="h-px w-6 bg-brand-600" aria-hidden />
                Feature Spotlight
              </p>
              <h2 className="text-h2 text-balance text-ink">{introTitle}</h2>
              {introText.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </Reveal>

            <Reveal variant="scale" delay={120}>
              <div className="relative overflow-hidden rounded-4xl border border-ink/5 bg-sand-50 p-8 shadow-card sm:p-10">
                <span className="absolute -right-6 -top-6 grid h-28 w-28 place-items-center rounded-full bg-brand-100/70" aria-hidden>
                  <Icon className="h-10 w-10 text-brand-600" />
                </span>
                <h3 className="text-h3 relative text-ink">Key Benefits</h3>
                <ul className="relative mt-6 space-y-4">
                  {benefits.map((benefit, index) => (
                    <Reveal as="li" key={benefit.text} delay={200 + index * 90} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-sm">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="font-medium text-ink">{benefit.text}</span>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section bg-sand-50">
          <div className="container-site">
            <SectionHeader eyebrow="How It Works" title="Experience the Difference" />
            <div className="grid gap-6 md:grid-cols-3">
              {examples.map((example, index) => {
                const ExampleIcon = example.icon;
                return (
                  <Reveal key={example.title} delay={index * 100} className="h-full">
                    <div className="group relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift">
                      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-sunset-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" aria-hidden />
                      <IconTile icon={ExampleIcon} tone={toneFor(index)} size="lg" className="transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110" />
                      <h3 className="text-h3 mt-6 text-ink">{example.title}</h3>
                      <p className="mt-3 leading-relaxed text-ink-soft">{example.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader
              align="left"
              eyebrow="Keep exploring"
              title="More Features"
              action={{ href: '/features/', label: 'All features' }}
            />
            <CardRail label="More Gamana features">
              {siblings.map((f) => {
                const FIcon = f.icon;
                return (
                  <Link
                    key={f.slug}
                    href={featureHref(f.slug)}
                    className="focus-ring group relative flex aspect-[4/5] w-[15rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-card transition-shadow duration-500 hover:shadow-lift sm:w-[17rem]"
                  >
                    <Image
                      src={f.image}
                      alt=""
                      fill
                      sizes="272px"
                      className="object-cover opacity-60 transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" aria-hidden />
                    <span className="relative mb-auto grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur transition-transform duration-500 ease-spring group-hover:scale-110">
                      <FIcon className="h-5 w-5" />
                    </span>
                    <span className="relative font-display text-xl font-bold leading-tight">{f.title}</span>
                    <span className="relative mt-1.5 line-clamp-2 text-sm text-white/75">{f.description}</span>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                      Explore More
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                );
              })}
            </CardRail>
          </div>
        </section>

        <div className="pb-20">
          <DownloadBand
            title={
              <>
                Ready to <span className="text-sunset-300">Explore?</span>
              </>
            }
            lead="Join travellers who explore cities with Gamana in their ears"
            source={`feature_${slug}_closing`}
            badgeLabels={HERITAGE_BADGE_LABELS}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
