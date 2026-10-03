import './globals.css';
import type { Metadata } from 'next';
import { Inter, Caveat, Plus_Jakarta_Sans } from 'next/font/google';
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import SideRail from "@/components/side-rail";
import { SkipLink } from "@/components/site/SkipLink";
import { CartProvider } from "@/lib/cart-context";
import { AccountProvider } from "@/lib/account-context";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
// Display face for headings on redesigned pages, reached via Tailwind's `font-display`.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
// Casual cursive script, used sparingly as a signature-style accent (e.g. "with Gamana"
// under hero headlines) — exposed as a CSS variable so it can be reached via Tailwind's
// font-script utility (see tailwind.config.ts) without becoming the site's body font.
const caveat = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-caveat' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gamana.app'),
  title: {
    default: 'AI-Powered Travel App for Personalized Audio Tours | Gamana',
    template: '%s | Gamana',
  },
  description: 'Gamana is an AI-powered travel app offering personalized audio tours and smart travel guides. Explore destinations smarter and plan trips effortlessly.',
  alternates: {
    canonical: 'https://www.gamana.app',
  },
  authors: [{ name: 'Gamana' }],
  creator: 'Gamana',
  publisher: 'Gamana',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.gamana.app',
    siteName: 'Gamana',
    title: 'AI-Powered Travel App for Personalized Audio Tours | Gamana',
    description: 'Gamana is an AI-powered travel app offering personalized audio tours and smart travel guides. Explore destinations smarter and plan trips effortlessly.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gamana - Immersive AR/VR Cultural Exploration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Travel App for Personalized Audio Tours | Gamana',
    description: 'Gamana is an AI-powered travel app offering personalized audio tours and smart travel guides. Explore destinations smarter and plan trips effortlessly.',
    images: ['/og-image.jpg'],
    creator: '@gamana',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-M9VHJ6Z2');
            `,
          }}
        />
        {/* End Google Tag Manager */}
        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "wfki3pw99i");
            `,
          }}
        />
        {/* End Microsoft Clarity */}
        <link rel="icon" type="image/png" href="/favicon-gamana.png" />
        <link rel="apple-touch-icon" href="/favicon-gamana.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#159895" />
        {/* Scroll-reveal styles only apply under `.js`, so content is fully visible
            to crawlers and no-JS visitors. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${inter.className} ${inter.variable} ${caveat.variable} ${jakarta.variable}`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M9VHJ6Z2"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SkipLink />
        <AccountProvider>
          <CartProvider>
            {children}
            <SideRail />
          </CartProvider>
        </AccountProvider>
        <Toaster />
      </body>
    </html>
  );
}
