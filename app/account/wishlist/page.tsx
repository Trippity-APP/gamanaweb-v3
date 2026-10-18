"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ExperienceCard, ExperienceCardSkeleton } from "@/components/experiences/ExperienceCard";
import { Heart } from "@/components/icons";
import { apiFetch } from "@/lib/api/client";
import { experienceSummarySchema, type ExperienceSummary } from "@/lib/api/schemas/experiences";
import { listOf } from "@/lib/account/api";

const wishlistItemSchema = z.union([
  experienceSummarySchema,
  z.object({ experience: experienceSummarySchema }).passthrough().transform((v) => v.experience),
]);

export default function WishlistPage() {
  const [items, setItems] = useState<ExperienceSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setItems(null);
    apiFetch("/users/me/wishlists/experiences", { auth: "required", schema: listOf(wishlistItemSchema) })
      .then(setItems)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Wishlist</h1>
      {error ? (
        <ErrorState title="Couldn't load your wishlist" onRetry={load} />
      ) : items === null ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <ExperienceCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          hint="Save experiences you like — they'll sync to your app."
          action={
            <Button asChild className="h-11 rounded-full px-6">
              <Link href="/experiences/">Explore experiences</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ExperienceCard
              key={item.id}
              experience={{ ...item, is_wishlisted: true }}
              onWishlistChange={(saved) => !saved && setItems((list) => list?.filter((x) => x.id !== item.id) ?? null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
