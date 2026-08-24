"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowRight, Compass, Linkedin } from "lucide-react";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import NarratorCard from "@/components/narrator-card";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { TravelQuotes } from "@/components/TravelQuotes";
export default function AboutPage() {

  // Hidden. Flip to true to show it again — bios below are kept intact.
  const SHOW_TEAM_SECTION = false;

  const team = [
    {
      name: "Ananth Pharshy",
      designation: "Founder & Chief Executive Officer",
      bio: "The hidden story behind a landmark is always better than the landmark itself — that's the conviction Gamana is built on. I started this to close the gap between standing somewhere remarkable and actually understanding it.",
      image: "/team/ananth-pharshy.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Parikshit Roy Chowdhury",
      designation: "Founder & Chief Operating Officer",
      bio: "My love for travel and storytelling started while backpacking across India. Gamana exists to make cultural exploration accessible through authentic local narratives — technology should enhance our connection to places, never replace it.",
      image: "/team/parikshit-roy-chowdhury.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Syed Sameer",
      designation: "Chief Technology Officer",
      bio: "Technology is my playground. I love solving complex problems and building scalable systems. What excites me most about Gamana is using AI and location tech to turn a simple walk through a city into an immersive storytelling experience.",
      image: "/team/syed-sameer.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Sameer Ul Haque",
      designation: "Head, Product & Growth",
      bio: "I'm fascinated by how great design makes complex things feel simple. At Gamana, I combine beautiful interfaces with data-driven growth strategies. The best product insights come from exploring new cities and testing our app in real-world scenarios.",
      image: "/team/sameer-ul-haque.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Jaskaran Singh",
      designation: "Backend Lead",
      bio: "I make sure everything works smoothly behind the scenes. There's something satisfying about building robust systems that millions rely on. I enjoy scaling our infrastructure and take pride in writing code that's elegant and maintainable.",
      image: "/team/jaskaran-singh.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Avinash Jindal",
      designation: "Frontend Lead (Mobile)",
      bio: "I'm passionate about creating mobile experiences that feel natural and delightful. I love making complex features feel simple, and Flutter lets me bring beautiful experiences to both iOS and Android users.",
      image: "/team/avinash-jindal.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
    {
      name: "Afaf Ruknuddin",
      designation: "Frontend Lead (Web)",
      bio: "I believe great tools empower great work. I'm passionate about building dashboards that make complex data feel approachable and actionable. I love creating interfaces that our team and partners actually enjoy using.",
      image: "/team/afaf-ruknuddin.jpg",
      linkedin: "", // Update with actual LinkedIn URL
    },
  ];

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center overflow-hidden">
          {/* Founder-team-in-the-field photo behind the brand gradient, matching the treatment
              on /marketplace-redesign, /cities, and /ecosystem — a flat gradient read as
              inconsistent with the rest of the site. */}
          <div className="absolute inset-0">
            <HeroSlideshow
              images={[
                "/varanasi ghats golden hour river boats temple spires panoramic view.jpg",
                "/traveller-jama-masjid-courtyard-self-guided-audio-tour-delhi.png",
                "/rome-colosseum-tour.jpg",
                "/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg",
                "/buckingham-palace-morning-audio-tour-london.png",
              ]}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#159895]/25 via-[#1A5F7A]/22 to-[#57C5B6]/20"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <HeroHeader transparent={true} />

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
            {/* The name origin now *is* the hero — a generic "About Us" label said nothing
                a visitor couldn't infer from the nav, whereas the meaning of the name earns
                the space and sets up everything below it. */}
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="space-y-6">
                {/* Script, romanisation and IPA carry equal type weight — none is a
                    footnote to the others, and giving the Devanagari the same size as the
                    Latin says the original isn't decoration. */}
                <h1 className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-3 text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight animate-fade-in">
                  <span>gamana</span>
                  <span className="text-white/50 font-light" aria-hidden="true">·</span>
                  <span lang="sa">गमन</span>
                  <span className="text-white/50 font-light" aria-hidden="true">·</span>
                  <span className="font-normal text-white/85">/ɡɐ.mɐ.nɐ/</span>
                </h1>

                <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}></div>

                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-snug max-w-4xl mx-auto font-light opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
                  India&apos;s first dedicated app for heritage travel and cultural exploration, powered by immersive storytelling.
                </p>
              </div>

            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Overlaps the hero photo above, matching the floating-card pattern used on
            Explore/Cities/Contact — the negative top margin pulls it up over the hero and
            the z-index keeps it above the hero's bottom fade. */}
        <section className="relative z-10 -mt-28 sm:-mt-36 pb-16 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto rounded-3xl border border-gray-100 bg-white shadow-xl p-8 sm:p-12 text-center">
              {/* Quote roster and sourcing rules live in components/TravelQuotes.tsx —
                  public domain only, with unverified attributions labelled as such. */}
              <TravelQuotes />
            </div>
          </div>
        </section>

        {/* Origin story, placed first so everything after it reads as consequence rather
            than assertion. Founder-voiced deliberately — the claim that Gamana came out of
            two people's own travelling is only credible in first person. */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Gamana began with two people who love{" "}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                    talking to strangers
                  </span>
                  .
                </h2>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Our founders, Ananth and Parikshit, have between them lived on almost every
                  continent and travelled through more than twenty countries. One thing came
                  through everywhere they went: people are the same. What differs is the stories
                  we tell ourselves about who we are.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Which is why real connection only ever came from sharing those stories — the
                  shopkeeper, the priest, the man who has swept the same steps for thirty years,
                  telling them what they were actually looking at and why it mattered to him.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  We are a storytelling species, and understanding has never come from standing
                  closer to one another — only from listening to what the other person has to say
                  about themselves. Get us telling each other our stories, and we may yet solve
                  for &lsquo;world peace&rsquo;.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#159895] to-[#57C5B6] rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="border-0 shadow-2xl overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src="/fort-kochi-local-market.jpg"
                        alt="Travellers and local vendors in conversation at the Fort Kochi market"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What the name commits us to. The meaning of गमन isn't trivia here — it's the
            argument the whole product rests on, so it gets its own section rather than
            sharing a card with the quotes. */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  We named the company after the part of travel that{" "}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                    actually changes you
                  </span>
                  .
                </h2>

                <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">
                  <span lang="sa" className="font-medium text-gray-900">गमन</span> is Sanskrit —
                  one of the world&apos;s oldest living languages — for the act of going. Not the
                  destination, and not the distance. The going itself.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  Every traveller who has ever set out has been doing{" "}
                  <span lang="sa" className="text-gray-900">गमन</span>. We took the name because
                  what changes you is never arriving somewhere — it&apos;s moving through it with
                  your eyes open.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  And the going is made of stories. A wall is just a wall until someone tells you
                  who built it, who it kept out, and who wept when it fell. That telling is the
                  oldest technology humans have for making a place mean something — older than
                  the guidebook, older than the map.
                </p>
              </div>

              {/* Companion image: a walker mid-journey rather than posed at a monument —
                  the whole section argues that the going matters more than the arrival, so
                  a destination shot would contradict the copy sitting beside it. */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B6E4F] to-[#159895] rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="border-0 shadow-2xl overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src="/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png"
                        alt="A traveller walking a cobbled street, listening as she goes"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* The problem, told from the reader's side of it. Nothing is offered here on
            purpose — the page has to earn the rest by naming something felt first. */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-[#159895]/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  You can stand somewhere extraordinary and still feel{" "}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                    locked out of it
                  </span>
                  .
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  A plaque with four lines on it. A guide whose voice doesn&apos;t carry past the
                  front of the group. A search that returns opening hours and ticket prices when
                  what you wanted was the story.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  So you take the photograph, and you move on, and something that should have
                  stayed with you doesn&apos;t. Not because the place had nothing to say — because
                  nobody was there to say it.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#159895] to-[#57C5B6] rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="border-0 shadow-2xl overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src="/solo-woman-traveler-mehrangarh-fort-jodhpur-golden-hour.jpg"
                        alt="A traveller looking up at Mehrangarh Fort, Jodhpur"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* The conviction, moved up to sit directly after the problem — it's the answer to
            "locked out of it" and lands harder as an immediate rebuttal than it did buried
            further down. Full-bleed band, deliberately unaccompanied by an image. */}
        <section className="py-24 bg-gradient-to-br from-[#1A5F7A] to-[#159895] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Eyes up. Phone down.
              </h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Every other travel app wants your attention on the screen. We think that&apos;s
                exactly backwards. Audio is the only medium that leaves you free to look at the
                thing you came to see — to keep walking, keep looking, and let the story arrive
                in your ears while your eyes stay where they belong.
              </p>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Hands free. Signal optional. Nothing between you and the place.
              </p>
            </div>
          </div>
        </section>

        {/* What we did about it — replaces "Our Mission" without announcing itself. */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="relative group lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1A5F7A] to-[#57C5B6] rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="border-0 shadow-2xl overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src="/hostel-travel-india-varanasi-ghat-traveler.jpg"
                        alt="A traveller listening at the Varanasi ghats"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 lg:order-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  The story was always there.{" "}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                    Nobody was reading it to you
                  </span>
                  .
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Almost everything worth knowing about a place has already been written down.
                  Centuries of scholarship, temple records, colonial surveys, local histories — it
                  exists, in books you&apos;ll never carry and archives you&apos;d never think to
                  search, least of all while standing in the sun with an hour to spare.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  So we built something that reads all of it, and speaks it aloud in the place it
                  belongs — in your language, at the moment you&apos;re standing there.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Badge className="bg-gradient-to-r from-[#159895] to-[#57C5B6] text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
                    <Compass className="mr-2 h-4 w-4" />
                    Spoken where it happened
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Replaces "Our Vision" with an argument rather than an aspiration. */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                India first, because someone had to.
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The world&apos;s travel apps have covered Rome and Paris a hundred times over,
                and treated the subcontinent as a footnote — a handful of monuments, thinly
                described. A country with this much layered history deserves better than
                thin coverage of its greatest hits.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                So we started here, and went deep before going wide. Gamana travels beyond
                India too — but home is where we set the standard, and it&apos;s the standard
                everywhere else has to meet.
              </p>
            </div>
          </div>
        </section>

        {/* Moved below the India-first argument: "deep before wide" is the claim, and this
            band is the evidence for how that depth is actually achieved. Also the page's
            plain-language disclosure that narration is AI-written and AI-voiced. */}
        {/* Same gradient as the "Eyes up. Phone down." band above — the two full-bleed
            inserts are a matched pair and shouldn't read as different treatments. */}
        <section className="py-24 bg-gradient-to-br from-[#1A5F7A] to-[#159895] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                No place has only one true story.
              </h2>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Consider a Chola temple. Is it an engineering marvel, raised in granite a thousand
                years ago by people working without mortar? A monument to devotion, carved by
                hands that expected to be forgotten? Or a living institution, catering to the
                faith of millions from ancient times?
              </p>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                It is all three, and depth means refusing to choose between them. Our AI narrators
                let us examine a place from every side and hand you all of it — in your language,
                in the voice you&apos;d rather hear it in, at the moment you&apos;re standing in
                front of it.
              </p>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                Anchored to the record. Where it&apos;s contested, we say so. Where it runs out,
                we stop rather than invent.
              </p>
            </div>
          </div>
        </section>

        {SHOW_TEAM_SECTION && (
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-[#159895]/5 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                  The people who{" "}
                  <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                    build it
                  </span>
                  .
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A small team spread across engineering, design and storytelling — most of us
                  drawn here by the same thing, which is having stood somewhere remarkable and
                  wished someone had been there to explain it.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {team.map((member, index) => {
                  return (
                    <Card
                      key={index}
                      className="border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden bg-white rounded-lg"
                    >
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Image Section - Hidden for now */}
                        {/* <div className="relative w-full aspect-square bg-gradient-to-br from-[#159895]/10 to-[#57C5B6]/10 overflow-hidden">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#159895] to-[#57C5B6]">
                              <Users className="h-20 w-20 text-white opacity-40" />
                            </div>
                          )}
                        </div> */}
                        
                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-1 space-y-3">
                          <div className="space-y-1 flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                              {member.name}
                            </h3>
                            <p className="text-sm font-medium text-[#159895]">
                              {member.designation}
                            </p>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed flex-1">
                            {member.bio}
                          </p>
                          
                          {/* LinkedIn Link */}
                          {member.linkedin && member.linkedin.trim() !== "" && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-[#159895] hover:text-[#1A5F7A] transition-colors mt-2 group/link"
                            >
                              <Linkedin className="h-4 w-4 group-hover/link:scale-110 transition-transform" />
                              <span>Connect on LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Virtual Travel Guides Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                Meet a few of{" "}
                <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">
                  the voices
                </span>
                .
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Each one is a character we wrote and gave a voice to — a meticulous historian, a
                comedian who can&apos;t resist a tangent, someone who sounds like they grew up
                three streets away. Pick whichever you&apos;d rather spend an afternoon with. The
                same place sounds genuinely different in each of them.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Lewis",
                  role: "Analytic Historian",
                  demographics: "45-55, Male, British",
                  image: "/narrator1.png",
                  audio: "/lewis-sample.mp3"
                },
                {
                  name: "Bella",
                  role: "Human-Centered Historian",
                  demographics: "30-40, Female, American",
                  image: "/narrator2.png",
                  audio: "/bella-sample.mp3"
                },
                {
                  name: "Aria",
                  role: "Renaissance Expert",
                  demographics: "35-45, Female, American",
                  image: "/narrator3.png",
                  audio: "/aria-sample.mp3"
                },
                {
                  name: "Arjun",
                  role: "Systems Historian",
                  demographics: "30-40, Male, Indian",
                  image: "/narrator4.png",
                  audio: "/arjun-sample.mp3"
                },
                {
                  name: "Aarti",
                  role: "Indic Historian",
                  demographics: "30-35, Female, Indian",
                  image: "/narrator6.png",
                  audio: "/aarti-sample.mp3"
                },
                {
                  name: "Neerja",
                  role: "Punchy Comedian",
                  demographics: "30-40, Female, Indian",
                  image: "/narrator7.png",
                  audio: "/Neerja_intro.mp3"
                },
              ].map((guide, index) => (
                <NarratorCard
                  key={index}
                  name={guide.name}
                  role={guide.role}
                  demographics={guide.demographics}
                  image={guide.image}
                  audio={guide.audio}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Wherever you&apos;re going next.
              </h2>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Take a narrator with you — or bring your own corner of the world to travellers
                who&apos;d love to hear about it.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
                <Link href="/ecosystem">
                  <Button
                    size="lg"
                    className="bg-white text-[#159895] hover:bg-gray-50 text-lg px-10 py-7 h-auto shadow-2xl font-bold rounded-full hover:scale-105 transition-all duration-300 group"
                  >
                    Partner with Gamana
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-lg px-10 py-7 h-auto shadow-2xl border-2 border-white/50 font-bold rounded-full hover:scale-105 transition-all duration-300"
                  >
                    Get in Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
