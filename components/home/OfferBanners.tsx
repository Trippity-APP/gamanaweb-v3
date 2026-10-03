"use client";

import { ArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { trackStoreClick } from "@/lib/analytics";
import { useStoreUrl } from "@/hooks/use-store-url";
import { Reveal } from "@/components/motion/Reveal";

const OFFERS = [
  {
    badge: "NEW USER",
    title: "Claim Your Free 5 Coins",
    text: "Unlock 5 premium stories, on us",
    cta: "Claim Offer",
    tone: "from-sunset-400 via-sunset-500 to-sunset-700",
  },
  {
    badge: "BUNDLE & SAVE",
    title: "Delhi Heritage Pass",
    text: "Explore the layers of Delhi's history",
    cta: "View Bundle",
    tone: "from-brand-500 via-brand-700 to-brand-900",
  },
];

/** App-only offers: both CTAs deep-link to the user's platform store. */
export function OfferBanners() {
  const { url: storeUrl, platform } = useStoreUrl();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {OFFERS.map((o, i) => (
        <Reveal key={o.title} delay={i * 100}>
          <div
            className={cn(
              "group relative isolate flex h-full min-h-[14rem] flex-col overflow-hidden rounded-4xl bg-gradient-to-br p-8 text-white shadow-card sm:p-10",
              o.tone
            )}
          >
            <div
              className="absolute -right-12 -top-12 -z-10 h-48 w-48 rounded-full bg-white/10 transition-transform duration-700 ease-out-expo group-hover:scale-125"
              aria-hidden
            />
            <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wider backdrop-blur-sm">
              {o.badge}
            </span>
            <h3 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">{o.title}</h3>
            <p className="mt-2 flex-1 text-white/85">{o.text}</p>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-offers")}
              className="focus-ring mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition-transform duration-300 ease-spring hover:scale-105 active:scale-95"
            >
              {o.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
