"use client";

import Link from "next/link";
import { Cookie, Mail, Calendar } from "lucide-react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white py-20 pt-32 md:pt-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Cookie className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-black mb-6 leading-tight">
                Cookie Policy
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Learn how we use cookies and similar technologies to enhance your experience.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Effective Date: June 1st, 2025</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated: August 1st, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="space-y-8 text-gray-700">
                {/* Introduction */}
                <div>
                  <p className="leading-relaxed">
                    This Cookie Policy explains how Gamana ("we", "us", or "our"), operated by SIARLabs LLC, uses cookies and similar technologies on our website and mobile application.
                  </p>
                  <p className="leading-relaxed mt-4">
                    By using Gamana, you consent to our use of cookies as described in this policy.
                  </p>
                </div>

                {/* Section 1 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                  <p className="leading-relaxed mb-4">
                    Cookies are small text files stored on your device when you visit a website or use an app. They help us recognize your device, store preferences, enhance performance, and provide personalized experiences.
                  </p>
                  <p className="leading-relaxed mb-3">Cookies may be:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>First-party</strong> (set by Gamana)</li>
                    <li><strong>Third-party</strong> (set by external services we integrate with)</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">a) Strictly Necessary Cookies</h3>
                  <p className="leading-relaxed mb-3">These are essential for basic functionality, such as:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Site navigation</li>
                    <li>Security</li>
                    <li>Account login and access control</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">b) Performance Cookies</h3>
                  <p className="leading-relaxed mb-3">These collect anonymous data on how users interact with our platform:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pages visited</li>
                    <li>Time spent on site</li>
                    <li>Error reporting</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    <strong>Example:</strong> Google Analytics
                  </p>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">c) Functional Cookies</h3>
                  <p className="leading-relaxed mb-3">These remember user preferences:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Language settings</li>
                    <li>Audio narration mode</li>
                    <li>Location-based customization</li>
                  </ul>

                  <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">d) Targeting or Advertising Cookies</h3>
                  <p className="leading-relaxed mb-3">We may use third-party services to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Serve personalized recommendations or ads</li>
                    <li>Track engagement with marketing campaigns</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    <strong>Examples:</strong> Google Ads, Meta Pixel (if used)
                  </p>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Cookie Consent</h2>
                  <p className="leading-relaxed mb-4">
                    You will be asked to accept or decline non-essential cookies when you first visit our website or app. You can:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accept all cookies</li>
                    <li>Decline non-essential cookies</li>
                    <li>Adjust your preferences through your browser or in-app settings</li>
                  </ul>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">4. How to Manage Cookies</h2>
                  <p className="leading-relaxed mb-4">
                    Most browsers allow you to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Delete cookies</li>
                    <li>Block cookies from specific or all sites</li>
                    <li>Receive alerts before accepting cookies</li>
                  </ul>
                  <p className="leading-relaxed mb-3">Visit your browser's help section for instructions:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Google Chrome</li>
                    <li>Mozilla Firefox</li>
                    <li>Apple Safari</li>
                    <li>Microsoft Edge</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    <strong>Note:</strong> Disabling cookies may affect certain functionalities of Gamana.
                  </p>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Changes to This Policy</h2>
                  <p className="leading-relaxed">
                    We may update this Cookie Policy periodically. Material changes will be communicated through the app or website.
                  </p>
                </div>

                {/* Section 6 - Contact */}
                <div className="bg-gray-50 rounded-lg p-8 mt-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                  <p className="leading-relaxed mb-4">
                    For any questions or concerns about our use of cookies:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <a href="mailto:support@gamana.app" className="text-[#159895] hover:underline">
                          support@gamana.app
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Company Name</p>
                        <p className="text-gray-600">SIARLabs LLC</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-[#159895] mt-1" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-gray-600">24 East Avenue #127 New Canaan CT 06840</p>
                      </div>
                    </div>
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

