'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Hotel, Utensils, Plane, Car, Ticket, TrendingUp, Users, Coins, ArrowRight, CircleCheck as CheckCircle2, ChartBar as BarChart3, Globe, Sparkles, Award, Target, Handshake, MapPinned } from "lucide-react";
import HeroHeader from "@/components/navigation/hero-header";
import PartnerForm from "@/components/partner-form";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { HeroEyebrow } from "@/components/HeroEyebrow";

export default function EcosystemPageContent() {
  const scrollToForm = () => {
    const formSection = document.getElementById('partner-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      step: "1",
      title: "Join the Ecosystem",
      description: "Sign up and create your partner profile with details about your business",
    },
    {
      step: "2",
      title: "Set Up Offers",
      description: "Configure member discounts and promotions for Gamana travelers",
    },
    {
      step: "3",
      title: "Get Discovered",
      description: "Appear in traveler searches, recommendations, and featured tours",
    },
    {
      step: "4",
      title: "Welcome Travelers",
      description: "Serve Gamana users and grow your business on Gamana",
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center overflow-hidden">
        {/*
          Audience for this page is Indian experience operators, not travellers, so the
          carousel is cast to answer "what kind of customer would Gamana send me?"

          Every frame is bright, uncluttered and premium, and, critically, every visitor
          is visibly *listening*: earphones at the Jama Masjid courtyard, headphones at
          Gokak Falls, an earbud on the cobbled street. Gamana is an audio product, so a
          hero full of people simply looking at scenery sells the wrong thing; a partner
          should see the actual behaviour their guests will arrive with. Photos without a
          visible listener (Kerala houseboat, Taj at sunrise, Mehrangarh) were dropped for
          exactly that reason, as were the earlier Fort Kochi fish market and Bangkok night
          market, which read as crowded and low-margin.

          Half the rotation sits outside India (London, Italy), the catalogue isn't
          India-only, and for this audience an international frame doubles as evidence that
          Gamana's travellers are the well-travelled, higher-spend kind.
        */}
        <div className="absolute inset-0">
          <HeroSlideshow
            images={[
              "/traveller-jama-masjid-courtyard-self-guided-audio-tour-delhi.png",
              "/buckingham-palace-morning-audio-tour-london.png",
              "/traveller-gokak-falls-audio-guide-belagavi-tour.png",
              "/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png",
            ]}
          />
          {/* Cooler, lighter tint than the amber this page carried before — the warm wash
              muddied the bright, clean feel these photos are doing the work to convey. */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B6E4F]/20 via-[#159895]/16 to-[#1A5F7A]/20"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <HeroHeader transparent={true} />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-24 sm:pb-28">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <div className="animate-fade-in pb-2">
                <HeroEyebrow icon={Handshake} label="Join the Journey" />
              </div>
              <div className="inline-block w-fit">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
                  Partner with Gamana
                </h1>
                <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
              </div>
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
                Reach travellers already exploring cities with Gamana audio tours
              </p>
            </div>


            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-7 h-auto shadow-xl font-semibold opacity-0 animate-fade-in"
              style={{ animationDelay: "600ms" }}
              onClick={scrollToForm}
            >
              Become a Partner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Snapshot strip, floated up over the hero photo in the same overlapping-card pattern
          used on /marketplace-redesign and /cities, so the page reads as one consistent
          system rather than each surface inventing its own hero treatment. */}
      <section className="relative z-10 -mt-14 sm:-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-lg p-5 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5 md:gap-6">
              {partnerSnapshot.map((p) => (
                <div key={p.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#159895]/10">
                    <p.icon className="h-4 w-4 text-[#159895]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs leading-snug text-gray-500">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pt-14 pb-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Cultural Tourism Segments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join the global movement in heritage, creative, festival, and community-based tourism
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourismSegments.map((segment, index) => {
              const Icon = segment.icon;
              const gradients = [
                'from-[#0B6E4F] to-[#159895]',
                'from-[#159895] to-[#1A5F7A]',
                'from-[#1A5F7A] to-[#57C5B6]',
                'from-[#57C5B6] to-[#159895]',
                'from-[#0B6E4F] to-[#57C5B6]',
                'from-[#1A5F7A] to-[#0B6E4F]',
              ];
              return (
                <Card key={index} className="border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className={`bg-gradient-to-br ${gradients[index]} w-14 h-14 rounded-2xl flex items-center justify-center shadow-md`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{segment.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{segment.description}</p>
                    <Badge className={`bg-gradient-to-r ${gradients[index]} text-white border-0 text-xs font-semibold`}>
                      {segment.market}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-[#159895] text-white border-0 px-5 py-2 text-sm font-semibold mb-4">
              WHY PARTNER WITH US
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              Partner Benefits
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed as a Gamana partner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const iconGradients = [
                'from-[#0B6E4F] to-[#159895]',
                'from-[#1A5F7A] to-[#159895]',
                'from-[#57C5B6] to-[#159895]',
              ];

              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-8 space-y-6 relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${iconGradients[index]} shadow-md`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {benefit.title}
                      </h3>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <ul className="space-y-3">
                        {benefit.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#159895] flex-shrink-0" />
                            <span className="text-sm text-gray-700 leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started is simple and straightforward
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative">
                  <Card className="border-2 h-full hover:border-[#37B8AF] transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                        {item.step}
                      </div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 h-6 w-6 text-[#2C7A89]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="partner-form-section" className="py-20 bg-white scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to Join Our Ecosystem?
            </h2>
            <p className="text-xl text-gray-600">
              Start connecting with travelers and growing your business today
            </p>
          </div>
          <PartnerForm />
        </div>
      </section>
    </main>
  );
}
