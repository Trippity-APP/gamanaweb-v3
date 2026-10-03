import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Globe, Users, Zap } from "@/components/icons";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { StoreBadges } from "@/components/site/StoreBadges";
import { DownloadBand } from "@/components/site/DownloadBand";
import { Reveal } from "@/components/motion/Reveal";
import { FEATURES, featureHref } from "@/lib/data/features";
import { cn } from "@/lib/utils";
import { getPhoto } from "@/lib/images";
import { OG_IMAGE } from '@/lib/seo';

import { IconTile, toneFor } from "@/components/icons/IconTile";
export const metadata: Metadata = {
  title: "Features",
  description: "Discover Gamana's premium features: AI-powered narrators, handcrafted audio stories, location-aware tours, offline access, and expertly researched content for immersive travel experiences.",
  alternates: {
    canonical: 'https://www.gamana.app/features/',
  },
  openGraph: {
    title: 'Features | Gamana',
    description: "Discover Gamana's premium features: AI-powered narrators, handcrafted audio stories, location-aware tours, offline access, and expertly researched content for immersive travel experiences.",
    url: 'https://www.gamana.app/features/',
    siteName: 'Gamana',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Gamana',
    description: "Discover Gamana's premium features: AI-powered narrators, handcrafted audio stories, location-aware tours, offline access, and expertly researched content for immersive travel experiences.",
    images: [OG_IMAGE.url],
  },
};

const additionalBenefits = [
  {
    icon: Zap,
    title: "Instant Access",
    description: "See nearby places and start tours immediately",
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Perfect for solo travelers, families, and groups",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Tours available in major cities worldwide",
  },
];

// Bento placement for the six core features: a hero tile, then a mix of wide and square cards.
const BENTO = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
];

const core = FEATURES.filter((f) => f.core);
const secondary = FEATURES.filter((f) => !f.core);

export default function FeaturesPage() {
  return (
    <>
      <HeroHeader transparent />
      <main>
        <PageHero
          image={getPhoto("hero-features")}
          imageAlt=""
          breadcrumbs={[{ label: "Features", href: "/features/" }]}
          heading="Premium Audio Tour Features"
          subtitle="See what Gamana does: audio tours you take on foot, at your pace"
        >
          <StoreBadges source="features_hero" keyword="audio tour app" priority />
        </PageHero>

        <section className="section bg-sand-50">
          <div className="container-site">
            <div className="grid auto-rows-[minmax(15rem,auto)] grid-cols-1 gap-5 md:grid-cols-3">
              {core.map((f, i) => {
                const Icon = f.icon;
                const hero = i === 0;
                return (
                  <Reveal key={f.slug} delay={i * 70} className={cn("h-full", BENTO[i])}>
                    <Link
                      id={f.slug}
                      href={featureHref(f.slug)}
                      className={cn(
                        "focus-ring group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-3xl p-7 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift sm:p-8",
                        hero ? "bg-ink text-white" : "bg-white text-ink"
                      )}
                    >
                      {hero && (
                        <>
                          <Image
                            src={f.image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 66vw, 100vw"
                            className="object-cover opacity-75 transition-transform duration-700 ease-out-expo group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" aria-hidden />
                        </>
                      )}
                      <span
                        className={cn(
                          "relative grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110",
                          hero ? "bg-white/15 text-white backdrop-blur" : "bg-brand-50 text-brand-700"
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </span>
                      <div className="relative mt-auto pt-8">
                        <h2 className={cn("font-display font-bold", hero ? "text-3xl sm:text-4xl" : "text-xl")}>
                          {f.title}
                        </h2>
                        <p className={cn("mt-2 leading-relaxed", hero ? "max-w-md text-lg text-white/80" : "text-ink-soft")}>
                          {f.description}
                        </p>
                        <ul className={cn("mt-5 space-y-2 text-sm", hero ? "text-white/85 sm:columns-2 sm:gap-6" : "text-ink-soft")}>
                          {f.details.map((d) => (
                            <li key={d} className="flex items-start gap-2 break-inside-avoid">
                              <Check
                                className={cn("mt-0.5 h-4 w-4 flex-shrink-0", hero ? "text-sunset-300" : "text-brand-600")}
                                aria-hidden
                              />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <span
                          className={cn(
                            "mt-6 inline-flex items-center gap-1.5 text-sm font-semibold",
                            hero ? "text-white" : "text-brand-700"
                          )}
                        >
                          Explore More
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader
              title="And There's More"
              lead="Additional benefits that make Gamana your perfect travel companion"
            />

            <div className="grid gap-5 md:grid-cols-2">
              {secondary.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.slug} delay={i * 80} className="h-full">
                    <Link
                      id={f.slug}
                      href={featureHref(f.slug)}
                      className="focus-ring group relative flex h-full min-h-[14rem] scroll-mt-24 flex-col justify-end overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
                    >
                      <Image
                        src={f.image}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-45 transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" aria-hidden />
                      <span className="relative mb-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className="relative mt-8 font-display text-2xl font-bold">{f.title}</h3>
                      <p className="relative mt-2 max-w-md text-white/80">{f.description}</p>
                      <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                        Explore More
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            <ul className="mt-5 grid gap-5 md:grid-cols-3">
              {additionalBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <Reveal as="li" key={b.title} delay={i * 80} className="group rounded-3xl border border-ink/5 bg-sand-50 p-7 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:bg-white hover:shadow-card">
                    <IconTile icon={Icon} tone={toneFor(i)} className="transition-transform duration-500 ease-spring group-hover:scale-110" />
                    <h3 className="text-h3 mt-5 text-ink">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{b.description}</p>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        <div className="pb-20">
          <DownloadBand
            title="Ready to Experience These Features?"
            lead="Download Gamana and start exploring with narrated audio tours"
            source="features_closing"
            keyword="audio tour app"
            aside={
              <div className="flex lg:justify-end">
                <Link
                  href="/contact/"
                  className="focus-ring inline-flex items-center justify-center rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
                >
                  Contact Us
                </Link>
              </div>
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
