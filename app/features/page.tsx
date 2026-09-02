import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Headphones,
  User,
  Share2,
  Globe,
  ArrowRight,
  Zap,
  Users,
} from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { HeroSlideshow } from "@/components/HeroSlideshow";

export const metadata: Metadata = {
  title: "Features",
  description: "Discover Gamana's core features: story-rich audio, hands-free walking tours, narrator guides, Gamana Coins, user-generated tours, and multi-language support.",
  alternates: {
    canonical: 'https://www.gamana.app/features',
  },
};

export default function FeaturesPage() {
  const features = [
    {
      id: "exquisite-storytelling",
      icon: BookOpen,
      title: "Exquisite Storytelling",
      description: "History, culture, and the details most guides skip",
      details: [
        "Professionally researched and written narratives",
        "Historical facts blended with local legends",
        "Surprising discoveries and hidden stories",
        "Cultural context that deepens understanding",
      ],
      gradient: "from-[#0B6E4F] to-[#159895]",
    },
    {
      id: "truly-immersive",
      icon: Headphones,
      title: "Truly Immersive",
      description: "Hands-free, eyes-up exploration",
      details: [
        "Completely hands-free operation",
        "Eyes-up, device-down exploration",
        "Fully present in the moment",
        "No need to read or check your phone",
      ],
      gradient: "from-[#57C5B6] to-[#159895]",
    },
    {
      id: "virtual-travel-guides",
      icon: User,
      title: "Virtual Travel Guides",
      description: "Knowledgeable narrator companions",
      details: [
        "Multiple guide personalities to choose from",
        "Expert knowledge across various topics",
        "Natural, conversational narration",
        "Adaptive communication style",
      ],
      gradient: "from-[#1A5F7A] to-[#159895]",
    },
    {
      id: "gamana-coins",
      icon: GamanaCoinIcon,
      title: "Gamana Coins",
      description: "Earn rewards as you explore",
      details: [
        "Earn coins for tours, reviews, and engagement",
        "Securely tracked in your wallet",
        "Redeem for discounts and upgrades",
        "Unlock premium tours",
      ],
      gradient: "from-[#159895] to-[#0B6E4F]",
    },
    {
      id: "user-generated-tours",
      icon: Share2,
      title: "User-Generated Tours",
      description: "Create and share storylists",
      details: [
        "Create custom tours and storylists",
        "Share your local knowledge",
        "Discover community-created content",
        "Curate themed experiences",
      ],
      gradient: "from-[#57C5B6] to-[#1A5F7A]",
    },
    {
      id: "local-languages",
      icon: Globe,
      title: "Local Languages",
      description: "Stories in local languages",
      details: [
        "Native speaker narration",
        "Cultural context in local language",
        "Learn key phrases as you explore",
        "Pronunciation guides included",
      ],
      gradient: "from-[#1A5F7A] to-[#57C5B6]",
    },
  ];

  const additionalBenefits = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "See nearby places and start tours immediately",
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Perfect for solo travelers, families, and groups",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Tours available in major cities worldwide",
    },
  ];

  return (
    <>
      <main className="min-h-screen">
        <section className="relative h-[62vh] sm:h-[68vh] flex items-center overflow-hidden">
          {/* Photo behind the brand gradient, matching the treatment on /marketplace-redesign,
              /cities, /ecosystem, /about, and /contact. */}
          <div className="absolute inset-0">
            <HeroSlideshow
              images={[
                "/hampi-vittala-temple-chariot-golden-hour-boulder-landscape.jpg",
                "/buckingham-palace-morning-audio-tour-london.png",
                "/traveller-gokak-falls-audio-guide-belagavi-tour.png",
                "/solo-traveller-cobblestone-street-audio-guide-hands-free-exploration.png",
              ]}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B6E4F]/25 via-[#159895]/20 to-[#1A5F7A]/20"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <HeroHeader transparent={true} />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block w-fit">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 animate-fade-in">
                  Premium Audio Tour Features
                </h1>
                <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}></div>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
                See what Gamana does: audio tours you take on foot, at your pace
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={feature.id}
                    id={feature.id}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                      isEven ? "" : "lg:flex-row-reverse"
                    }`}
                  >
                    <div className={`space-y-6 ${isEven ? "" : "lg:order-2"}`}>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{feature.title}</h2>
                      <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start space-x-3">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient} mt-2.5 flex-shrink-0`}></div>
                            <span className="text-sm sm:text-base text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={isEven ? "" : "lg:order-1"}>
                      <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
                        <CardContent className="p-8">
                          <div className={`aspect-square rounded-xl bg-gradient-to-br ${feature.gradient} opacity-10 flex items-center justify-center`}>
                            {feature.id === "gamana-coins" ? (
                              <GamanaCoinIcon className="h-32 w-32 opacity-30" aria-hidden />
                            ) : (
                              <Icon className={`h-32 w-32 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent opacity-30`} />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                And There's More
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Additional benefits that make Gamana your perfect travel companion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {additionalBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="border-2 hover:border-[#37B8AF] transition-all duration-300">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className="bg-gradient-to-br from-[#159895]/10 to-[#57C5B6]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Icon className="h-8 w-8 text-[#2C7A89]" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold">{benefit.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#2C7A89] to-[#37B8AF] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                Ready to Experience These Features?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white">
                Download Gamana and start exploring with narrated audio tours
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 h-auto">
                    Get on Google Play
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                    Contact Us
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
