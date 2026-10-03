import Link from "next/link";
import { ArrowRight, MessageCircle } from "@/components/icons";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/JsonLd";
import { FaqExplorer } from "@/components/faq/FaqExplorer";
import { Reveal } from "@/components/motion/Reveal";
import { FAQ_SECTIONS } from "@/lib/data/faq";
import { getPhoto } from "@/lib/images";
import { faqJsonLd } from "@/lib/seo";

const faqSchema = faqJsonLd(FAQ_SECTIONS.flatMap((section) => section.faqs));

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <HeroHeader transparent />
      <main>
        <PageHero
          className="pb-24 sm:pb-28"
          image={getPhoto("hero-faq")}
          imageAlt=""
          breadcrumbs={[{ label: "FAQ", href: "/faq/" }]}
          heading="Frequently Asked Questions"
          subtitle="Find answers to common questions about Gamana"
        />

        <FaqExplorer sections={FAQ_SECTIONS} />

        <section className="section-tight pb-20">
          <div className="container-site">
            <Reveal variant="scale">
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-6 py-12 text-center text-white shadow-lift sm:px-12">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sunset-400/25 blur-3xl" aria-hidden />
                <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
                  <MessageCircle className="h-7 w-7" aria-hidden />
                </span>
                <h3 className="text-h3 relative mt-6">Still have questions?</h3>
                <p className="relative mx-auto mt-3 max-w-xl text-white/80">
                  Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
                </p>
                <Link
                  href="/contact/"
                  className="focus-ring group relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-brand-800 shadow-card transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift active:scale-95"
                >
                  Contact Support
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
