import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "@/components/icons";
import { cn } from "@/lib/utils";

type TourCardProps = {
  href: string;
  title: string;
  description?: string;
  location: string;
  image: string;
  imageAlt: string;
  imageTitle?: string;
  badge?: string;
  cta?: string;
  className?: string;
};

export function TourCard({
  href,
  title,
  description,
  location,
  image,
  imageAlt,
  imageTitle,
  badge,
  cta = "Explore City",
  className,
}: TourCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          title={imageTitle}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ink shadow-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {location}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">{title}</h3>
        {description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{description}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-700">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
