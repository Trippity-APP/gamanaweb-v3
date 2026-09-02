import { LucideIcon, Check, Sparkles, Star, TrendingUp } from 'lucide-react';
import type { ComponentType } from 'react';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeroHeader from '@/components/navigation/hero-header';
import Footer from '@/components/navigation/footer';
import Link from 'next/link';

interface Benefit {
  text: string;
}

interface Example {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface QuickFeature {
  icon: LucideIcon;
  title: string;
}

interface EnhancedPageLayoutProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  introTitle: string;
  introText: string[];
  benefits: Benefit[];
  examples: Example[];
  gradient: string;
  quickFeatures?: QuickFeature[];
  /** Photo shown behind the gradient hero, matching the treatment on every other redesigned
   * page (/marketplace-redesign, /cities, /ecosystem, /about, /contact, /features). Falls
   * back to a default so pages that don't pass one still stay visually consistent. */
  heroImage?: string;
}

export default function EnhancedPageLayout({
  icon: Icon,
  title,
  subtitle,
  introTitle,
  introText,
  benefits,
  examples,
  gradient,
  quickFeatures,
  heroImage,
}: EnhancedPageLayoutProps) {
  /* Any page-specific heroImage stays the first frame (so each feature subpage keeps its
     own identity), followed by a shared rotation so no subpage sits on one static photo. */
  const photos = [
    heroImage || '/india-taj-mahal-golden-hour-heritage-discovery.jpg',
    '/traveller-gokak-falls-audio-guide-belagavi-tour.png',
    '/buckingham-palace-morning-audio-tour-london.png',
    '/kerala-alleppey-houseboat-backwaters-golden-hour.jpg',
  ].filter((src, i, all) => all.indexOf(src) === i);
  const defaultQuickFeatures: QuickFeature[] = [
    { icon: Sparkles, title: 'Story-Rich' },
    { icon: Star, title: 'Premium Quality' },
    { icon: TrendingUp, title: 'Constantly Improving' },
  ];

  const features = quickFeatures || defaultQuickFeatures;

  return (
    <>
      <main className="min-h-screen">
        <section className="relative h-[62vh] sm:h-[68vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <HeroSlideshow images={photos} />
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-25`}></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <HeroHeader transparent={true} />

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md mb-4 shadow-2xl opacity-0 animate-fade-in">
                <Icon className="h-12 w-12 text-white" />
              </div>

              <div className="space-y-4">
                <div className="inline-block w-fit">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-2 opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
                    {title}
                  </h1>
                  <div className="h-2 bg-white/60 rounded-full opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}></div>
                </div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
                  {subtitle}
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
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
                    title="Get Gamana - Heritage Travel App with Personalized Audio Tours on iPhone & iPad"
                    className="h-14 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div className="space-y-6">
                  <Badge className={`bg-gradient-to-r ${gradient} text-white border-0`}>
                    Feature Spotlight
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {introTitle}
                  </h2>
                  {introText.map((paragraph, index) => (
                    <p key={index} className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <Card className={`border-4 border-gray-100 shadow-2xl bg-gradient-to-br from-gray-50 to-white`}>
                  <CardContent className="p-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Key Benefits
                    </h3>
                    <ul className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`bg-gradient-to-br ${gradient} rounded-full p-1 flex-shrink-0 mt-0.5`}>
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-gray-700 font-medium">{benefit.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-20">
                <div className="text-center mb-12">
                  <Badge className={`bg-gradient-to-r ${gradient} text-white border-0 mb-4`}>
                    How It Works
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Experience the Difference
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {examples.map((example, index) => {
                    const ExampleIcon = example.icon;
                    return (
                      <Card key={index} className="border-2 hover:border-transparent hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}></div>
                        <CardContent className="p-8 space-y-4">
                          <div className={`bg-gradient-to-br ${gradient} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                            <ExampleIcon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{example.title}</h3>
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{example.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="py-20 bg-white relative overflow-hidden">
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#159895]/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A5F7A]/5 rounded-full blur-3xl"></div>
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
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
