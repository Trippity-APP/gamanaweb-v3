"use client";

import { useEffect, useState } from "react";
import { CardRail } from "@/components/site/CardRail";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CatalogCard } from "@/components/marketplace/CatalogCard";
import type { LinkedStory } from "@/components/experiences/ExperienceDetailClient";
import { fetchPublicTourById, getDefaultTourImage, getTourHref } from "@/lib/marketplace-api";
import { searchPublicStoriesByCity } from "@/lib/places-api";
import type { Tour } from "@/lib/marketplace-data";

function toLinkedStory(tour: Tour): LinkedStory {
  return {
    href: getTourHref(tour),
    title: tour.title,
    image: tour.image || getDefaultTourImage(),
    narrator: tour.narrator || undefined,
    duration: tour.duration || undefined,
  };
}

/**
 * Live story data for an experience page: the city's public stories (Stories nearby rail)
 * and the linked story, so both reflect the catalogue after the static build.
 */
export function useExperienceStories(city: string | null | undefined, linkedStoryId: string | null | undefined, initial: LinkedStory | null) {
  const [stories, setStories] = useState<Tour[]>([]);
  const [linked, setLinked] = useState<LinkedStory | null>(initial);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const list = city ? await searchPublicStoriesByCity(city, controller.signal).catch(() => [] as Tour[]) : [];
      if (controller.signal.aborted) return;
      setStories(list);
      if (!linkedStoryId) return setLinked(null);
      const inCity = list.find((tour) => tour.id === linkedStoryId);
      if (inCity) return setLinked(toLinkedStory(inCity));
      const walk = await fetchPublicTourById(linkedStoryId).catch(() => null);
      if (!controller.signal.aborted && walk) setLinked(toLinkedStory(walk));
    })();
    return () => controller.abort();
  }, [city, linkedStoryId]);

  return { stories: stories.filter((tour) => tour.id !== linkedStoryId), linked };
}

export function StoriesNearbyRail({ city, stories }: { city: string; stories: Tour[] }) {
  if (!stories.length) return null;
  const title = `Stories nearby in ${city}`;
  return (
    <section className="section-tight border-t border-ink/5 bg-white">
      <div className="container-site">
        <SectionHeader
          title={title}
          lead="Audio stories to listen to in the Gamana app before or after your visit."
          align="left"
          action={{ href: `/marketplace/?city=${encodeURIComponent(city)}`, label: "See all" }}
          className="mb-6 sm:mb-8"
        />
        <CardRail label={title}>
          {stories.slice(0, 12).map((tour, index) => (
            <div key={tour.id} className="w-[280px] sm:w-[320px]">
              <CatalogCard tour={tour} kind="story" index={index} />
            </div>
          ))}
        </CardRail>
      </div>
    </section>
  );
}
