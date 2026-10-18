import Link from "next/link";
import { MapPin } from "@/components/icons";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { PriceTag } from "@/components/experiences/PriceTag";
import { RatingInline } from "@/components/experiences/RatingInline";
import { WishlistButton } from "@/components/experiences/WishlistButton";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics";
import type { ExperienceSummary } from "@/lib/api/schemas/experiences";
import {
  cardBadge,
  coverImage,
  experienceHref,
  formatDuration,
  hasFreeCancellation,
  languageLabels,
  locationLabel,
} from "@/lib/experiences/format";
import { cn } from "@/lib/utils";

const BADGE_TONE = {
  sunset: "bg-sunset-100 text-sunset-600",
  brand: "bg-brand-50 text-brand-800",
  neutral: "bg-white/95 text-ink",
} as const;

type CardExperience = ExperienceSummary & { is_wishlisted?: boolean | null; cancellation_policy?: string | null; is_cancellable?: boolean | null };

export function ExperienceCard({
  experience,
  className,
  onWishlistChange,
}: {
  experience: CardExperience;
  className?: string;
  onWishlistChange?: (saved: boolean) => void;
}) {
  if (!experience.slug) return null;
  const badge = cardBadge(experience);
  const location = locationLabel(experience);
  const duration = formatDuration(experience.duration_minutes);
  const langs = languageLabels(experience.languages);
  const freeCancel = hasFreeCancellation({
    cancellation_policy: experience.cancellation_policy ?? undefined,
    is_cancellable: experience.is_cancellable ?? undefined,
  });
  const meta = [duration, langs.length ? `${langs[0]}${langs.length > 1 ? ` +${langs.length - 1}` : ""}` : null].filter(Boolean);

  return (
    <Link
      href={experienceHref(experience.slug)}
      onClick={() => track("experience_card_click", { slug: experience.slug ?? undefined })}
      className={cn(
        "focus-ring group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        <MarketplaceCoverImage
          src={coverImage(experience)}
          alt={experience.title}
          fill
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        {badge && (
          <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm", BADGE_TONE[badge.tone])}>
            {badge.label}
          </span>
        )}
        <WishlistButton experienceRef={experience.slug} initial={experience.is_wishlisted} onChange={onWishlistChange} className="absolute right-4 top-4" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {location && (
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            {location}
          </p>
        )}
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">{experience.title}</h3>
        {(meta.length > 0 || freeCancel) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
            {meta.join(" · ")}
            {freeCancel && (
              <>
                {meta.length > 0 && <span aria-hidden>·</span>}
                <span className="font-medium text-forest">Free cancellation</span>
              </>
            )}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <RatingInline rating={experience.average_rating} count={experience.review_count} />
          <PriceTag amount={experience.from_price} currency={experience.currency} compareAt={experience.compare_at_price} className="justify-end text-right" />
        </div>
      </div>
    </Link>
  );
}

export function ExperienceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card" aria-hidden>
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}
