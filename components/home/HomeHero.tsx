"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Pause, Play } from "@/components/icons";
import { HeroCitySearch } from "@/components/HeroCitySearch";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { prefersReducedMotion } from "@/hooks/use-in-view";
import { HERO_CITY_CHIPS, HERO_SLIDES } from "@/lib/data/home";
import { getPhoto } from "@/lib/images";
import { cn } from "@/lib/utils";

export const HOME_HERO_SEARCH_ID = "home-hero-search";

const SLIDE_MS = 6000;
const SLIDES = HERO_SLIDES.map((s) => ({ ...s, image: getPhoto(s.photo, "hero") }));

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReducedMotion(prefersReducedMotion());
  }, []);

  const paused = userPaused || hoverPaused || reducedMotion;
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (!document.hidden) go(1);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, go, index]);

  const active = SLIDES[index];

  return (
    <section
      className="relative isolate overflow-hidden bg-ink text-white"
      aria-roledescription="carousel"
      aria-label="Featured destinations"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoverPaused(false);
      }}
    >
      <div className="absolute inset-0 -z-20">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.photo}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "opacity-0"
            )}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}: ${slide.place}`}
            aria-hidden={i !== index}
          >
            {(i === 0 || mounted) && (
              <ResponsiveImage
                image={slide.image}
                alt={slide.image.alt}
                title={slide.image.title}
                sizes="100vw"
                priority={i === 0}
                fill
              />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink/55 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-brand-500/45 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full bg-sunset-500/40 blur-3xl" aria-hidden />

      <div className="mx-auto flex min-h-[400px] w-full max-w-[1160px] flex-col justify-center px-4 pb-20 pt-10 sm:min-h-[440px] sm:px-6 lg:min-h-[520px] lg:px-8 lg:pb-24">
        <h1 className="text-display max-w-[64rem] text-balance drop-shadow-[0_2px_12px_rgba(15,27,36,0.35)]">
          Experience Engaging Storytelling with a Travel Guide App
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/95 drop-shadow-[0_1px_8px_rgba(15,27,36,0.4)] sm:text-lg">
          Listen to immersive audio stories as you explore cities, heritage, culture and local experiences with Gamana, your personal travel guide app.
        </p>

        <div id={HOME_HERO_SEARCH_ID} className="mt-7 max-w-[800px]">
          <HeroCitySearch size="xl" placeholder="Where are you exploring?" containerClassName="relative w-full" />
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Popular cities">
            {HERO_CITY_CHIPS.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cities/${c.id}/`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white hover:text-ink"
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-12 lg:bottom-14">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white/30"
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            >
              {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
            </button>
            {SLIDES.map((slide, i) => (
              <button
                key={slide.photo}
                type="button"
                onClick={() => setIndex(i)}
                className="focus-ring grid h-8 place-items-center rounded-full px-1"
                aria-label={`Show slide ${i + 1}: ${slide.place}`}
                aria-current={i === index ? "true" : undefined}
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-500",
                    i === index ? "w-7 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/cities/${active.cityId}/`}
              className="focus-ring group hidden items-center gap-2 rounded-full bg-white/15 py-1.5 pl-3 pr-2 text-sm backdrop-blur-md transition-colors hover:bg-white hover:text-ink sm:inline-flex"
              aria-live="polite"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              <span className="font-semibold">{active.place}</span>
              <span className="text-white/75 group-hover:text-ink-soft">· {active.caption}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => go(-1)}
              className="focus-ring hidden h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white hover:text-ink lg:grid"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="focus-ring hidden h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white hover:text-ink lg:grid"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
