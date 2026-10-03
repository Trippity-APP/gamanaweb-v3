import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Compass, Quote } from "@/components/icons";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { TravelQuotes } from "@/components/TravelQuotes";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { NarratorRail } from "@/components/site/NarratorRail";
import { DownloadBand } from "@/components/site/DownloadBand";
import { Reveal } from "@/components/motion/Reveal";
import { getPhoto } from "@/lib/images";
import { cn } from "@/lib/utils";

function Accent({ children }: { children: ReactNode }) {
  return <span className="text-brand-700">{children}</span>;
}

function StorySection({
  title,
  image,
  imageAlt,
  reverse = false,
  tone = "white",
  children,
}: {
  title: ReactNode;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  tone?: "white" | "sand";
  children: ReactNode;
}) {
  return (
    <section className={cn("section", tone === "sand" ? "bg-sand-50" : "bg-white")}>
      <div className="container-site grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn("space-y-6", reverse && "lg:order-2")}>
          <h2 className="text-h2 text-balance text-ink">{title}</h2>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">{children}</div>
        </Reveal>
        <Reveal variant="scale" delay={120} className={cn("group relative", reverse && "lg:order-1")}>
          <div
            className="absolute -inset-3 -z-10 rounded-4xl bg-gradient-to-br from-brand-200/60 to-sunset-300/40 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
            aria-hidden
          />
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PullQuote({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="section relative isolate overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
      <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-sunset-400/20 blur-3xl" aria-hidden />
      <Reveal className="container-site max-w-3xl text-center">
        <Quote className="mx-auto mb-6 h-10 w-10 text-sunset-300" aria-hidden />
        <h2 className="text-h2 text-balance">{title}</h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-white/85 sm:text-xl">{children}</div>
      </Reveal>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <HeroHeader transparent />
      <main>
        <PageHero
          size="lg"
          className="pb-40 sm:pb-48"
          image={getPhoto("hero-about")}
          imageAlt=""
          eyebrow={
            <span className="normal-case tracking-normal text-base sm:text-lg">
                  <span>gamana</span>
              <span className="text-white/50" aria-hidden="true">
                {" "}·{" "}
              </span>
                  <span lang="sa">गमन</span>
              <span className="text-white/50" aria-hidden="true">
                {" "}·{" "}
              </span>
              <span className="font-normal text-white/80">/ɡɐ.mɐ.nɐ/</span>
            </span>
          }
          heading="About Gamana: stories that walk with you"
          subtitle="India's first dedicated app for heritage travel and cultural exploration, built around audio tours and local stories."
        />

        <section className="relative z-10 -mt-28 pb-8 sm:-mt-36">
          <div className="container-site">
            <div className="mx-auto max-w-4xl rounded-4xl border border-ink/5 bg-white p-8 text-center shadow-lift sm:p-12">
              <TravelQuotes />
            </div>
          </div>
        </section>

        <StorySection
          title={
            <>
              Gamana began with two people who love <Accent>talking to strangers</Accent>.
            </>
          }
          image="/fort-kochi-local-market.jpg"
          imageAlt="Travellers and local vendors in conversation at the Fort Kochi market"
        >
          <p>
            Our founders, Ananth and Parikshit, have between them lived on almost every continent
            and travelled through more than twenty countries. One thing came through everywhere they
            went: people are the same. What differs is the stories we tell ourselves about who we
            are.
          </p>
          <p>
            Which is why real connection only ever came from sharing those stories, the shopkeeper,
            the priest, the man who has swept the same steps for thirty years, telling them what
            they were actually looking at and why it mattered to him.
          </p>
          <p>
            We are a storytelling species, and understanding has never come from standing closer to
            one another, only from listening to what the other person has to say about themselves.
            Get us telling each other our stories, and we may yet solve for &lsquo;world peace&rsquo;.
          </p>
        </StorySection>

        <StorySection
          reverse
          tone="sand"
          title={
            <>
              We named the company after the part of travel that <Accent>actually changes you</Accent>.
            </>
          }
          image="/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png"
          imageAlt="A traveller walking a cobbled street, listening as she goes"
        >
          <p className="text-xl text-ink">
            <span lang="sa" className="font-semibold">
              गमन
            </span>{" "}
            is Sanskrit, one of the world&apos;s oldest living languages, for the act of going. Not
            the destination, and not the distance. The going itself.
          </p>
          <p>
                  Every traveller who has ever set out has been doing{" "}
            <span lang="sa" className="text-ink">
              गमन
            </span>
            . We took the name because what changes you is never arriving somewhere, it&apos;s moving
            through it with your eyes open.
          </p>
          <p>
            And the going is made of stories. A wall is just a wall until someone tells you who built
            it, who it kept out, and who wept when it fell. That telling is the oldest technology
            humans have for making a place mean something, older than the guidebook, older than the
            map.
          </p>
        </StorySection>

        <StorySection
          title={
            <>
              You can stand somewhere extraordinary and still feel <Accent>locked out of it</Accent>.
            </>
          }
          image="/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg"
          imageAlt="A traveller looking up at Mehrangarh Fort, Jodhpur"
        >
          <p>
            A plaque with four lines on it. A guide whose voice doesn&apos;t carry past the front of
            the group. A search that returns opening hours and ticket prices when what you wanted
            was the story.
          </p>
          <p>
            So you take the photograph, and you move on, and something that should have stayed with
            you doesn&apos;t. Not because the place had nothing to say, because nobody was there to
            say it.
          </p>
        </StorySection>

        <PullQuote title="Eyes up. Phone down.">
          <p>
            Every other travel app wants your attention on the screen. We think that&apos;s exactly
            backwards. Audio is the only medium that leaves you free to look at the thing you came
            to see, to keep walking, keep looking, and let the story arrive in your ears while your
            eyes stay where they belong.
          </p>
          <p>Hands free. Signal optional. Nothing between you and the place.</p>
        </PullQuote>

        <StorySection
          reverse
          title={
            <>
              The story was always there. <Accent>Nobody was reading it to you</Accent>.
            </>
          }
          image="/hostel-travel-india-varanasi-ghat-traveler.jpg"
          imageAlt="A traveller listening at the Varanasi ghats"
        >
          <p>
            Almost everything worth knowing about a place has already been written down. Centuries
            of scholarship, temple records, colonial surveys, local histories, it exists, in books
            you&apos;ll never carry and archives you&apos;d never think to search, least of all while
            standing in the sun with an hour to spare.
          </p>
          <p>
            So we built something that reads all of it, and speaks it aloud in the place it belongs,
            in your language, at the moment you&apos;re standing there.
          </p>
          <p>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800">
              <Compass className="h-4 w-4" aria-hidden />
                    Spoken where it happened
            </span>
          </p>
        </StorySection>

        <section className="section bg-sand-50">
          <Reveal className="container-site max-w-3xl text-center">
            <h2 className="text-h2 text-balance text-ink">India first, because someone had to.</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                The world&apos;s travel apps have covered Rome and Paris a hundred times over, and
                treated the subcontinent as a footnote, a handful of monuments, thinly described. A
                country with this much layered history deserves better than thin coverage of its
                greatest hits.
              </p>
              <p>
                So we started here, and went deep before going wide. Gamana travels beyond India
                too, but home is where we set the standard, and it&apos;s the standard everywhere
                else has to meet.
              </p>
            </div>
          </Reveal>
        </section>

        <PullQuote title="No place has only one true story.">
          <p>
            Consider a Chola temple. Is it an engineering marvel, raised in granite a thousand years
            ago by people working without mortar? A monument to devotion, carved by hands that
            expected to be forgotten? Or a living institution, catering to the faith of millions
            from ancient times?
          </p>
          <p>
            It is all three, and depth means refusing to choose between them. Our AI narrators let
            us examine a place from every side and hand you all of it, in your language, in the
            voice you&apos;d rather hear it in, at the moment you&apos;re standing in front of it.
          </p>
          <p>
            Anchored to the record. Where it&apos;s contested, we say so. Where it runs out, we stop
            rather than invent.
          </p>
        </PullQuote>

        <section className="section bg-white">
          <div className="container-site">
            <SectionHeader
              title={
                <>
                  Meet a few of <Accent>the voices</Accent>.
                </>
              }
              lead="Each one is a character we wrote and gave a voice to, a historian who won't let a date go unverified, a comedian who can't resist a tangent, someone who sounds like they grew up three streets away. Pick whichever you'd rather spend an afternoon with. The same place sounds genuinely different in each of them."
            />
            <NarratorRail source="about" />
          </div>
        </section>

        <div className="pb-20">
          <DownloadBand
            title="Wherever you're going next."
            lead="Take a narrator with you, or bring your own corner of the world to travellers who'd love to hear about it."
            source="about_closing"
            keyword="travel guide app"
            aside={
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-stretch">
                <Link
                  href="/ecosystem/"
                  className="focus-ring group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-brand-800 shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-95"
                  >
                    Partner with Gamana
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
                <Link
                  href="/contact/"
                  className="focus-ring inline-flex items-center justify-center rounded-full border-2 border-white/50 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
                  >
                    Get in Touch
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
