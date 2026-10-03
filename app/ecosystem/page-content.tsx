import {
  Store,
  Hotel,
  Utensils,
  Ticket,
  TrendingUp,
  Users,
  ArrowRight,
  CircleCheck as CheckCircle2,
  ChartBar as BarChart3,
  Globe,
  Sparkles,
  Handshake,
  MapPinned,
} from "@/components/icons";
import HeroHeader from "@/components/navigation/hero-header";
import PartnerForm from "@/components/partner-form";
import { PageHero } from "@/components/site/PageHero";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { getPhoto } from "@/lib/images";
import { cn } from "@/lib/utils";

import { IconTile, toneFor } from "@/components/icons/IconTile";
const tourismSegments = [
  {
    icon: Ticket,
    title: "Heritage Tourism",
    description: "Archaeological sites, architectural landmarks, museums, and historical attractions",
    market: "Core segment of $13.25B market",
  },
  {
    icon: Utensils,
    title: "Creative & Culinary Tourism",
    description: "Art, craft, music festivals, cooking classes, wine tastings, and gastronomic routes",
    market: "Fastest-growing intangible culture segment",
  },
  {
    icon: Users,
    title: "Festival Tourism",
    description: "Arts festivals, cultural events, music, dances, and traditional celebrations",
    market: "67.10% of indigenous tourism market share",
  },
  {
    icon: Globe,
    title: "Community-Based Tourism",
    description: "Local community experiences emphasizing sustainability and responsibility",
    market: "Local community experiences",
  },
  {
    icon: Store,
    title: "Local Artisans & Producers",
    description: "Traditional craftspeople, local markets, and local product makers",
    market: "Supporting local economies",
  },
  {
    icon: Hotel,
    title: "Cultural Accommodations",
    description: "Heritage hotels, traditional stays, and heritage stays and homestays",
    market: "Better guest experiences",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "Increased Visibility",
    description: "Get discovered by thousands of travelers actively exploring destinations",
    details: [
      "Featured in personalized recommendations",
      "Priority placement in location-based searches",
      "Inclusion in personalized itineraries",
    ],
  },
  {
    icon: Users,
    title: "Targeted Traffic",
    description: "Connect with travelers who are genuinely interested in your offerings",
    details: [
      "Match with travelers based on preferences",
      "Reach users at the right moment in their journey",
      "Access to engaged, high-intent customers",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Understand your customers better with detailed analytics",
    details: [
      "Track visitor engagement and conversion rates",
      "Access demographic and preference data",
      "Optimize offerings based on real-time feedback",
    ],
  },
];

const partnerSnapshot = [
  { icon: Handshake, title: "6 Partner Segments", description: "Heritage to hyperlocal artisans, all in one network" },
  { icon: MapPinned, title: "India-First Reach", description: "Deep coverage across Indian cities and growing" },
  { icon: Sparkles, title: "Featured in the app", description: "Featured in personalized recommendations, not buried in search" },
  { icon: TrendingUp, title: "Built for Growth", description: "Support and insights as your partnership scales" },
];

const howItWorks = [
  {
    title: "Join the Ecosystem",
    description: "Sign up and create your partner profile with details about your business",
  },
  {
    title: "Set Up Offers",
    description: "Configure member discounts and promotions for Gamana travelers",
  },
  {
    title: "Get Discovered",
    description: "Appear in traveler searches, recommendations, and featured tours",
  },
  {
    title: "Welcome Travelers",
    description: "Serve Gamana users and grow your business on Gamana",
  },
];

// Bento: the first benefit is the tall feature tile; a photo tile fills the third column.
const BENEFIT_LAYOUT = ["lg:row-span-2", "", ""];

export default function EcosystemPageContent() {
  return (
    <>
      <HeroHeader transparent />
      <main>
        {/* Audience is local experience operators, so the hero shows a host with engaged
            travellers; the host sits on the right, clear of the headline. */}
        <PageHero
          size="lg"
          className="pb-28 sm:pb-32"
          image={getPhoto("hero-ecosystem")}
          imageClassName="object-[85%_center]"
          imageAlt="Gamana travel partnerships for tourism businesses"
          imageTitle="Gamana Travel Partnerships for Tourism Businesses"
          eyebrow="Join the Journey"
          heading="Build Travel Partnerships with Gamana"
          subtitle="Partner with Gamana to reach travellers, showcase your tourism experiences, and grow your presence through digital travel discovery and audio tours."
        >
          <a
            href="#partner-form-section"
            className="focus-ring group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-ink shadow-lift transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-95"
          >
            Become a Gamana Partner
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>
        </PageHero>

        <section className="relative z-10 -mt-16 sm:-mt-20">
          <div className="container-site">
            <ul className="grid grid-cols-1 gap-2 rounded-4xl border border-ink/5 bg-white p-4 shadow-lift sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
              {partnerSnapshot.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 80} className="group flex items-start gap-4 rounded-3xl p-4 transition-colors duration-300 hover:bg-sand-50">
                  <IconTile icon={p.icon} tone={toneFor(i)} className="transition-all duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110" />
                  <span>
                    <CountUp value={p.title} className="block font-semibold text-ink" />
                    <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{p.description}</span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader
              title="Cultural Tourism Segments"
              lead="Explore travel partnership opportunities across heritage, creative, festival, and community-based tourism."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tourismSegments.map((segment, index) => {
                const Icon = segment.icon;
                return (
                  <Reveal key={segment.title} delay={(index % 3) * 80} className="h-full">
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/5 bg-sand-50 p-7 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:bg-white hover:shadow-lift">
                      <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-sunset-400 transition-transform duration-500 ease-out-expo group-hover:scale-x-100" aria-hidden />
                      <IconTile icon={Icon} tone={toneFor(index)} size="lg" className="transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110" />
                      <h3 className="text-h3 mt-6 text-ink">{segment.title}</h3>
                      <p className="mt-2 flex-1 leading-relaxed text-ink-soft">{segment.description}</p>
                      <p className="mt-5 inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                        {segment.market}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section bg-sand-50">
          <div className="container-site">
            <SectionHeader
              eyebrow="Why partner with us"
              title="Partner Benefits"
              lead="Everything you need to succeed as a Gamana partner"
            />
            <div className="grid auto-rows-[minmax(14rem,auto)] gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                const hero = index === 0;
                return (
                  <Reveal key={benefit.title} delay={index * 90} className={cn("h-full", BENEFIT_LAYOUT[index])}>
                    <div
                      className={cn(
                        "group flex h-full flex-col rounded-3xl p-8 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift",
                        hero ? "relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white" : "bg-white text-ink"
                      )}
                    >
                      {hero && (
                        <Icon
                          className="pointer-events-none absolute -right-10 top-1/3 h-56 w-56 text-white/[0.07] transition-transform duration-700 ease-out-expo group-hover:-translate-y-2 group-hover:rotate-6"
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110",
                          hero ? "bg-white/15" : "bg-brand-50 text-brand-700"
                        )}
                      >
                        <Icon className="h-7 w-7" aria-hidden />
                      </span>
                      <h3 className={cn("mt-6 font-display font-bold", hero ? "text-3xl" : "text-h3")}>{benefit.title}</h3>
                      <p className={cn("mt-2 leading-relaxed", hero ? "text-lg text-white/85" : "text-ink-soft")}>
                        {benefit.description}
                      </p>
                      <ul className={cn("mt-auto space-y-2.5 pt-6", hero ? "border-t border-white/15" : "border-t border-ink/10")}>
                        {benefit.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2
                              className={cn("mt-0.5 h-4 w-4 flex-shrink-0", hero ? "text-sunset-300" : "text-brand-600")}
                              aria-hidden
                            />
                            <span className={hero ? "text-white/90" : "text-ink-soft"}>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
              <Reveal variant="scale" delay={270} className="relative hidden min-h-[20rem] overflow-hidden rounded-3xl shadow-card lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:block">
                <ResponsiveImage
                  image={getPhoto("ecosystem-partner-benefits", "tile")}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 400px, 33vw"
                  className="object-[50%_40%] transition-transform duration-700 ease-out-expo hover:scale-105"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader title="How It Works" lead="Getting started is simple and straightforward" />
            <Reveal variant="fade" className="group relative">
              <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-0.5 overflow-hidden rounded-full bg-brand-100 lg:block" aria-hidden>
                <div className="h-full origin-left bg-gradient-to-r [.js_&]:scale-x-0 from-brand-500 to-sunset-400 transition-transform delay-300 duration-[1600ms] ease-out-expo group-[.is-visible]:!scale-x-100" />
              </div>
              <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {howItWorks.map((item, index) => (
                  <li key={item.title} className="text-center">
                    <span
                      className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-600 font-display text-xl font-bold text-white shadow-lift ring-8 ring-white transition-all duration-500 ease-spring [.js_&]:scale-75 [.js_&]:opacity-0 group-[.is-visible]:!scale-100 group-[.is-visible]:!opacity-100"
                      style={{ transitionDelay: `${300 + index * 350}ms` }}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-h3 mt-6 text-ink">{item.title}</h3>
                    <p className="mx-auto mt-2 max-w-xs leading-relaxed text-ink-soft">{item.description}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        <section id="partner-form-section" className="section scroll-mt-20 bg-sand-50">
          <div className="container-site">
            <SectionHeader
              title="Ready to Join Our Ecosystem?"
              lead="Start connecting with travelers and growing your business today"
            />
            <PartnerForm />
          </div>
        </section>
      </main>
    </>
  );
}
