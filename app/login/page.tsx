import type { Metadata } from "next";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Gamana account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-sand-50 py-12 lg:py-16">
        <div className="container-site flex justify-center">
          <LoginPageClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
