"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, User, Headphones, Share2, Globe, ArrowRight, Download, ChevronLeft, ChevronDown, Play, MapPin } from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import Footer from "@/components/navigation/footer";
import SiteHeader from "@/components/navigation/site-header";
import NarratorCard from "@/components/narrator-card";
import { HeroCitySearch } from "@/components/HeroCitySearch";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import type { BlogSummary } from "@/lib/blog";
import type { Tour } from "@/lib/marketplace-data";
import { trackStoreClick } from "@/lib/analytics";
import { useStoreUrl } from "@/hooks/use-store-url";

// Same figures as components/cities/CoverageSnapshot.tsx — kept in sync so the hero
// teaser and the Cities page never contradict each other.
const HERO_STATS = [
  { value: "50+", label: "Cities" },
  { value: "700+", label: "Stories" },
  { value: "7", label: "Languages" },
];

const NARRATOR_TEASER = [
  { name: "Lewis", image: "/narrator1.png" },
  { name: "Bella", image: "/narrator2.png" },
  { name: "Aria", image: "/narrator3.png" },
  { name: "Arjun", image: "/narrator4.png" },
  { name: "Aarti", image: "/narrator6.png" },
  { name: "Neerja", image: "/narrator7.png" },
];

type HomeClientProps = {
  latestStories: BlogSummary[];
  catalog?: Tour[];
};

export default function HomeClient({ latestStories, catalog = [] }: HomeClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default
  const { url: storeUrl, platform } = useStoreUrl();

  const singleStoryHighlight = latestStories.length === 1;
  const storyGridCols =
    latestStories.length === 1
      ? "md:grid-cols-1"
      : latestStories.length === 2
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  const appScreens = [
    {
      image: "/demo02.png",
      label: "Audio Stories",
      title: "Experience Engaging Storytelling Wherever You Go",
      subtitle: "Listen to stories that play as you walk, from Old Delhi lanes to cities around the world, told by narrators who sound like locals, not textbooks.",
      bg: "from-[#F4A100] via-[#E85D04] to-[#7A1F1F]",
      imageAlt: "Experience engaging storytelling with the Gamana app – travel with guide-like insights and narration that plays as you walk",
      imageTitle: "Gamana – Travel with Guide-Like Insights and Engaging Storytelling"
    },
    {
      image: "/demo03.png",
      label: "Explore with Confidence",
      title: "Travel with Confidence",
      subtitle: "From local customs and etiquette to practical, city-specific safety tips, Gamana keeps you prepared for whatever the road brings, so you can explore with the confidence of a local.",
      bg: "from-[#0F6E5C] via-[#0B5563] to-[#1B2A6B]",
      imageAlt: "Gamana tour guide app featuring expert narrators sharing audio stories and local insights for travelers",
      imageTitle: "Gamana – Expert Tour Guide App for Audio Walking Tours"
    },
    {
      image: "/demo05.png",
      label: "Build Your Storylist",
      title: "Save Your Fave Sites Forever, Share With Loved Ones",
      subtitle: "Save your personal storylist of favorite places, then share them with friends and family so you never forget what touched you most.",
      bg: "from-[#D98E04] via-[#B23A48] to-[#6B1E3C]",
      imageAlt: "Build and share personalized audio tour lists with the Gamana heritage travel app – discover unique journeys and story playlists",
      imageTitle: "Gamana – Personalize and Share Your Audio Tour Lists"
    },
    {
      image: "/demo04.png",
      label: "Related Topics",
      title: "Be It Heritage or Culture, Find Your Lane",
      subtitle: "Whether you seek heritage, culture, religion or relaxation, find the narrator and stories that move you the most. The learning doesn't stop there, explore with Related Topics.",
      bg: "from-[#9D174D] via-[#701A75] to-[#312E81]",
      imageAlt: "Explore travel topics and personalized stories with the Gamana travel guide app",
      imageTitle: "Gamana – Expand Your Exploration with Travel Topics"
    },
  ];

  const keyFeatures = [
    {
      icon: BookOpen,
      title: "Exquisite Storytelling",
      description: "History, culture, and the details most guides skip",
      slug: "exquisite-storytelling",
    },
    {
      icon: Headphones,
      title: "Truly Immersive",
      description: "Hands-free, eyes-up exploration",
      slug: "truly-immersive",
    },
    {
      icon: User,
      title: "Virtual Travel Guides",
      description: "Narrator voices you can pick for each walk",
      slug: "virtual-travel-guides",
    },
    {
      icon: GamanaCoinIcon,
      title: "Gamana Coins",
      description: "Earn rewards as you explore",
      slug: "gamana-coins",
    },
    {
      icon: Share2,
      title: "User-Generated Tours",
      description: "Create and share storylists",
      slug: "user-generated-tours",
    },
    {
      icon: Globe,
      title: "Local Languages",
      description: "Stories in local languages",
      slug: "local-languages",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % appScreens.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [appScreens.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % appScreens.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + appScreens.length) % appScreens.length);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Gamana",
            "url": "https://www.gamana.app",
            "logo": "https://www.gamana.app/logo.png",
            "sameAs": [
              "https://www.facebook.com/gamanaapp",
              "https://twitter.com/gamanaapp",
              "https://www.instagram.com/gamanaapp"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MobileApplication",
            "name": "Gamana",
            "url": "https://www.gamana.app",
            "applicationCategory": "TravelApplication",
            "operatingSystem": "iOS, Android",
            "description": "Gamana is India's first heritage travel app, offering audio tours that match your interests and smart travel guides to explore destinations effortlessly.",
            "offers": {
              "@type": "Offer",
              "price": "0.00",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      <main className="min-h-screen">
        {/* Immersive Hero Section with App Screens */}
        <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-1000 bg-gradient-to-br ${appScreens[currentSlide].bg}`}>
          <SiteHeader variant="transparent" />
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            {/* Travel-themed decorative icons */}
            <div className="absolute top-32 left-[15%] opacity-20 animate-float" style={{animationDelay: '0s'}}>
              <Image src="/Picture9 copy copy.png" alt="" width={80} height={80} className="drop-shadow-lg" />
            </div>
            <div className="absolute bottom-32 left-[10%] opacity-20 animate-float" style={{animationDelay: '2s'}}>
              <Image src="/Picture8 copy copy.png" alt="" width={70} height={70} className="drop-shadow-lg" />
            </div>
            <div className="absolute top-40 right-[12%] opacity-20 animate-float" style={{animationDelay: '1s'}}>
              <Image src="/Picture6 copy.png" alt="" width={60} height={60} className="drop-shadow-lg" />
            </div>
            <div className="absolute bottom-40 right-[18%] opacity-20 animate-float" style={{animationDelay: '3s'}}>
              <Image src="/Picture7.png" alt="" width={50} height={50} className="drop-shadow-lg" />
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full pb-16 lg:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start h-full pt-32 lg:pt-40">
              {/* Left: Quick Intro */}
              <div className="text-white space-y-8 text-center lg:text-left order-1 lg:order-1 pb-2 lg:pb-16">
                {/* Reserve one fixed-height block (sized for the longest slide's 3-line
                    title + 3-line subtitle) and vertically center the actual badge/title/
                    subtitle group inside it. Shorter slides now split their slack evenly
                    above and below the text instead of dumping it all in one gap right
                    before the search bar. */}
                <div className="flex flex-col justify-center min-h-[260px] sm:min-h-[295px] md:min-h-[350px] lg:min-h-[420px]">
                  <div className="space-y-4 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-700">
                      <Play className="h-4 w-4" />
                      <span className="text-sm font-semibold">{appScreens[currentSlide].label}</span>
                    </div>

                    {currentSlide === 0 ? (
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black leading-tight transition-all duration-700">
                        {appScreens[currentSlide].title}
                      </h1>
                    ) : (
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black leading-tight transition-all duration-700">
                        {appScreens[currentSlide].title}
                      </h2>
                    )}

                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl font-medium transition-all duration-700">
                      {appScreens[currentSlide].subtitle}
                    </p>
                  </div>
                </div>

                {/* Search-first hero element, VoiceMap-inspired — scoped to Gamana's own
                    city catalog so every result is real coverage, not a dead end. */}
                <div className="space-y-3">
                  <HeroCitySearch catalog={catalog} />
                  {/* Spread evenly across the same width as the search bar above, rather
                      than clustering to the left with fixed gaps. */}
                  <div className="flex items-center justify-between max-w-md mx-auto lg:mx-0">
                    {HERO_STATS.map((s) => (
                      <div key={s.label} className="flex items-baseline gap-1.5">
                        <p className="text-lg sm:text-xl font-bold text-white">{s.value}</p>
                        <p className="text-[11px] sm:text-xs text-white/70">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Feature Highlights */}
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0">
                  {keyFeatures.slice(0, 4).map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/20 transition-all">
                        <Icon className="h-6 w-6 mb-2 text-white" />
                        <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                      </div>
                    );
                  })}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-2 lg:mb-0">
                  <div className="flex gap-3">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-105 transition-transform"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Download Gamana Heritage Travel App with Personalized Audio Tours on Android"
                        title="Get Gamana – Heritage Travel App with Personalized Audio Tours on Android"
                        className="h-14 w-auto"
                      />
                    </a>
                    <a
                      href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:scale-105 transition-transform"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                        alt="Download Gamana Heritage Travel App with Personalized Audio Tours on iOS"
                        title="Get Gamana – Heritage Travel App with Personalized Audio Tours on iPhone & iPad"
                        className="h-14 w-auto"
                      />
                    </a>
                  </div>

                  <Link
                    href="/start-your-journey"
                    className="group inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
                  >
                    Or start your Gamana journey online
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right: Image Carousel */}
              <div className="relative order-2 lg:order-2 flex justify-center" style={{height: 'calc(100vh - 8rem)', top: 0, alignSelf: 'stretch'}}>
                <div className="relative w-full h-full flex justify-center items-end">
                  {appScreens.map((screen, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 flex items-end justify-center transition-all duration-700 ${
                        index === currentSlide
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 pointer-events-none z-0'
                      }`}
                      style={{bottom: 0}}
                    >
                      <Image
                        src={screen.image}
                        alt={screen.imageAlt}
                        title={screen.imageTitle}
                        width={600}
                        height={900}
                        className="object-contain"
                        style={{height: '100%', width: 'auto', maxWidth: '100%', marginBottom: 0, paddingBottom: 0, objectPosition: 'bottom'}}
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2 text-white/80">
              <span className="text-sm">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Narrator teaser strip — VoiceMap-style "meet the guides" row right under the
            hero, using real personas already showcased in full further down the page. */}
        <section className="py-10 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
              Get insight and inspiration from our narrator guides
            </p>
            <a
              href="#narrators"
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 hover:opacity-80 transition-opacity"
            >
              {NARRATOR_TEASER.map((n) => (
                <span key={n.name} className="flex flex-col items-center gap-1.5">
                  <Image
                    src={n.image}
                    alt={n.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <span className="text-[11px] font-medium text-gray-500">{n.name}</span>
                </span>
              ))}
            </a>
          </div>
        </section>

        {/* Key Features Section - Premium Redesign */}
        <section id="features" className="py-28 bg-gradient-to-br from-gray-50 via-white to-[#159895]/5 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-[#159895]/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#57C5B6]/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1A5F7A]/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-[#1A5F7A] uppercase tracking-wider mb-2">
                Core Features
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-gray-900 leading-tight">
                Everything You Need to <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Explore Like a Local</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Six features that change how you walk through a city
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyFeatures.map((feature, index) => {
                const Icon = feature.icon;
                // Enhanced color palettes with vibrant, distinct colors for each feature
                const featureStyles = [
                  {
                    // Feature 1: Deep Teal - Primary brand
                    iconBg: 'from-[#159895] to-[#1A5F7A]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#159895]',
                    cardBorderHover: 'hover:border-[#159895]',
                    shadowColor: 'shadow-[#159895]/30',
                    glowColor: 'from-[#159895]/50',
                    numberBg: 'bg-gradient-to-br from-[#159895] to-[#1A5F7A]',
                    accentColor: 'text-[#159895]',
                  },
                  {
                    // Feature 2: Vibrant Cyan
                    iconBg: 'from-[#57C5B6] to-[#159895]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#57C5B6]',
                    cardBorderHover: 'hover:border-[#57C5B6]',
                    shadowColor: 'shadow-[#57C5B6]/30',
                    glowColor: 'from-[#57C5B6]/50',
                    numberBg: 'bg-gradient-to-br from-[#57C5B6] to-[#159895]',
                    accentColor: 'text-[#57C5B6]',
                  },
                  {
                    // Feature 3: Deep Blue
                    iconBg: 'from-[#1A5F7A] to-[#159895]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#1A5F7A]',
                    cardBorderHover: 'hover:border-[#1A5F7A]',
                    shadowColor: 'shadow-[#1A5F7A]/30',
                    glowColor: 'from-[#1A5F7A]/50',
                    numberBg: 'bg-gradient-to-br from-[#1A5F7A] to-[#159895]',
                    accentColor: 'text-[#1A5F7A]',
                  },
                  {
                    // Feature 4: Emerald teal
                    iconBg: 'from-[#0B6E4F] to-[#159895]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#0B6E4F]',
                    cardBorderHover: 'hover:border-[#0B6E4F]',
                    shadowColor: 'shadow-[#0B6E4F]/30',
                    glowColor: 'from-[#0B6E4F]/50',
                    numberBg: 'bg-gradient-to-br from-[#0B6E4F] to-[#159895]',
                    accentColor: 'text-[#0B6E4F]',
                  },
                  {
                    // Feature 5: Deep teal-blue
                    iconBg: 'from-[#1A5F7A] to-[#0B6E4F]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#1A5F7A]',
                    cardBorderHover: 'hover:border-[#1A5F7A]',
                    shadowColor: 'shadow-[#1A5F7A]/30',
                    glowColor: 'from-[#1A5F7A]/50',
                    numberBg: 'bg-gradient-to-br from-[#1A5F7A] to-[#0B6E4F]',
                    accentColor: 'text-[#1A5F7A]',
                  },
                  {
                    // Feature 6: Aqua teal
                    iconBg: 'from-[#57C5B6] to-[#1A5F7A]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#57C5B6]',
                    cardBorderHover: 'hover:border-[#57C5B6]',
                    shadowColor: 'shadow-[#57C5B6]/30',
                    glowColor: 'from-[#57C5B6]/50',
                    numberBg: 'bg-gradient-to-br from-[#57C5B6] to-[#1A5F7A]',
                    accentColor: 'text-[#57C5B6]',
                  },
                  {
                    // Feature 7: Deep teal
                    iconBg: 'from-[#159895] to-[#0B6E4F]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#159895]',
                    cardBorderHover: 'hover:border-[#159895]',
                    shadowColor: 'shadow-[#159895]/30',
                    glowColor: 'from-[#159895]/50',
                    numberBg: 'bg-gradient-to-br from-[#159895] to-[#0B6E4F]',
                    accentColor: 'text-[#159895]',
                  },
                  {
                    // Feature 8: Teal-aqua
                    iconBg: 'from-[#159895] to-[#57C5B6]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-[#159895]',
                    cardBorderHover: 'hover:border-[#159895]',
                    shadowColor: 'shadow-[#159895]/30',
                    glowColor: 'from-[#159895]/50',
                    numberBg: 'bg-gradient-to-br from-[#159895] to-[#57C5B6]',
                    accentColor: 'text-[#159895]',
                  },
                ];
                const style = featureStyles[index];
                return (
                  <Card
                    key={index}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                  >
                    <CardContent className="p-6 space-y-4 relative flex flex-col h-full">
                      {/* Icon */}
                      <div className="relative">
                        <div className={`bg-gradient-to-br ${style.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3 flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1A5F7A] transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Button */}
                      <Link href={`/features/${feature.slug}`} className="mt-4">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] text-white font-semibold"
                        >
                          Explore More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Virtual Travel Guides Section */}
        <section id="narrators" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-[#1A5F7A] uppercase tracking-wider mb-2">
                Our Virtual Travel Guide Personas
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-gray-900 leading-tight">
                Explore Our <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Virtual Travel Guides</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Personalize your journey with a narrator whose voice and personality match your style. From insightful historians to adventurous locals, pick a narrator whose voice you'd actually want in your ear for an hour.
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

        {/* Latest Tours and Offers Section */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold text-[#1A5F7A] uppercase tracking-wider mb-2">
                Discover & Explore
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-gray-900 leading-tight">
                Representative <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Tours & Offers</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Audio tours from narrators who know the city. Free walks, longer routes, and bundles to save Coins.
              </p>
            </div>

            {/* Featured Tours Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Featured Tour 1 - Varanasi Ghats */}
              <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/varanasi ghats golden hour river boats temple spires panoramic view.jpg"
                    alt="Varanasi Ghats Audio Tour with Expert Tourist Guide"
                    title="Varanasi Ghats Audio Tour – Tourist Guide Experience"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A5F7A] transition-colors">
                    Varanasi Ghats
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Explore the stories of the timeless Ghats of Varanasi, where life shares space with death. Start at the Pancha Ganga Ghats and work your way to Assi Ghat in time for their memorable Ganga Aarti.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>Varanasi, India</span>
                  </div>
                  <div className="flex items-center justify-end border-t pt-4 mt-auto">
                    <Button asChild className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A]">
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-tours")}
                      >
                        Explore Tour
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured Tour 2 - Colosseum and the Roman Forum */}
              <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/rome-colosseum-tour.jpg"
                    alt="Colosseum and Roman Forum Audio Tour with Expert Tourist Guide"
                    title="Colosseum and Roman Forum Audio Tour – Tourist Guide Experience"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A5F7A] transition-colors">
                    Colosseum and the Roman Forum
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Explore the surroundings of the Colosseum and the Roman Forum&apos;s fascinating stories at your own pace!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>Rome, Italy</span>
                  </div>
                  <div className="flex items-center justify-end border-t pt-4 mt-auto">
                    <Button asChild className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A]">
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-tours")}
                      >
                        Explore Tour
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Featured Tour 3 - South Goa Taxi Tour */}
              <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src="/chapora-fort-self-guided-tour-explore-goas-iconic-sunset-fort.jpg"
                    alt="South Goa Taxi Tour with Expert Tourist Guide"
                    title="South Goa Taxi Tour – Tourist Guide Experience"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#1A5F7A] transition-colors">
                    South Goa - Taxi Tour
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Enjoy the sun-soaked syncretic culture of South Goa with a full-day audio route through churches, beaches, and Goa&apos;s UNESCO Heritage Site, the Basilica of Bom Jesus.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>South Goa, India</span>
                  </div>
                  <div className="flex items-center justify-end border-t pt-4 mt-auto">
                    <Button asChild className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A]">
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-tours")}
                      >
                        Explore Tour
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Offers Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-r from-[#0B6E4F] to-[#159895] rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="inline-block bg-[#FFB100] text-[#0B6E4F] px-3 py-1 rounded-full text-sm font-bold mb-4">
                    NEW USER
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Claim Your Free 5 Coins</h3>
                  <p className="mb-4 opacity-90">Unlock 5 premium stories, on us</p>
                  <Button asChild className="bg-white text-[#0B6E4F] hover:bg-gray-100">
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-offers")}
                    >
                      Claim Offer
                    </a>
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="inline-block bg-[#FFB100] text-[#1A5F7A] px-3 py-1 rounded-full text-sm font-bold mb-4">
                    BUNDLE & SAVE
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Delhi Heritage Pass</h3>
                  <p className="mb-4 opacity-90">Explore the layers of Delhi's history</p>
                  <Button asChild className="bg-white text-[#1A5F7A] hover:bg-gray-100">
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackStoreClick(platform === "ios" ? "apple" : "play", "home-offers")}
                    >
                      View Bundle
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Stories Section */}
        <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-[#E0F7F4]/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-[#1A5F7A] uppercase tracking-wider mb-2">
                Fresh on the blog
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black text-gray-900 leading-tight mb-4">
                Latest Stories <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">From Us</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Product notes, narration experiments, and community diaries that inspire the tours we're building next.
              </p>
            </div>
            <div
              className={`grid grid-cols-1 ${storyGridCols} gap-8 mb-10 ${
                singleStoryHighlight ? "max-w-3xl mx-auto" : ""
              }`}
            >
              {latestStories.map((story) => (
                <Link
                  key={story.slug}
                  href={`/blog/${story.slug}`}
                  className={`bg-white rounded-3xl shadow-lg border border-gray-100 hover:border-[#159895]/40 transition-all flex flex-col overflow-hidden hover:-translate-y-2 h-full ${
                    singleStoryHighlight
                      ? "p-8 md:p-10"
                      : ""
                  }`}
                >
                  <div className={`relative w-full overflow-hidden ${
                    singleStoryHighlight ? "aspect-[16/9] mb-8 rounded-2xl" : "aspect-[16/10] mb-6 rounded-t-3xl"
                  }`}>
                    <BlogCoverImage
                      src={story.coverImage}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={`flex-1 flex flex-col ${singleStoryHighlight ? "px-0" : "p-6"}`}>
                    <div className="text-sm text-gray-500 mb-3">
                      {new Date(story.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      • {story.readTime}
                    </div>
                    <h3
                      className={`font-bold text-gray-900 mb-3 ${
                        singleStoryHighlight ? "text-3xl" : "text-2xl"
                      }`}
                    >
                      {story.title}
                    </h3>
                    <p className="text-gray-600 flex-1 mb-4 line-clamp-3">{story.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-[#159895]/10 text-[#159895]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {story.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          {story.authorTitle}
                        </p>
                      </div>
                      <span className={`inline-flex items-center font-semibold text-[#1A5F7A] ${
                        singleStoryHighlight ? "text-base" : "text-sm"
                      }`}>
                        Read story
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/blog">
                <Button size="lg" className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] px-10 text-lg">
                  Visit the Blog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ecosystem CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#1A5F7A] via-[#37B8AF] to-[#3B82F6] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 leading-tight">
                Join the Gamana Ecosystem
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed font-medium">
                Discover our growing network of partners, content creators, and travel enthusiasts.
                We&apos;re building audio tours with partners and creators who know their cities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ecosystem">
                  <Button size="lg" className="bg-white text-[#1A5F7A] hover:bg-gray-100 text-lg px-8 py-6">
                    Partner with Gamana
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Final CTA */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#159895]/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A5F7A]/5 rounded-full blur-3xl"></div>
            {/* Travel icons in CTA */}
            <div className="absolute top-16 left-[8%] opacity-10">
              <Image src="/Picture8.png" alt="" width={70} height={70} className="drop-shadow-lg" />
            </div>
            <div className="absolute bottom-16 right-[10%] opacity-10">
              <Image src="/Picture6.png" alt="" width={75} height={75} className="drop-shadow-lg" />
            </div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-gray-900 leading-tight">
                Ready to <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Explore?</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                Join travellers who explore cities with Gamana in their ears
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <a
                href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Download Gamana Heritage Travel App with Personalized Audio Tours on Android"
                  title="Get Gamana - Heritage Travel App with Personalized Audio Tours on Android"
                  className="h-16 w-auto"
                />
              </a>
              <a
                href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download Gamana Heritage Travel App with Personalized Audio Tours on iOS"
                  title="Get Gamana - Heritage Travel App with Personalized Audio Tours on iPhone & iPad"
                  className="h-16 w-auto"
                />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-[#159895]/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 text-gray-900 leading-tight">
                  Frequently Asked <span className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] bg-clip-text text-transparent">Questions</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
                  Everything you need to know about Gamana
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                  Getting Started
                </h3>
              </div>

              <div className="space-y-4 mb-10">
                {/* FAQ Item 1 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 0 ? null : 0)}
                    className="w-full p-6 md:p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 pr-4">
                      How do I download and start using Gamana?
                    </h3>
                    <ChevronDown
                      className={`h-6 w-6 text-[#159895] flex-shrink-0 transition-transform duration-300 ${
                        openFAQ === 0 ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFAQ === 0 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Use the link below to find Gamana on the App Store or Google Play, download the app, and sign up. Once you're in, the app will show you nearby places of interest based on your location. Tap on any site, choose a narrator (optional), and hit play to start your audio journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 1 ? null : 1)}
                    className="w-full p-6 md:p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 pr-4">
                      Do I need an internet connection to use audio narrations?
                    </h3>
                    <ChevronDown
                      className={`h-6 w-6 text-[#159895] flex-shrink-0 transition-transform duration-300 ${
                        openFAQ === 1 ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFAQ === 1 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        You need internet to play narrations. If you are in a place with unreliable internet penetration, you can download the narrations and, once downloaded, you can listen completely offline. Perfect for travelers without mobile data access.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 2 ? null : 2)}
                    className="w-full p-6 md:p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 pr-4">
                      How does the AI personalization work?
                    </h3>
                    <ChevronDown
                      className={`h-6 w-6 text-[#159895] flex-shrink-0 transition-transform duration-300 ${
                        openFAQ === 2 ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFAQ === 2 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 md:px-8 pb-6 md:pb-8">
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Gamana lets you choose from different narrators who have unique personalities and interests, like history, architecture, art, etc. Over time, we'll recommend content and voices based on your preferences and listening habits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#1A5F7A] hover:to-[#159895] text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/faq">
                    Read More FAQs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
