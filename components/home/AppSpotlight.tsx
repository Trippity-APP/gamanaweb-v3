import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "@/components/icons";
import { StoreBadges } from "@/components/site/StoreBadges";
import { StatsStrip } from "@/components/site/StatsStrip";
import { Reveal } from "@/components/motion/Reveal";

/** The phone mockup, stats and store badges, moved out of the hero so the banner stays about search. */
export function AppSpotlight() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#F4A100] via-[#E85D04] to-[#7A1F1F] text-white">
      <div className="bg-grain absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay" aria-hidden />
      <div className="absolute -left-32 top-10 -z-10 h-[24rem] w-[24rem] rounded-full bg-sunset-300/40 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#7A1F1F]/60 blur-3xl" aria-hidden />

      <div className="container-site grid items-center gap-10 pt-16 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-12">
        <Reveal className="text-center lg:pb-12 lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Play className="h-4 w-4" aria-hidden />
            Audio Stories
          </span>
          <h2 className="mt-5 text-balance font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Your Personal Travel Guide, in Your Pocket
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90 lg:mx-0">
            GPS-triggered stories play as you walk, in 7 languages, with narrations you can download for offline listening.
          </p>

          <StatsStrip tone="dark" className="mx-auto mt-8 max-w-md lg:mx-0" />

          <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap lg:items-center">
            <StoreBadges source="home_app_spotlight" keyword="travel guide app" size="lg" className="justify-center" />
            <Link
              href="/start-your-journey"
              className="focus-ring group inline-flex items-center gap-2 rounded text-sm font-semibold text-white/90 underline decoration-white/40 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
            >
              Or start your Gamana journey online
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </Reveal>

        <div className="relative mx-auto flex w-full max-w-sm justify-center self-end lg:max-w-md">
          <Image
            src="/demo02.png"
            alt="Gamana travel guide app with immersive audio stories and audio guide experience"
            title="Gamana Travel Guide App with Immersive Audio Stories"
            width={600}
            height={900}
            sizes="(min-width: 1024px) 28rem, 80vw"
            className="h-auto max-h-[34rem] w-auto object-contain drop-shadow-2xl"
          />
          <div aria-hidden className="absolute -left-4 top-1/3 hidden items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-ink shadow-lift sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white">
              <Play className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-left">
              <span className="block text-xs text-ink-muted">Now playing</span>
              <span className="block text-sm font-semibold">Varanasi Ghats</span>
            </span>
            <span className="flex h-4 items-end gap-0.5 text-brand-600" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="h-4 w-0.5 origin-bottom animate-wave rounded-full bg-current" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
