import type { Metadata } from "next";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { CheckoutClient } from "@/components/experiences/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Gamana experience booking.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[60vh] bg-sand-50">
        <CheckoutClient />
      </main>
      <Footer />
    </>
  );
}
