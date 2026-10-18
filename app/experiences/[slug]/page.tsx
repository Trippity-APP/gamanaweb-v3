import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/navigation/site-header";
import Footer from "@/components/navigation/footer";
import { JsonLd } from "@/components/site/JsonLd";
import { ExperienceDetailClient } from "@/components/experiences/ExperienceDetailClient";
import type { ExperienceDetail } from "@/lib/api/schemas/experiences";
import { getExperienceDetailSafe, listAllPublishedExperiences } from "@/lib/experiences/api";
import { coverImage, experienceHref, galleryImages, locationLabel } from "@/lib/experiences/format";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { STATIC_SPA_PARAM, isStaticSpaParam } from "@/lib/static-spa";

export async function generateStaticParams() {
  const items = await listAllPublishedExperiences();
  const slugs = Array.from(new Set(items.map((item) => item.slug).filter((slug): slug is string => !!slug)));
  return [...slugs.map((slug) => ({ slug })), { slug: STATIC_SPA_PARAM }];
}

type PageProps = { params: Promise<{ slug: string }> };

function metaDescription(experience: ExperienceDetail): string {
  const base = experience.short_description || experience.description || experience.title;
  const text = base.replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isStaticSpaParam(slug)) {
    return { title: "Experience", description: "Book a local experience with Gamana." };
  }
  const experience = await getExperienceDetailSafe(slug);
  if (!experience) return { title: "Experience not found", robots: { index: false } };

  const url = absoluteUrl(experienceHref(slug));
  const description = metaDescription(experience);
  const image = coverImage(experience);
  const place = locationLabel(experience);
  const title = place ? `${experience.title} — ${place}` : experience.title;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Gamana", type: "website", images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function experienceJsonLd(experience: ExperienceDetail, slug: string) {
  const url = absoluteUrl(experienceHref(slug));
  const images = galleryImages(experience).slice(0, 6);
  const offers =
    experience.from_price && experience.currency
      ? {
          "@type": "Offer",
          price: experience.from_price,
          priceCurrency: experience.currency,
          availability: "https://schema.org/InStock",
          url,
        }
      : undefined;
  const aggregateRating =
    (experience.review_count ?? 0) > 0 && experience.average_rating
      ? { "@type": "AggregateRating", ratingValue: experience.average_rating, reviewCount: experience.review_count, bestRating: 5 }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["TouristTrip", "Product"],
    name: experience.title,
    description: metaDescription(experience),
    url,
    image: images.length ? images : undefined,
    touristType: experience.category ?? undefined,
    provider: experience.operator_name ? { "@type": "Organization", name: experience.operator_name } : undefined,
    brand: experience.operator_name ? { "@type": "Brand", name: experience.operator_name } : undefined,
    offers,
    aggregateRating,
  };
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const experience = isStaticSpaParam(slug) ? null : await getExperienceDetailSafe(slug);

  const crumbs = experience
    ? [
        { name: "Home", path: "/" },
        { name: "Experiences", path: "/experiences/" },
        ...(experience.country ? [{ name: experience.country, path: `/experiences/?country=${encodeURIComponent(experience.country)}` }] : []),
        ...(experience.city ? [{ name: experience.city, path: `/experiences/?city=${encodeURIComponent(experience.city)}` }] : []),
        { name: experience.title, path: experienceHref(slug) },
      ]
    : null;

  return (
    <div className="min-h-screen bg-sand-50">
      <SiteHeader variant="solid" />
      <main>
        {experience && (
          <>
            <JsonLd data={experienceJsonLd(experience, slug)} />
            {crumbs && <JsonLd data={breadcrumbJsonLd(crumbs)} />}
          </>
        )}
        <Suspense fallback={null}>
          <ExperienceDetailClient slugParam={slug} initial={experience} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
