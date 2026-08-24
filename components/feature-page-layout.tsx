import Link from 'next/link';
import { ArrowLeft, Check, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/navigation/header';
import Footer from '@/components/navigation/footer';

interface Benefit {
  text: string;
}

interface Example {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturePageLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  introTitle: string;
  introText: string[];
  benefits: Benefit[];
  examples: Example[];
  gradient: string;
}

export default function FeaturePageLayout({
  icon: Icon,
  title,
  subtitle,
  introTitle,
  introText,
  benefits,
  examples,
  gradient,
}: FeaturePageLayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        <section className={`relative bg-gradient-to-br ${gradient} text-white py-20 md:py-28`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-4">
                <Icon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {introTitle}
                  </h2>
                  {introText.map((paragraph, index) => (
                    <p key={index} className="text-lg text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <Card className="border-2 border-blue-100">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Key Benefits</h3>
                    <ul className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{benefit.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {examples.map((example, index) => {
                    const ExampleIcon = example.icon;
                    return (
                      <Card key={index} className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                        <CardContent className="p-6 space-y-4">
                          <div className={`bg-gradient-to-br ${gradient} w-14 h-14 rounded-xl flex items-center justify-center`}>
                            <ExampleIcon className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold">{example.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{example.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1A5F7A]/10 to-[#159895]/10 rounded-2xl p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Ready to Experience This Feature?
                  </h2>
                  <p className="text-lg text-gray-600">
                    Download Gamana and discover how {title.toLowerCase()} enhances your travel experience
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="lg" className={`bg-gradient-to-r ${gradient} text-white`}>
                        Download on Google Play
                      </Button>
                    </a>
                    <Link href="/features">
                      <Button size="lg" variant="outline">
                        Explore More Features
                      </Button>
                    </Link>
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
