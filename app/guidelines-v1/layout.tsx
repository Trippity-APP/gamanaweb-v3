import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GuidelinesThemeProvider } from "@/components/guidelines/ThemeProvider";
import { Shell } from "@/components/guidelines/Shell";
import { guidelinesCss } from "@/lib/guidelines/css";

export const metadata: Metadata = {
  title: { absolute: "Gamana Brand Guidelines v1" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: null,
  openGraph: null,
  twitter: null,
  // Read by the GTM and Clarity loaders in the root layout: no third-party analytics on this page.
  other: { "gmn-analytics": "off" },
};

export default function GuidelinesLayout({ children }: { children: ReactNode }) {
  return (
    <GuidelinesThemeProvider>
      <style dangerouslySetInnerHTML={{ __html: guidelinesCss() }} />
      <div data-guidelines="" className="min-h-screen bg-g-bg text-g-fg">
        <Shell>{children}</Shell>
      </div>
    </GuidelinesThemeProvider>
  );
}
