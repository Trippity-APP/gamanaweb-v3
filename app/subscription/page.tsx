'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, Sparkles, Crown, Star, Zap, Users, Globe, Headphones, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeroHeader from '@/components/navigation/hero-header';
import Footer from '@/components/navigation/footer';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PlanFeature[];
  highlighted: boolean;
  icon: any;
  gradient: string;
}

const plans: Plan[] = [
  {
    id: 'silver',
    name: 'Silver',
    tier: 'silver',
    tagline: 'Perfect for casual explorers',
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      { name: 'Access to all Silver tours', included: true },
      { name: 'Basic audio quality', included: true },
      { name: 'Limited offline downloads (5/month)', included: true },
      { name: 'Community support', included: true },
      { name: 'Gold & Platinum tours', included: false },
      { name: 'HD audio quality', included: false },
      { name: 'Unlimited offline downloads', included: false },
      { name: 'Priority support', included: false },
    ],
    highlighted: false,
    icon: Star,
    gradient: 'from-gray-400 to-gray-500'
  },
  {
    id: 'gold',
    name: 'Gold',
    tier: 'gold',
    tagline: 'For passionate travelers',
    price: {
      monthly: 9.99,
      yearly: 99.99
    },
    features: [
      { name: 'Access to all Silver & Gold tours', included: true },
      { name: 'HD audio quality', included: true },
      { name: 'Unlimited offline downloads', included: true },
      { name: '20% discount on Platinum tours', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Early access to new tours', included: true },
      { name: 'All Platinum tours included', included: false },
      { name: '24/7 premium support', included: false },
    ],
    highlighted: true,
    icon: Crown,
    gradient: 'from-yellow-400 via-orange-400 to-orange-500'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tier: 'platinum',
    tagline: 'Ultimate travel experience',
    price: {
      monthly: 19.99,
      yearly: 199.99
    },
    features: [
      { name: 'Unlimited access to ALL tours', included: true },
      { name: 'Ultra HD audio quality', included: true },
      { name: 'Unlimited offline downloads', included: true },
      { name: 'Platinum-only tours', included: true },
      { name: '24/7 premium support', included: true },
      { name: 'Early access to all new content', included: true },
      { name: 'Personalized tour recommendations', included: true },
      { name: 'Ad-free experience', included: true },
    ],
    highlighted: false,
    icon: Sparkles,
    gradient: 'from-[#159895] via-[#57C5B6] to-[#1A5F7A]'
  }
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'platinum': return 'bg-gradient-to-r from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <>
      <div className="min-h-screen">
        <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#159895] via-[#1A5F7A] to-[#159895] overflow-hidden">
          <HeroHeader transparent={true} />

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-16">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Choose Your Adventure
                </h1>
                <p className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto">
                  Pick a plan and get access to premium audio tours
                </p>
              </div>

            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12 -mt-16 relative z-20">
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-2 shadow-xl inline-flex gap-2">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('monthly')}
                className={billingCycle === 'monthly' ? 'bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white rounded-full' : 'rounded-full'}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('yearly')}
                className={billingCycle === 'yearly' ? 'bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white rounded-full' : 'rounded-full'}
              >
                Yearly
                <Badge className="ml-2 bg-green-500 text-white text-xs">Save 17%</Badge>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
              const priceLabel = billingCycle === 'monthly' ? '/month' : '/year';

              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 border-0 ${
                    plan.highlighted
                      ? 'shadow-2xl scale-105 ring-4 ring-orange-400/50'
                      : 'shadow-xl hover:shadow-2xl hover:-translate-y-2'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-center py-2 text-sm font-bold">
                      MOST POPULAR
                    </div>
                  )}

                  <CardHeader className={plan.highlighted ? 'pt-12' : 'pt-6'}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} mb-4 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.tagline}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-2">
                      {price === 0 ? (
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">FREE</p>
                      ) : (
                        <>
                          <p className={`text-4xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            ${price}
                          </p>
                          <span className="text-gray-500">{priceLabel}</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1 ${
                            feature.included
                              ? `bg-gradient-to-r ${plan.gradient}`
                              : 'bg-gray-200'
                          }`}>
                            <Check className={`h-4 w-4 ${feature.included ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full py-6 text-lg font-semibold shadow-lg ${
                        plan.highlighted
                          ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`
                          : `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`
                      }`}
                    >
                      {price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">Why Choose Gamana Premium?</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#159895] to-[#1A5F7A] mb-2 shadow-lg">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Explore Worldwide</h3>
                  <p className="text-white/80">Access tours from 150+ cities across 50+ countries</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 mb-2 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Expert Narrators</h3>
                  <p className="text-white/80">Learn from local experts and professional storytellers</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 mb-2 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Always Growing</h3>
                  <p className="text-white/80">New tours added weekly, new tours for members first</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Still have questions?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team is here to help you choose the perfect plan for your travel needs
            </p>
            <Button size="lg" variant="outline" className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-lg px-8 py-6 h-auto">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
