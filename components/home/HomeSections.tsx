import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  Globe,
  Handshake,
  Headphones,
  MapPin,
  Share2,
  User,
} from "@/components/icons";
import { cn } from "@/lib/utils";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CardRail } from "@/components/site/CardRail";
import { CityTile } from "@/components/site/CityTile";
import { TourCard } from "@/components/site/TourCard";
import { JsonLd } from "@/components/site/JsonLd";
import { FEATURED_CITIES, KEY_FEATURES, type FeatureKey } from "@/lib/data/home";
import { SITE_STATS } from "@/lib/data/site-stats";
import { destinationListJsonLd } from "@/lib/seo";
import { IconTile, toneFor, type TileIcon } from "@/components/icons/IconTile";

export function CityRailSection() {
  return (
    <section className="section bg-white">
      <div className="container-site">
        <SectionHeader
          align="left"
          eyebrow="Explore by city"
          title="Popular Destinations with Audio Tours"
          lead="Pick a city and start listening. Every destination below has self-guided audio stories ready to play."
          action={{ href: "/cities/", label: "View all cities" }}
        />
        <CardRail label="Popular cities with audio tours">
          {FEATURED_CITIES.map((c) => (
            <CityTile
              key={c.id}
              href={`/cities/${c.id}/`}
              name={c.name}
              country={c.country}
              meta={c.tagline}
              image={c.image}
            />
          ))}
          <Link
            href="/cities/"
            className="focus-ring group relative flex aspect-[4/5] w-[15rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-6 text-white shadow-card transition-shadow duration-500 hover:shadow-lift sm:w-[17rem]"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:rotate-6">
              <Globe className="h-7 w-7" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-2xl font-bold leading-tight">Explore all cities</span>
              <span className="mt-1 block text-sm text-white/75">{SITE_STATS[0].value} destinations worldwide</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                Browse
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </span>
          </Link>
        </CardRail>
      </div>
      <JsonLd
        data={destinationListJsonLd(
          "Popular Destinations with Audio Tours",
          FEATURED_CITIES.map((c) => ({
            name: `${c.name}, ${c.country}`,
            path: `/cities/${c.id}/`,
            image: c.image.src,
            description: `${c.tagline}: self-guided audio tours in ${c.name} with Gamana.`,
          }))
        )}
      />
    </section>
  );
}

export const FEATURED_TOURS = [
  {
    href: "/cities/134327/",
    title: "Varanasi Ghats",
    description:
      "Explore the stories of the timeless Ghats of Varanasi, where life shares space with death. Start at the Pancha Ganga Ghats and work your way to Assi Ghat in time for their memorable Ganga Aarti.",
    location: "Varanasi, India",
    image: "/varanasi ghats golden hour river boats temple spires panoramic view.jpg",
    imageAlt: "Varanasi Ghats Audio Tour with Expert Tourist Guide",
    imageTitle: "Varanasi Ghats Audio Tour – Tourist Guide Experience",
    badge: "Audio walk",
  },
  {
    href: "/cities/131679/",
    title: "Old Delhi Heritage Walk",
    description:
      "Wander the lanes of Chandni Chowk, Gurudwara Sis Ganj Sahib and Chawri Bazar, with the stories behind Delhi's Mughal-era markets, shrines and havelis.",
    location: "Delhi, India",
    image: "/chandni-chowk-golden-hour-street-view-old-delhi-walking-tour.png",
    imageAlt: "Old Delhi Audio Tour through Chandni Chowk at golden hour",
    imageTitle: "Old Delhi Audio Tour – Self-Guided Walk with Gamana",
    badge: "Heritage walk",
  },
  {
    href: "/cities/6a6129112b3d15826864654c/",
    title: "South Goa - Taxi Tour",
    description:
      "Enjoy the sun-soaked syncretic culture of South Goa with a full-day audio route through churches, beaches, and Goa's UNESCO Heritage Site, the Basilica of Bom Jesus.",
    location: "South Goa, India",
    image: "/se-cathedral-old-goa-heritage-audio-tour.jpg",
    imageAlt: "South Goa Taxi Tour with Expert Tourist Guide",
    imageTitle: "South Goa Taxi Tour – Tourist Guide Experience",
    badge: "Day trip",
  },
];

export function ToursGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURED_TOURS.map((t, i) => (
        <Reveal key={t.href} delay={i * 80} className="h-full">
          <TourCard {...t} />
        </Reveal>
      ))}
      <Reveal delay={240} className="h-full">
        <Link
          href="/cities/"
          className="focus-ring group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-800 to-forest p-6 text-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" aria-hidden />
          <div className="flex flex-1 items-center justify-center">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-transform duration-500 ease-spring group-hover:scale-110">
              <Globe className="h-12 w-12" aria-hidden />
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Worldwide
          </p>
          <h3 className="mt-2 font-display text-lg font-bold">Explore All Cities</h3>
          <p className="mt-2 text-sm text-white/85">
            {SITE_STATS[0].value} cities with audio stories, from heritage walks in India to landmarks across the world.
          </p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800">
            View All Cities
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </Link>
      </Reveal>
    </div>
  );
}

const FEATURE_ICONS: Record<FeatureKey, TileIcon> = {
  "exquisite-storytelling": BookOpen,
  "truly-immersive": Headphones,
  "virtual-travel-guides": User,
  "gamana-coins": GamanaCoinIcon,
  "user-generated-tours": Share2,
  "local-languages": Globe,
};

// Bento placement: first card is the hero tile, the rest fill around it.
const BENTO = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "",
  "",
  "md:col-span-2 lg:col-span-1",
];

export function FeaturesBento() {
  return (
    <section id="features" className="section scroll-mt-20 bg-sand-50">
      <div className="container-site">
        <SectionHeader
          eyebrow="Core Features"
          title={
            <>
              Everything You Need in a <span className="text-brand-700">Travel Guide App</span>
            </>
          }
          lead="Six features that change how you explore the world"
        />
        <div className="grid auto-rows-[minmax(13rem,auto)] grid-cols-1 gap-5 md:grid-cols-3">
          {KEY_FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[f.slug];
            const hero = i === 0;
            return (
              <Reveal key={f.slug} delay={i * 70} className={cn("h-full", BENTO[i])}>
                <Link
                  href={`/features/${f.slug}`}
                  className={cn(
                    "focus-ring group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift",
                    hero ? "bg-ink text-white" : "bg-white text-ink"
                  )}
                >
                  {hero && (
                    <>
                      <Image
                        src="/ai-tour-guide-apps-the-future-of-smart-travel-and-exploration.png"
                        alt=""
                        fill
                        sizes="(min-width: 768px) 66vw, 100vw"
                        className="-z-0 object-cover opacity-40 transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" aria-hidden />
                    </>
                  )}
                  <IconTile
                    icon={Icon}
                    tone={toneFor(i)}
                    size="lg"
                    className="relative transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110"
                  />
                  <div className="relative mt-auto pt-8">
                    <h3 className={cn("font-display font-bold", hero ? "text-3xl" : "text-xl")}>{f.title}</h3>
                    <p className={cn("mt-2 leading-relaxed", hero ? "max-w-md text-lg text-white/80" : "text-sm text-ink-soft")}>
                      {f.description}
                    </p>
                    <span
                      className={cn(
                        "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold",
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
  );
}

const STEPS = [
  {
    icon: Download,
    title: "Get the app",
    text: "Download Gamana free from the App Store or Google Play and sign up in a minute.",
  },
  {
    icon: MapPin,
    title: "Pick a city or walk",
    text: "Gamana shows nearby places of interest. Choose a site or a self-guided walk, and a narrator if you like.",
  },
  {
    icon: Headphones,
    title: "Walk and listen",
    text: "Tap play and explore at your own pace. Download narrations ahead to listen offline.",
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-white">
      <div className="container-site">
        <SectionHeader
          eyebrow="How it works"
          title="Start Exploring in Three Steps"
          lead="No tour group, no schedule. Just you, the city and a story in your ears."
        />
        <div className="relative">
          <div
            className="absolute left-[calc(16.66%+1.75rem)] right-[calc(16.66%+1.75rem)] top-7 hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 md:block"
            aria-hidden
          />
        <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 150} className="relative text-center">
              <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lift">
                <s.icon className="h-6 w-6" aria-hidden />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-sunset-400 text-xs font-bold text-ink">
                  {i + 1}
                </span>
              </span>
              <h3 className="text-h3 mt-6 text-ink">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs leading-relaxed text-ink-soft">{s.text}</p>
            </Reveal>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}

export function PartnerCard() {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-7 backdrop-blur-md">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
        <Handshake className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-extrabold">Join the Gamana Ecosystem</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/80">
        Connect with travelers, showcase your offerings, and grow through personalized recommendations and location-based discovery with the Gamana travel app.
      </p>
      <Link
        href="/ecosystem/"
        className="focus-ring group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-900 transition-transform duration-300 ease-spring hover:scale-105 active:scale-95"
      >
        Partner with Gamana
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </Link>
    </div>
  );
}
