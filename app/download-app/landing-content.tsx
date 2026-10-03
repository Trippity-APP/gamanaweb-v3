import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Download,
  Footprints,
  Heart,
  Headphones,
  Landmark,
  Languages,
  MapPin,
  Sparkles,
  Star,
  User,
  Users,
  WifiOff,
} from "@/components/icons";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { IconTile, toneFor, type TileIcon } from "@/components/icons/IconTile";
import { Reveal } from "@/components/motion/Reveal";
import { CardRail } from "@/components/site/CardRail";
import { CityTile } from "@/components/site/CityTile";
import { DownloadBand } from "@/components/site/DownloadBand";
import { FaqAccordion, type FaqItem } from "@/components/site/FaqAccordion";
import { NarratorRail } from "@/components/site/NarratorRail";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { SectionHeader } from "@/components/site/SectionHeader";
import { StatsStrip } from "@/components/site/StatsStrip";
import { StoreBadges } from "@/components/site/StoreBadges";
import { TourCard } from "@/components/site/TourCard";
import { TrustBar } from "@/components/site/TrustBar";
import { FEATURED_TOURS } from "@/components/home/HomeSections";
import { FEATURED_CITIES } from "@/lib/data/home";
import { getPhoto } from "@/lib/images";
import { DownloadCta } from "./download-cta";

/**
 * Acquisition page for paid and social traffic (noindexed, see page.tsx). It uses the shared
 * site chrome and sections, but leads with the product: phone screens beside the h1.
 *
 * No app-store rating is shown anywhere because none exists yet; testimonials stay hidden
 * until marketing supplies real reviews.
 */
const SHOW_TESTIMONIALS = false;

const STEPS: { icon: TileIcon; title: string; desc: string }[] = [
  { icon: Download, title: "Download the app", desc: "Grab Gamana free from the App Store or Google Play." },
  { icon: MapPin, title: "Choose a destination", desc: "Pick a city and browse its walking tours and stories." },
  { icon: Footprints, title: "Walk and listen", desc: "Stories play automatically as you reach each spot." },
];

const FEATURES: { icon: TileIcon; title: string; desc: string }[] = [
  {
    icon: MapPin,
    title: "GPS auto-play",
    desc: "Stories start themselves the moment you're in range. No searching, no tapping, just walk.",
  },
  {
    icon: WifiOff,
    title: "Offline access",
    desc: "Download a tour before you go and it plays fully offline, no signal or data charges.",
  },
  {
    icon: Languages,
    title: "Multilingual",
    desc: "Available in English, Hindi, Kannada, Tamil, Russian, French, and more.",
  },
  {
    icon: Compass,
    title: "Walking tours",
    desc: "Routes designed by people who know the city, not an algorithm guessing at your interests.",
  },
  {
    icon: Heart,
    title: "Save favourite tours",
    desc: "Build your own Storylist and revisit, or share, the places that stayed with you.",
  },
  {
    icon: GamanaCoinIcon,
    title: "Free to start",
    desc: "Free to download, with some stories always free. Tours and Combos unlock with Gamana Coins.",
  },
];

const PERSONAS: { icon: TileIcon; title: string; desc: string }[] = [
  { icon: User, title: "Solo travelers", desc: "Explore at your own pace with a witty local voice in your ear." },
  { icon: Users, title: "Families & groups", desc: "Stories that keep kids listening and adults looking up, not down." },
  { icon: Landmark, title: "Culture seekers", desc: "Heritage walks that explain why a place matters, not just where it is." },
];

const TESTIMONIALS = [
  {
    name: "Priya",
    location: "Bengaluru, India",
    quote:
      "I've walked past Chandni Chowk a dozen times and never knew half of what Gamana told me. Felt like I had a witty local friend narrating in my ear.",
  },
  {
    name: "James",
    location: "London, UK",
    quote:
      "Downloaded the Varanasi tour before I lost signal and it just worked, no app has made an unfamiliar city feel that easy to explore alone.",
  },
  {
    name: "Aisha",
    location: "Dubai, UAE",
    quote: "My kids actually put their phones away and listened. The narrator voices are genuinely funny, not just informative.",
  },
];

const FAQS: FaqItem[] = [
  {
    question: "How much does Gamana cost?",
    answer:
      "Gamana is free to download. Some Tours and Combos unlock with Gamana Coins, which you can buy in the app, and a selection of stories are always free to try, no subscription required.",
  },
  {
    question: "Does Gamana work without internet?",
    answer:
      "Yes. Download a tour before you head out and it plays fully offline, with no signal or wifi needed once you're on the ground.",
  },
  {
    question: "Which cities does Gamana cover?",
    answer:
      "Gamana currently covers 50+ cities, with deep coverage across India, Delhi, Agra, Varanasi, Bengaluru, Goa, and more, plus destinations like Singapore, Dubai, and New York. New cities are added regularly.",
  },
  {
    question: "What languages are available?",
    answer: "English, Hindi, Kannada, Tamil, Russian, French, and more, with additional languages being added over time.",
  },
  {
    question: "What devices does Gamana support?",
    answer: 'Gamana runs on iOS and Android. Just search "Gamana" on the App Store or Google Play to get started.',
  },
];

const NARRATOR_THUMBS = ["/narrator1.png", "/narrator2.png", "/narrator3.png", "/narrator4.png"];

function PhoneScreen({ src, alt, className, priority }: { src: string; alt: string; className?: string; priority?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border-[6px] border-ink bg-ink shadow-2xl ${className ?? ""}`}>
      <Image src={src} alt={alt} width={360} height={780} sizes="200px" priority={priority} className="h-auto w-full" />
    </div>
  );
}

export default function LandingContent() {
  const heroPhoto = getPhoto("slide-varanasi", "hero");

  return (
    <>
      <SiteHeader variant="solid" />
      <main>
        {/* Hero */}
        <section className="container-site pt-4 sm:pt-6">
          <div className="relative isolate overflow-hidden rounded-4xl bg-brand-950 shadow-lift">
            <ResponsiveImage
              image={heroPhoto}
              alt="Evening Ganga Aarti on the ghats of Varanasi, explored with the Gamana audio tour app"
              title="Gamana audio tour app, Varanasi ghats"
              fill
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30" aria-hidden />
            <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sunset-400/25 blur-3xl" aria-hidden />

            <div className="grid items-center gap-10 px-5 py-12 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:px-14 lg:py-16">
              <div className="text-white">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                  <Headphones className="h-3.5 w-3.5" weight="fill" aria-hidden />
                  GPS audio storytelling
                </p>
                <h1 className="text-display mt-5 text-balance drop-shadow-sm">Every Street Has a Story. Let Gamana Tell It.</h1>
                <p className="text-lead mt-5 max-w-xl text-white/85">
                  GPS-triggered audio tours that turn any walk into a journey, no guide, no wifi, no planning required.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <DownloadCta source="landing-hero" />
                  <a
                    href="#how-it-works"
                    className="focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    How it works
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>

                <div className="mt-8 hidden items-center gap-5 rounded-3xl bg-white/10 p-4 backdrop-blur-md lg:inline-flex">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/badges/download-qr.svg"
                    alt="QR code to download the Gamana app"
                    width={88}
                    height={88}
                    className="h-[88px] w-[88px] rounded-xl bg-white p-2"
                  />
                  <div>
                    <p className="text-sm font-semibold">Scan to get the app</p>
                    <p className="mt-0.5 text-xs text-white/70">Or tap a store below</p>
                    <StoreBadges source="landing-hero-badges" keyword="audio tour app" className="mt-3" />
                  </div>
                </div>
                <StoreBadges source="landing-hero-badges" keyword="audio tour app" className="mt-6 lg:hidden" />

                <TrustBar
                  className="mt-8 justify-start gap-x-6 text-white/85 [&_svg]:text-sunset-300"
                  items={[
                    { icon: Download, label: "Free to download" },
                    { icon: WifiOff, label: "Works offline" },
                    { icon: Languages, label: "7 languages" },
                  ]}
                />
              </div>

              <div className="relative mx-auto h-[380px] w-[290px] sm:h-[440px] sm:w-[340px] lg:mr-0">
                <PhoneScreen src="/demo01.png" alt="Gamana tour list screen" className="absolute left-0 top-10 w-[42%] -rotate-[8deg] opacity-95" />
                <PhoneScreen src="/demo03.png" alt="Gamana story playback screen" className="absolute right-0 top-16 w-[42%] rotate-[8deg] opacity-95" />
                <PhoneScreen src="/demo02.png" alt="Gamana app home screen" priority className="absolute left-1/2 top-0 z-10 w-[52%] -translate-x-1/2 rounded-[2.25rem] border-8" />

                <div className="absolute -left-2 top-6 z-20 hidden rounded-2xl bg-white px-3 py-2.5 shadow-lift sm:block">
                  <p className="text-[10px] text-ink-muted">Now playing</p>
                  <p className="text-xs font-semibold text-ink">Chandni Chowk Story</p>
                </div>
                <div className="absolute bottom-8 right-0 z-20 max-w-[180px] rounded-2xl bg-white px-3 py-2.5 shadow-lift">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <Sparkles className="h-3.5 w-3.5 text-brand-600" weight="fill" aria-hidden />
                    16 narrator voices
                  </p>
                  <div className="flex -space-x-2">
                    {NARRATOR_THUMBS.map((src) => (
                      <Image key={src} src={src} alt="" width={28} height={28} className="h-7 w-7 rounded-full border-2 border-white object-cover" />
                    ))}
                    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-brand-50 text-[9px] font-bold text-brand-800">
                      +12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative z-10 pt-8 sm:pt-10">
          <div className="container-site">
            <div className="grid items-center gap-6 rounded-4xl border border-ink/5 bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[1fr_auto]">
              <StatsStrip />
              <TrustBar className="justify-center lg:justify-end" items={[
                { icon: MapPin, label: "GPS-triggered stories" },
                { icon: Headphones, label: "Hands-free listening" },
              ]} />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="section scroll-mt-28 bg-white">
          <div className="container-site">
            <SectionHeader eyebrow="How it works" title="Three Steps to Your First Story" />
            <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
              <span
                className="absolute left-[16.66%] right-[16.66%] top-7 hidden border-t-2 border-dashed border-brand-200 md:block"
                aria-hidden
              />
              {STEPS.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 100} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                  <span className="relative shrink-0">
                    <IconTile icon={s.icon} tone={toneFor(i)} size="lg" className="ring-8 ring-white" />
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <span>
                    <h3 className="text-h3 text-ink md:mt-5">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{s.desc}</p>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Feature bento */}
        <section id="features" className="section bg-sand-50">
          <div className="container-site">
            <SectionHeader
              eyebrow="What is Gamana?"
              title="Your Pocket Audio Tour Guide"
              lead="A GPS-enabled storytelling app that turns any city into a walking tour: no guide, no earpiece rental, no fixed schedule."
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Reveal className="relative isolate flex min-h-[26rem] flex-col overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-card md:col-span-2 lg:row-span-3">
                <div className="absolute -bottom-24 -right-16 -z-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />
                <IconTile icon={Sparkles} tone="lilac" size="lg" />
                <h3 className="mt-6 font-display text-3xl font-bold">AI narration, 16 voices</h3>
                <p className="mt-2 max-w-sm text-lg leading-relaxed text-white/80">
                  Narrator personalities from scholarly to comic tell each story in a voice you&apos;ll actually want to listen to.
                </p>
                <div className="pointer-events-none mt-8 flex flex-1 items-end justify-end">
                  <PhoneScreen src="/demo03.png" alt="Gamana narrator playback screen" className="-mb-24 w-44 rotate-[6deg] sm:w-52" />
                </div>
              </Reveal>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 80} className="h-full">
                  <div className="group h-full rounded-3xl border border-ink/5 bg-white p-6 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-card">
                    <IconTile icon={f.icon} tone={toneFor(i + 1)} className="transition-transform duration-500 ease-spring group-hover:scale-110" />
                    <h3 className="mt-5 font-display text-lg font-bold text-ink">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-5 grid gap-5 rounded-3xl border border-ink/5 bg-white p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
              <p className="eyebrow md:w-40">Made for</p>
              <ul className="grid gap-5 sm:grid-cols-3">
                {PERSONAS.map((p, i) => (
                  <li key={p.title} className="flex gap-4">
                    <IconTile icon={p.icon} tone={toneFor(i + 2)} size="sm" className="h-11 w-11" />
                    <span>
                      <span className="block font-semibold text-ink">{p.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{p.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section id="destinations" className="section bg-white">
          <div className="container-site">
            <SectionHeader
              align="left"
              eyebrow="Explore destinations"
              title="Featured Cities, Ready to Walk"
              action={{ href: "/cities/", label: "View all cities" }}
            />
            <CardRail label="Featured cities">
              {FEATURED_CITIES.map((c) => (
                <CityTile key={c.id} href={`/cities/${c.id}/`} name={c.name} country="India" meta={c.tagline} image={c.image} />
              ))}
            </CardRail>

            <h3 className="text-h3 mt-14 text-ink">Popular walking tours</h3>
            <CardRail label="Popular walking tours" className="mt-6">
              {FEATURED_TOURS.map((t) => (
                <TourCard key={t.href} {...t} className="w-[17rem] sm:w-[20rem]" />
              ))}
            </CardRail>

            <div className="mt-12 flex flex-col items-start gap-5 rounded-3xl bg-sand-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <IconTile icon={MapPin} tone="sunset" />
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">Upcoming destinations</h3>
                  <p className="text-sm text-ink-soft">New cities are added every month. Have somewhere in mind for us next?</p>
                </div>
              </div>
              <Link
                href="/cities/#request-place"
                className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Tell us where to go next
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* Narrators */}
        <section className="section bg-sand-50">
          <div className="container-site">
            <SectionHeader
              align="left"
              eyebrow="Virtual travel guides"
              title="Pick the Voice That Walks With You"
              lead="Tap play to hear a sample. Every tour can be narrated by the guide that suits your mood."
            />
            <NarratorRail source="download_app_narrators" />
          </div>
        </section>

        {SHOW_TESTIMONIALS && (
          <section className="section bg-white">
            <div className="container-site">
              <SectionHeader align="left" eyebrow="Travelers" title="What Travelers Say" />
              <CardRail label="Traveler stories">
                {TESTIMONIALS.map((t) => (
                  <figure key={t.name} className="w-[18rem] rounded-3xl bg-sand-50 p-6 sm:w-[22rem]">
                    <div className="flex gap-0.5 text-sunset-400" aria-hidden>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-4 text-ink-soft">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-5 text-sm">
                      <span className="font-semibold text-ink">{t.name}</span>
                      <span className="text-ink-muted"> · {t.location}</span>
                    </figcaption>
                  </figure>
                ))}
              </CardRail>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section id="faq" className="section bg-white">
          <div className="container-site max-w-3xl">
            <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
            <FaqAccordion items={FAQS} withSchema />
          </div>
        </section>

        <DownloadBand
          title="Ready to Explore?"
          lead="Download Gamana free and turn your next walk into a story."
          source="landing-download-section"
          keyword="audio tour app"
          points={["Free to download", "No credit card required", "Works offline"]}
          image={{ src: "/demo02.png", alt: "Gamana app home screen" }}
        />
      </main>
      <Footer />
    </>
  );
}
