"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowLeft } from "lucide-react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default

  const faqSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      faqs: [
        {
          question: "How do I download and start using Gamana?",
          answer: "Use the link below to find Gamana on the App Store or Google Play, download the app, and sign up. Once you're in, the app will show you nearby places of interest based on your location. Tap on any site, choose a narrator (optional), and hit play to start your audio journey."
        },
        {
          question: "Do I need an internet connection to use audio narrations?",
          answer: "You need internet to play narrations. If you are in a place with unreliable internet penetration, you can download the narrations and, once downloaded, you can listen completely offline. Perfect for travelers without mobile data access."
        },
        {
          question: "How does the AI personalization work?",
          answer: "Gamana lets you choose from different narrators who have unique personalities and interests—like history, architecture, art, etc. Over time, we'll recommend content and voices based on your preferences and listening habits."
        }
      ]
    },
    {
      id: "pricing-plans",
      title: "Pricing & Plans",
      faqs: [
        {
          question: "How does the pricing work?",
          answer: "You can access a limited selection of content for free. To unlock more features, you can use tokens (pay-as-you-go) or choose a subscription plan for easy access."
        },
        {
          question: "What currencies can I pay with?",
          answer: "Gamana supports payments in local currencies, including USD, EUR, INR and more, depending on your app store and region."
        },
        {
          question: "Can I get a refund on my subscription?",
          answer: "We follow the refund policies of the App Store and Google Play. If you face an issue, reach out to us at support@gamana.app and we'll do our best to help."
        }
      ]
    },
    {
      id: "features-technology",
      title: "Features & Technology",
      faqs: [
        {
          question: "How accurate is the GPS navigation?",
          answer: "Gamana uses your device's GPS to show nearby places, not to trigger audio automatically (yet). GPS accuracy may vary slightly depending on your phone and signal, but it generally works well in open areas."
        },
        {
          question: "Does the app work with headphones and speakers?",
          answer: "Absolutely. Gamana works with wired and Bluetooth headphones, earbuds, car speakers, and external speakers—whatever suits your style of exploring."
        },
        {
          question: "Can I share tours with family and friends?",
          answer: "While content is linked to your account, we're working on family sharing and gift token options. For now, friends can create their own account and explore with their own preferences."
        }
      ]
    },
    {
      id: "narration-content",
      title: "Narration & Content",
      faqs: [
        {
          question: "Can I request a specific tour or city?",
          answer: "Absolutely! We're always adding new places. Use the \"Add your spot\" CTA to suggest locations you'd love to see covered."
        },
        {
          question: "Are the stories historically accurate?",
          answer: "Yes. Our scripts are built using verified sources and research-based prompts, often reviewed or designed with expert input. In cases where legends or myths are told, we clearly flag them as such."
        },
        {
          question: "How long is each tour or narration?",
          answer: "Most narrations range from 5 to 15 minutes per site. You can mix and match them to create your own route, or listen in short bursts between other activities."
        },
        {
          question: "How many languages are supported?",
          answer: "Gamana currently supports English, with select tours also available in Hindi, French, Tamil and Spanish. We're actively expanding to more languages based on user demand."
        }
      ]
    },
    {
      id: "vision-philosophy",
      title: "Vision & Philosophy",
      faqs: [
        {
          question: "Why the name 'Gamana'?",
          answer: "Gamana is a Sanskrit word meaning movement, journey, or path. It reflects our mission: to guide travelers not just through space, but through culture, memory, and meaning."
        },
        {
          question: "What makes Gamana different from other tour apps?",
          answer: "We focus on depth, storytelling, and personalization—not checklists or trivia. With AI-assisted content, local flavor, and multiple narrator options, Gamana gives you a more human and culturally rich experience. We aim to move humanity to connect through the power of story."
        }
      ]
    }
  ];

  // Flatten all FAQs with section info for tracking
  const allFAQs = faqSections.flatMap((section, sectionIndex) =>
    section.faqs.map((faq, faqIndex) => ({
      ...faq,
      sectionId: section.id,
      sectionTitle: section.title,
      globalIndex: sectionIndex * 100 + faqIndex // Unique index for each FAQ
    }))
  );

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Helper function to convert email addresses to links
  const renderAnswerWithLinks = (text: string) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const parts = text.split(emailRegex);
    
    return parts.map((part, index) => {
      // Check if the part matches email pattern
      if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/.test(part)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-[#159895] hover:text-[#1A5F7A] underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Generate FAQPage schema for all FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSections.flatMap(section =>
      section.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    )
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 leading-tight">
                Frequently Asked Questions
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
                Find answers to common questions about Gamana
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-[#159895]/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Back to Home Link */}
              <div className="mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center text-[#159895] hover:text-[#1A5F7A] transition-colors font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </div>

              {/* FAQ Sections */}
              <div className="space-y-12">
                {faqSections.map((section, sectionIndex) => (
                  <div key={section.id} className="space-y-6">
                    {/* Section Title */}
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                      {section.title}
                    </h2>

                    {/* FAQs in Section */}
                    <div className="space-y-4">
                      {section.faqs.map((faq, faqIndex) => {
                        const globalIndex = sectionIndex * 100 + faqIndex;
                        return (
                          <div
                            key={faqIndex}
                            className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFAQ(globalIndex)}
                              className="w-full p-6 md:p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 pr-4">
                                {faq.question}
                              </h3>
                              <ChevronDown
                                className={`h-6 w-6 text-[#159895] flex-shrink-0 transition-transform duration-300 ${
                                  openFAQ === globalIndex ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                openFAQ === globalIndex ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="px-6 md:px-8 pb-6 md:pb-8">
                                <p className="text-lg text-gray-600 leading-relaxed">
                                  {renderAnswerWithLinks(faq.answer)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Still have questions?
                </h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#1A5F7A] hover:to-[#159895] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Contact Support
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

