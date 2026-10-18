import type { Metadata } from "next";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { ReturnClient } from "@/components/experiences/checkout/ReturnClient";

export const metadata: Metadata = {
  title: "Booking status",
  description: "Your Gamana experience booking status.",
  robots: { index: false, follow: false },
};

export default function CheckoutReturnPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[60vh] bg-sand-50">
        <ReturnClient />
      </main>
      <Footer />
    </>
  );
}
