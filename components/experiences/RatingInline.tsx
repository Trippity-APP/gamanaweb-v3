import { Star } from "@/components/icons";
import { cn } from "@/lib/utils";

type RatingInlineProps = {
  rating: number | null | undefined;
  count: number | null | undefined;
  className?: string;
};

export function RatingInline({ rating, count, className }: RatingInlineProps) {
  if (!count || !rating) {
    return (
      <span className={cn("inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700", className)}>
        New
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-4 w-4 text-sunset-400" weight="fill" aria-hidden />
      <span className="font-bold text-ink">{rating.toFixed(1)}</span>
      <span className="text-ink-soft">({count.toLocaleString()})</span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5 from {count} reviews
      </span>
    </span>
  );
}
