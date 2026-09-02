"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check as CheckIcon,
  Lock,
  MapPin,
  Smartphone,
  Star,
} from "lucide-react";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { useStoreUrl } from "@/hooks/use-store-url";
import { trackStoreClick } from "@/lib/analytics";
import {
  clearMarketplaceCache,
  fetchPublicTourById,
  fetchPublicTours,
  getTourHref,
  tourMatchesCity,
} from "@/lib/marketplace-api";
import { getTierColor, tierLabels, type Tour } from "@/lib/marketplace-data";

function resolveTourId(paramId: string): string {
  if (paramId !== "[id]") return paramId;
  if (typeof window === "undefined") return paramId;
  const match = window.location.pathname.match(/\/(?:explore|marketplace)\/tours\/([^/]+)/);
  return match?.[1] ?? paramId;
}

type MarketplaceTourDetailProps = {
  tourId: string;
  tour: Tour | null;
  relatedTours?: Tour[];
};

export function MarketplaceTourDetail({
  tourId: paramTourId,
  tour: initialTour,
  relatedTours: initialRelatedTours = [],
}: MarketplaceTourDetailProps) {
  const { url: storeUrl, platform } = useStoreUrl();
  const [tour, setTour] = useState<Tour | null>(initialTour);
  const [relatedTours, setRelatedTours] = useState<Tour[]>(initialRelatedTours);
  const [loading, setLoading] = useState(paramTourId === "[id]" && !initialTour);
  const [error, setError] = useState<string | null>(
    initialTour ? null : paramTourId === "[id]" ? null : "This tour is not available."
  );

  const loadTourById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [detail, allTours] = await Promise.all([
        fetchPublicTourById(id),
        fetchPublicTours(),
      ]);

      if (!detail) {
        setTour(null);
        setRelatedTours([]);
        setError("This tour is not available.");
        return;
      }

      setTour(detail);
      const city = detail.location.split(",")[0]?.trim() ?? "";
      setRelatedTours(
        allTours
          .filter((item) => item.id !== detail.id && tourMatchesCity(item, city))
          .slice(0, 3)
      );
    } catch {
      setTour(null);
      setRelatedTours([]);
      setError("We couldn't load this tour right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTour || paramTourId !== "[id]") return;

    const resolved = resolveTourId(paramTourId);
    if (resolved === "[id]") return;

    void loadTourById(resolved);
  }, [paramTourId, initialTour]);

  const retry = () => {
    clearMarketplaceCache();
    const resolved = resolveTourId(paramTourId);
    if (resolved === "[id]") return;
    void loadTourById(resolved);
  };

  const highlights = useMemo(() => tour?.highlights ?? [], [tour]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading tour...
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">{error ?? "Tour not found."}</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/explore">Back to explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <div className="pt-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#159895] hover:text-[#128a86]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explore
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative h-56 sm:h-72 bg-gray-100">
          <MarketplaceCoverImage
            src={tour.image}
            alt={tour.title}
            fill
            priority
            className="object-cover"
          />
          <span
            className={`absolute top-4 left-4 text-[10px] font-semibold px-2 py-0.5 rounded ${getTierColor(tour.tier)}`}
          >
            {tierLabels[tour.tier]?.toUpperCase() ?? tour.tier.toUpperCase()}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{tour.title}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {tour.location} · {tour.duration}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="font-semibold text-gray-900">{tour.rating}</span>
              <span className="text-gray-500">({tour.reviews.toLocaleString()} reviews)</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{tour.description}</p>
            <p className="text-sm text-gray-500">Narrated by {tour.narrator}</p>
          </div>

          {highlights.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Highlights</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 rounded-lg bg-[#F0FBFA] px-3 py-2 text-sm text-gray-700"
                  >
                    <CheckIcon className="h-4 w-4 text-[#159895] shrink-0 mt-0.5" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Card className="border-amber-200 bg-amber-50/60">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                {tour.price === 0 ? (
                  <p className="text-xl font-bold text-emerald-700">Free</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <GamanaCoinIcon className="h-5 w-5" aria-hidden />
                    <p className="text-xl font-bold text-gray-900">{tour.price} Coins</p>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Unlock and listen in the Gamana app with the same account.
                </p>
              </div>
              <Button
                asChild
                className="bg-[#159895] hover:bg-[#128a86] text-white shrink-0"
              >
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackStoreClick(platform === "ios" ? "apple" : "play", "marketplace-tour-detail")
                  }
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Unlock in the app
                </a>
              </Button>
            </CardContent>
          </Card>

          <p className="flex items-start gap-2 text-xs text-gray-500">
            <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#159895] mt-0.5" />
            Web unlock is coming soon. For now, open this tour in the Gamana app to listen offline.
          </p>
        </div>
      </div>

      {relatedTours.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">More in {tour.location.split(",")[0]}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedTours.map((related) => (
              <Link
                key={related.id}
                href={getTourHref(related)}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{related.title}</p>
                <p className="text-xs text-gray-500 mt-1">{related.duration}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
