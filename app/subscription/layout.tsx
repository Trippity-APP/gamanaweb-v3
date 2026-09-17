import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Gamana",
  description:
    "Buy Gamana Coins in INR or USD. Unlock premium audio stories and walks.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "https://www.gamana.app/pricing",
  },
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
