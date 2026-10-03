import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/site/JsonLd";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { ImageVariant } from "@/lib/images";

type Crumb = { label: string; href: string };

type PageHeroProps = {
  eyebrow?: ReactNode;
  heading: ReactNode;
  subtitle?: ReactNode;
  /** A processed photo from the image manifest (preferred) or a plain public path. */
  image: string | ImageVariant;
  imageAlt: string;
  imageTitle?: string;
  /** e.g. an object-position class to keep the subject clear of the left-aligned text. */
  imageClassName?: string;
  /** Rendered after "Home"; the last crumb is the current page. Emits BreadcrumbList JSON-LD. */
  breadcrumbs?: Crumb[];
  children?: ReactNode;
  size?: "lg" | "md";
  className?: string;
};

/** Static, image-backed page hero with a single h1. No slideshow by design. */
export function PageHero({
  eyebrow,
  heading,
  subtitle,
  image,
  imageAlt,
  imageTitle,
  imageClassName,
  breadcrumbs,
  children,
  size = "md",
  className,
}: PageHeroProps) {
  const crumbs = breadcrumbs?.length ? [{ label: "Home", href: "/" }, ...breadcrumbs] : null;

  return (
    <section
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-ink text-white",
        size === "lg" ? "min-h-[78vh] pt-32 pb-20 sm:pb-24 lg:pt-40" : "min-h-[56vh] pt-32 pb-14 sm:pb-20 lg:pt-40",
        className
      )}
    >
      {typeof image === "string" ? (
        <Image src={image} alt={imageAlt} title={imageTitle} fill priority sizes="100vw" className={cn("-z-20 object-cover", imageClassName)} />
      ) : (
        <ResponsiveImage image={image} alt={imageAlt} title={imageTitle} sizes="100vw" priority fill className={cn("-z-20", imageClassName)} />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/10"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(21,152,149,0.35),transparent_55%)]"
        aria-hidden
      />

      <div className="container-site">
        {crumbs && (
          <>
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
                {crumbs.map((c, i) => {
                  const last = i === crumbs.length - 1;
                  return (
                    <li key={c.href} className="flex items-center gap-1.5">
                      {last ? (
                        <span aria-current="page" className="text-white">
                          {c.label}
                        </span>
                      ) : (
                        <Link href={c.href} className="focus-ring rounded transition-colors hover:text-white">
                          {c.label}
                        </Link>
                      )}
                      {!last && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <JsonLd data={breadcrumbJsonLd(crumbs.map((c) => ({ name: c.label, path: c.href })))} />
          </>
        )}

        <div className="max-w-3xl animate-fade-in">
          {eyebrow && (
            <p className="eyebrow mb-5 text-brand-200">
              <span className="h-px w-6 bg-brand-200" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="text-display text-balance">{heading}</h1>
          {subtitle && <p className="text-lead mt-6 max-w-2xl text-white/85">{subtitle}</p>}
          {children && <div className="mt-8 flex flex-wrap items-center gap-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
