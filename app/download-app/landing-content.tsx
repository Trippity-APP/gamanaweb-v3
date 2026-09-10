"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  PlayCircle,
  ChevronDown,
  MapPin,
  Compass,
  Heart,
  Languages,
  WifiOff,
  Sparkles,
  Footprints,
  Volume2,
  Users,
  Check,
  X,
  Star,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Music2,
  ArrowRight,
  User,
  Home,
  Landmark,
} from "lucide-react";
import { useStoreUrl } from "@/hooks/use-store-url";
import { trackStoreClick } from "@/lib/analytics";
import { DownloadAppDialog } from "@/components/DownloadAppDialog";

/**
 * Sample landing page built to the social/digital marketing team's provided structure —
 * a dedicated cold-traffic acquisition page (see app/download-app/page.tsx for the noindex
 * rationale). Deliberately diverges from the sitewide "photo-hero" pattern used across
 * Home/About/Cities/Ecosystem/etc: the hero here leads with an app-screenshot mockup
 * rather than a destination photo, because a first-time, ad-driven visitor benefits more
 * from seeing the actual product than an ambiguous travel photo. The teal brand gradient,
 * type, and component language are otherwise kept fully consistent with the rest of the
 * site. Header and footer are custom/compact by design (see below) rather than the shared
 * SiteHeader/Footer, since the marketing team's structure itself omits a nav-heavy header
 * and asks for a slim, conversion-focused footer.
 *
 * All copy is illustrative "sample" content for review — testimonials are placeholder,
 * and no aggregate app-store rating/review count is shown anywhere (none exists yet in
 * the product). Pricing/FAQ copy reflects the current Gamana Coins model (free download,
 * Coins unlock Tours/Combos, some stories always free) — the subscription model is one of
 * Gamana's open strategic questions and is intentionally not referenced here.
 */

const STATS = [
  { value: "50+", label: "Cities" },
  { value: "700+", label: "Audio Stories" },
  { value: "7", label: "Languages" },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Narration",
    desc: "16 distinct narrator personalities, from scholarly to comic, tell each story in a voice you'll actually want to listen to.",
  },
  {
    icon: MapPin,
    title: "GPS Auto-Play",
    desc: "Stories start themselves the moment you're in range. No searching, no tapping, just walk.",
  },
  {
    icon: WifiOff,
    title: "Offline Access",
    desc: "Download a tour before you go and it plays fully offline, no signal, no wifi, no data charges.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    desc: "Available in English, Hindi, Kannada, Tamil, Russian, French, and more.",
  },
  {
    icon: Compass,
    title: "Walking Tours",
    desc: "Routes designed by people who know the city, not an algorithm guessing at your interests.",
  },
  {
    icon: Heart,
    title: "Save Favourite Tours",
    desc: "Build your own Storylist and revisit, or share, the places that stayed with you.",
  },
];

const FEATURE_HIGHLIGHTS = FEATURES.slice(0, 2);
const FEATURE_COMPACT = FEATURES.slice(2);

const FEATURED_CITIES = [
  { name: "Delhi", img: "/chandni-chowk-golden-hour-street-view-old-delhi-walking-tour.png" },
  { name: "Agra", img: "/taj-mahal-sunrise-reflection-central-pool-agra.jpg" },
  { name: "Varanasi", img: "/varanasi ghats golden hour river boats temple spires panoramic view.jpg" },
  { name: "Jaipur", img: "/jantar mantar samrat yantra jaipur astronomical observatory.jpg" },
  { name: "Mumbai", img: "/mumbai-marine-drive-dusk-queens-necklace-arabian-sea.jpg" },
];

const POPULAR_TOURS = [
  { title: "Old Delhi Heritage Walk", img: "/traveller-jama-masjid-courtyard-self-guided-audio-tour-delhi.png" },
  {
    title: "Varanasi Ghats at Dawn",
    img: "/varanasi walking tour guide explore ghats and ganga aarti with an AI audio experience.jpg",
  },
  { title: "Hampi Ruins Trail", img: "/hampi-audio-guide-app.jpg" },
];

const COMPARISONS = [
  {
    title: "Gamana vs. Traditional Tour Guide",
    altLabel: "Traditional Guide",
    gamana: [
      "Start anytime, 6am or midnight, entirely on your schedule",
      "One-time unlock, use it again on your next trip",
      "Available in 6+ languages instantly",
    ],
    alt: ["Fixed schedules and group pace", "Pay per tour, every time", "Limited to whichever guide speaks your language"],
  },
  {
    title: "Gamana vs. Google Maps",
    altLabel: "Google Maps",
    gamana: [
      "Tells you why a place matters, not just where it is",
      "Routes that link the stops that matter",
      "Hands-free audio, eyes up, not on a screen",
    ],
    alt: ["Shows you a pin, not the story behind it", "Turn-by-turn directions, no narrative thread", "Eyes down the whole walk"],
  },
  {
    title: "Gamana vs. Travel Blogs",
    altLabel: "Travel Blogs",
    gamana: [
      "Stories play automatically as you walk, no reading required",
      "Written and voiced by distinct narrator characters",
      "Works fully offline, no ads or pop-ups",
    ],
    alt: ["Static lists you have to read before or during your trip", "Generic, SEO-written filler", "Needs signal, cluttered with ads"],
  },
];

const TESTIMONIALS = [
  {
    name: "Priya",
    location: "Bengaluru, India",
    initialBg: "bg-[#0B6E4F]",
    quote:
      "I've walked past Chandni Chowk a dozen times and never knew half of what Gamana told me. Felt like I had a witty local friend narrating in my ear.",
  },
  {
    name: "James",
    location: "London, UK",
    initialBg: "bg-[#159895]",
    quote:
      "Downloaded the Varanasi tour before I lost signal and it just worked, no app has made an unfamiliar city feel that easy to explore alone.",
  },
  {
    name: "Aisha",
    location: "Dubai, UAE",
    initialBg: "bg-[#1A5F7A]",
    quote:
      "My kids actually put their phones away and listened. The narrator voices are genuinely funny, not just informative.",
  },
];

const PERSONAS = [
  {
    icon: User,
    title: "Solo travelers",
    desc: "Explore at your own pace with a witty local voice in your ear.",
  },
  {
    icon: Home,
    title: "Families & groups",
    desc: "Stories that keep kids listening and adults looking up, not down.",
  },
  {
    icon: Landmark,
    title: "Culture seekers",
    desc: "Heritage walks that explain why a place matters, not just where it is.",
  },
];

const NARRATOR_THUMBS = [
  "/narrator1.png",
  "/narrator2.png",
  "/narrator3.png",
  "/narrator4.png",
];

const FAQS = [
  {
    q: "How much does Gamana cost?",
    a: "Gamana is free to download. Some Tours and Combos unlock with Gamana Coins, which you can buy in the app, and a selection of stories are always free to try, no subscription required.",
  },
  {
    q: "Does Gamana work without internet?",
    a: "Yes. Download a tour before you head out and it plays fully offline, with no signal or wifi needed once you're on the ground.",
  },
  {
    q: "Which cities does Gamana cover?",
    a: "Gamana currently covers 50+ cities, with deep coverage across India, Delhi, Agra, Varanasi, Bengaluru, Goa, and more, plus destinations like Singapore, Dubai, and New York. New cities are added regularly.",
  },
  {
    q: "What languages are available?",
    a: "English, Hindi, Kannada, Tamil, Russian, French, and more, with additional languages being added over time.",
  },
  {
    q: "What devices does Gamana support?",
    a: "Gamana runs on iOS and Android. Just search \"Gamana\" on the App Store or Google Play to get started.",
  },
];

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-of-service" },
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://www.facebook.com/gamanaapp", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/gamanaapp", label: "X" },
  { icon: Instagram, href: "https://www.instagram.com/gamanaapp", label: "Instagram" },
  { icon: Linkedin, href: "https://www.linkedin.com/company/gamanaapp/", label: "LinkedIn" },
  { icon: Music2, href: "https://www.tiktok.com/@gamanaapp", label: "TikTok" },
  { icon: Youtube, href: "https://www.youtube.com/@gamanaapp", label: "YouTube" },
];

function WhyIconProblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <circle cx="20" cy="20" r="16" fill="#FEE2E2" />
      <path
        d="M14 16c1.2-1.5 2.8-2.2 4.5-2.2 2.4 0 4 1.6 4 3.6 0 2.4-2.2 3.2-3.4 4-.7.5-1.1 1-1.1 1.9"
        stroke="#EF4444"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="28" r="1.4" fill="#EF4444" />
    </svg>
  );
}

function WhyIconShortfall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <circle cx="20" cy="20" r="16" fill="#FEF3C7" />
      <path d="M13 13l14 14M27 13L13 27" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function WhyIconSolution({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <circle cx="20" cy="20" r="16" fill="#CCFBF1" />
      <path
        d="M12.5 20.5l5 5 10-11"
        stroke="#0B6E4F"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LandingContent() {
  const { url: storeUrl, platform } = useStoreUrl();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadDialogSource, setDownloadDialogSource] = useState("landing-header");

  const handleDownloadClick = (source: string) => {
    trackStoreClick(platform === "ios" ? "apple" : "play", source);
  };

  const openDownloadDialog = (source: string) => {
    setDownloadDialogSource(source);
    setDownloadDialogOpen(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal sticky header — logo + single CTA only, no nav links. This page is a
          conversion funnel for cold social/ad traffic, not a browsing entry point, so the
          marketing team's structure intentionally omits a header/nav section. */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/download-app" className="flex items-center gap-2" aria-label="Gamana download page">
            <img src="/gamana-logo.svg" alt="Gamana" className="h-8 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => openDownloadDialog("landing-header")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#128a86] hover:to-[#164e63] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Download Free
          </button>
        </div>
      </header>

      <DownloadAppDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        source={downloadDialogSource}
      />

      {/* HERO — screenshot-forward, not the sitewide photo-hero pattern. On-brand teal
          gradient + decorative blobs, but the visitor sees the actual product on load. */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-[#0B6E4F] via-[#159895] to-[#1A5F7A]">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[#57C5B6]/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <Volume2 className="h-3.5 w-3.5" /> GPS Audio Storytelling
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-bold leading-tight">
              Every Street Has a Story. Let Gamana Tell It.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/85 max-w-lg">
              GPS-triggered audio tours that turn any walk into a journey, no guide, no wifi, no
              planning required.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => openDownloadDialog("landing-hero")}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#0B6E4F] font-semibold px-6 py-3.5 rounded-full hover:bg-white/90 transition-colors"
              >
                <Download className="h-5 w-5" /> Download Free
              </button>
              <button
                type="button"
                onClick={() => scrollTo("experience")}
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/20 transition-colors"
              >
                <PlayCircle className="h-5 w-5" /> Watch Demo
              </button>
            </div>
            <p className="mt-4 text-xs text-white/70">Free to download &middot; Available on iOS &amp; Android</p>

            <div className="mt-10 flex gap-8">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[340px] h-[380px] sm:h-[440px]">
              {/* Left phone */}
              <div className="absolute left-0 top-10 w-[42%] rotate-[-8deg] z-0 opacity-95">
                <div className="rounded-[1.75rem] border-[6px] border-gray-900 bg-gray-900 shadow-xl overflow-hidden">
                  <img src="/demo01.png" alt="Gamana tour list screen" className="w-full h-auto" />
                </div>
              </div>
              {/* Right phone */}
              <div className="absolute right-0 top-16 w-[42%] rotate-[8deg] z-0 opacity-95">
                <div className="rounded-[1.75rem] border-[6px] border-gray-900 bg-gray-900 shadow-xl overflow-hidden">
                  <img src="/demo03.png" alt="Gamana story playback screen" className="w-full h-auto" />
                </div>
              </div>
              {/* Center phone */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[52%] z-10">
                <div className="rounded-[2.25rem] border-8 border-gray-900 bg-gray-900 shadow-2xl overflow-hidden">
                  <img src="/demo02.png" alt="Gamana app home screen" className="w-full h-auto" />
                </div>
              </div>

              <div className="absolute -left-2 sm:-left-6 top-6 bg-white rounded-xl shadow-lg px-3 py-2.5 hidden sm:block z-20">
                <p className="text-[10px] text-gray-400">Now Playing</p>
                <p className="text-xs font-semibold text-gray-900">Chandni Chowk Story</p>
              </div>

              <div className="absolute right-0 sm:-right-2 bottom-8 bg-white rounded-xl shadow-lg px-3 py-2.5 z-20 max-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#159895] shrink-0" />
                  <p className="text-xs font-semibold text-gray-900">16 Narrator Voices</p>
                </div>
                <div className="flex -space-x-2">
                  {NARRATOR_THUMBS.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-7 w-7 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <span className="h-7 w-7 rounded-full border-2 border-white bg-[#F0FBFA] text-[9px] font-bold text-[#0B6E4F] flex items-center justify-center">
                    +12
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY GAMANA? */}
      <section id="why-gamana" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Gamana?</h2>
          <p className="mt-3 text-gray-500">
            Travel shouldn't mean choosing between a scripted tour, a stale blog post, or a map full
            of pins with no context.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:bg-[#F0FBFA]">
            <WhyIconProblem className="h-10 w-10 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">The Travel Problem</h3>
            <p className="text-sm text-gray-500">
              You land in a new city with a map full of pins and zero context, no idea why that
              temple matters, which street has the best food, or where locals actually go.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:bg-[#F0FBFA]">
            <WhyIconShortfall className="h-10 w-10 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Why Existing Solutions Fall Short</h3>
            <p className="text-sm text-gray-500">
              Guided tours are expensive and run on someone else's schedule. Blogs go stale and don't
              fit your pace. Maps get you there, but never tell you why it matters.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:bg-[#F0FBFA]">
            <WhyIconSolution className="h-10 w-10 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">How Gamana Solves It</h3>
            <p className="text-sm text-gray-500">
              Gamana plays the right story, at the right place, the moment you arrive, hands-free,
              offline-ready, and entirely on your own schedule.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IS GAMANA? — banded split layout, distinct from Why's equal cards */}
      <section id="what-is-gamana" className="bg-gradient-to-br from-[#F0FBFA] via-white to-[#E8F6F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#159895] mb-3">
                The product
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What is Gamana?</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Gamana is a GPS-enabled audio storytelling app that turns any city into a walking
                tour, no guide, no earpiece rental, no fixed schedule. Just open the app, start
                walking, and let the stories find you.
              </p>
              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#0B6E4F] flex items-center justify-center">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Audio Tour Guide</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Hands-free narration timed to your steps, not a script you have to keep pausing
                      to read.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-[#159895] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">GPS-Based Storytelling</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Stories trigger automatically as you approach each spot, no tapping, no
                      searching, no losing your place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#159895] mb-3">
                Who it&apos;s for
              </p>
              <div className="space-y-3">
                {PERSONAS.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl bg-white border border-[#57C5B6]/25 p-5 flex gap-4 shadow-sm"
                  >
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-[#F0FBFA] flex items-center justify-center">
                      <p.icon className="h-5 w-5 text-[#0B6E4F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Download, step: "1", title: "Download the App", desc: "Grab Gamana free from the App Store or Google Play." },
            { icon: MapPin, step: "2", title: "Choose a Destination", desc: "Pick a city and browse walking tours." },
            { icon: Footprints, step: "3", title: "Start Walking", desc: "No syncing, no fumbling with a map. Just start moving." },
            { icon: Volume2, step: "4", title: "Listen to Stories", desc: "Stories play automatically as you reach each spot." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="relative mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#159895] to-[#1A5F7A] flex items-center justify-center mb-4">
                <s.icon className="h-6 w-6 text-white" />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-gray-100 text-[11px] font-bold text-[#159895] flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KEY FEATURES — bento: 2 highlights + 4 compact tiles */}
      <section id="features" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Key Features</h2>
          </div>

          <div className="space-y-4 mb-4">
            {FEATURE_HIGHLIGHTS.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:items-center ${
                  i % 2 === 1 ? "sm:flex-row-reverse" : ""
                }`}
              >
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#159895] to-[#1A5F7A] flex items-center justify-center">
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <div className={i % 2 === 1 ? "sm:text-right sm:flex-1" : "sm:flex-1"}>
                  <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-xl">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_COMPACT.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="h-9 w-9 rounded-lg bg-[#F0FBFA] flex items-center justify-center mb-3">
                  <f.icon className="h-4 w-4 text-[#159895]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE DESTINATIONS */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore Destinations</h2>
          <p className="mt-3 text-gray-500">Featured cities, ready to walk right now.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-14">
          {FEATURED_CITIES.map((c) => (
            <Link
              key={c.name}
              href="/cities"
              className="group relative rounded-xl overflow-hidden aspect-[3/4] block"
            >
              <img
                src={c.img}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <p className="absolute bottom-3 left-3 text-white font-semibold text-sm">{c.name}</p>
            </Link>
          ))}
          <Link
            href="/cities"
            className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-[#0B6E4F] to-[#1A5F7A] flex flex-col items-start justify-end p-4"
          >
            <p className="text-white font-semibold text-sm leading-snug">View all destinations</p>
            <p className="text-white/75 text-xs mt-1">50+ cities to explore</p>
            <span className="mt-3 inline-flex items-center gap-1 text-white text-xs font-semibold group-hover:gap-2 transition-all">
              Browse <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-5">Popular Walking Tours</h3>
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {POPULAR_TOURS.map((t) => (
            <Link
              key={t.title}
              href="/explore"
              className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40">
                <img
                  src={t.img}
                  alt={t.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 text-sm">{t.title}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-[#0B6E4F] to-[#1A5F7A] px-6 py-8 text-center">
          <h3 className="text-white font-semibold text-lg">Upcoming Destinations</h3>
          <p className="text-white/80 text-sm mt-2 max-w-xl mx-auto">
            New cities are added to Gamana every month. Have somewhere in mind for us next?
          </p>
          <Link
            href="/contact"
            className="inline-block mt-4 bg-white text-[#0B6E4F] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors"
          >
            Tell Us Where to Go Next
          </Link>
        </div>
      </section>

      {/* EXPERIENCE GAMANA — video placeholder only */}
      <section id="experience" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Experience Gamana</h2>
            <p className="mt-3 text-gray-500">A closer look at what&apos;s inside the app.</p>
          </div>

          {/* App Demo Video — placeholder for the marketing team to swap in a real product
              video before this page goes live. Intentionally not wired to any real/unrelated
              video source. */}
          <div className="relative rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg">
            <img src="/demo screen 03.png" alt="Gamana app demo preview" className="w-full h-64 sm:h-80 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                <PlayCircle className="h-9 w-9 text-[#0B6E4F]" />
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Demo video placeholder, swap in the real product video before launch.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE GAMANA? — side-by-side columns on md+ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose Gamana?</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {COMPARISONS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">{c.title}</h3>
              <div className="grid md:grid-cols-2 gap-5 md:gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#0B6E4F] uppercase tracking-wide mb-3">
                    Gamana
                  </p>
                  <div className="space-y-2">
                    {c.gamana.map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#159895] mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:border-l md:border-gray-100 md:pl-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {c.altLabel}
                  </p>
                  <div className="space-y-2">
                    {c.alt.map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <X className="h-4 w-4 text-gray-300 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-400">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS — illustrative sample copy, initial avatars */}
      <section id="testimonials" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Travelers Say</h2>
            <p className="mt-2 text-xs text-gray-400">Sample traveler stories for illustration.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`h-11 w-11 rounded-full ${t.initialBg} text-white font-semibold text-lg flex items-center justify-center shrink-0`}
                  >
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="rounded-xl border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-gray-900 text-sm sm:text-base">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${openFAQ === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`px-5 overflow-hidden transition-all duration-300 ${
                  openFAQ === i ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm text-gray-500">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD GAMANA — final CTA */}
      <section id="download" className="relative overflow-hidden bg-gradient-to-br from-[#0B6E4F] via-[#159895] to-[#1A5F7A]">
        <div className="absolute -top-16 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-bold">Ready to Explore?</h2>
          <p className="mt-3 text-white/85">Download Gamana free and turn your next walk into a story.</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreClick("play", "landing-download-section")}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Download Gamana on Android"
                className="h-16 w-auto"
              />
            </a>
            <a
              href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreClick("apple", "landing-download-section")}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download Gamana on iOS"
                className="h-16 w-auto"
              />
            </a>
          </div>
          <p className="mt-5 text-xs text-white/70">Free to download. No credit card required.</p>
        </div>
      </section>

      {/* Compact custom footer — the shared sitewide Footer is a heavier multi-column
          component without a dedicated Contact link; this page uses a slimmer footer
          matching the marketing team's literal six-item structure instead. */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <img src="/gamana-logo.svg" alt="Gamana" className="h-7 w-auto brightness-0 invert opacity-90" />

            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {FOOTER_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="hover:text-white transition-colors"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Gamana India LLP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
