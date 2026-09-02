import { Metadata } from "next";
import LandingContent from "./landing-content";

// Dedicated acquisition page for paid/social traffic — deliberately noindexed so it
// doesn't compete with the home page for organic search (it largely covers the same
// ground, just restructured for a cold, ad-driven visitor). Flip `index: true` if the
// marketing team wants this URL to also rank on its own.
export const metadata: Metadata = {
  title: "Gamana, Your Pocket Audio Tour Guide | Download the App",
  description:
    "GPS-triggered audio tours that turn any walk into a story. No guide, no wifi, no planning. Download Gamana free on iOS and Android.",
  robots: { index: false, follow: true },
};

export default function LandingPage() {
  return <LandingContent />;
}
