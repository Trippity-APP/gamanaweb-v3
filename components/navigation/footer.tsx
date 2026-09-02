import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Youtube } from "lucide-react";
// Sourced from nav-config so the footer's Features list can never drift from the nav
// dropdown — it previously kept its own hardcoded copy, which still listed two features
// (On-Demand Personalization, Discounts & Offers) that had been hidden from the nav.
import { featureItems } from "@/lib/data/nav-config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#159895] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1A5F7A] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 hover:border-[#57C5B6] transition-colors">
            <span className="text-xl">🛡️</span>
            <span className="text-sm font-semibold text-white">SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 hover:border-[#57C5B6] transition-colors">
            <span className="text-xl">🔒</span>
            <span className="text-sm font-semibold text-white">GDPR Ready</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700 hover:border-[#57C5B6] transition-colors">
            <span className="text-xl">⚡</span>
            <span className="text-sm font-semibold text-white">99.9% Uptime</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <img
              src="/gamana-logo.svg"
              alt="Gamana Logo"
              title="Gamana Logo"
              className="h-8 w-auto brightness-0 invert"
            />
            <p className="text-sm leading-relaxed text-gray-400">
              Walk with audio tours that work offline, tell you what you're looking at, and don't need you to stare at your phone.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.facebook.com/gamanaapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/gamanaapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="X"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/gamanaapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/gamanaapp/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@gamanaapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@gamanaapp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors p-2 hover:bg-gray-800 rounded-lg"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cities" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#57C5B6] transition-colors text-sm flex items-center gap-2">
                  Blog Stories
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#57C5B6]/20 text-[#57C5B6]">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/ecosystem" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Ecosystem
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#57C5B6] transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              {featureItems.map((feature) => (
                <li key={feature.name}>
                  <Link href={feature.href} className="hover:text-[#57C5B6] transition-colors text-sm">
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#57C5B6] transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#57C5B6] transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
            <div className="space-y-2 mt-4 pt-4 border-t border-gray-800">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@gamana.app" className="hover:text-[#57C5B6] transition-colors">
                  support@gamana.app
                </a>
              </div>
              <p className="text-sm text-gray-400">New Canaan, CT, USA</p>
              <p className="text-sm text-gray-400">Bengaluru, KA, IND</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © {currentYear} Gamana India LLP. All rights reserved. Made with <span className="text-red-500">❤️</span> for travelers worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <a
                href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors text-xs"
              >
                Download iOS App
              </a>
              <span className="text-gray-600">•</span>
              <a
                href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#57C5B6] transition-colors text-xs"
              >
                Download Android App
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
