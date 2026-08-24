import { Suspense } from "react";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { Hero } from "@/components/cities/Hero";
import { CoverageSnapshot } from "@/components/cities/CoverageSnapshot";
import { CityGrid } from "@/components/cities/CityGrid";
import { Differentiation } from "@/components/cities/Differentiation";
import { RequestPlace } from "@/components/cities/RequestPlace";
import { SEOBlock, FinalCTA } from "@/components/cities/SEOBlock";

// This site is a fully static export (output: 'export') — there's no server at request
// time to read a query string, so `?q=` from the Home hero search has to be read
// client-side (CityGrid does this itself via useSearchParams), not as a server prop.
// useSearchParams requires a Suspense boundary so the static shell can still prerender.
export default function CitiesPage() {
    return (
        <main className="min-h-screen bg-background">
            <Header />
            <Hero />
            <div className="pt-0">
                <CoverageSnapshot />
                <Suspense fallback={null}>
                    <CityGrid isPreview={true} />
                </Suspense>
                <Differentiation />
                <RequestPlace />
                <SEOBlock />
                <FinalCTA />
            </div>
            <Footer />
        </main>
    );
}
