"use client";

import { useEffect, useState } from "react";
import { Globe, Headphones, Languages, MapPin } from "@/components/icons";
import { fetchAllActiveCities } from "@/lib/services/cityService";
import { loadSearchCatalog } from "@/lib/search-catalog";
import { CoverageStatsSkeleton } from "@/components/ui/list-skeletons";

import { IconTile, toneFor, type TileIcon } from "@/components/icons/IconTile";
type CoverageStats = {
  cities: number;
  tours: number;
};

export const CoverageSnapshot = () => {
  const [stats, setStats] = useState<CoverageStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [cities, tours] = await Promise.all([
          fetchAllActiveCities(),
          loadSearchCatalog(),
        ]);
        if (!cancelled) {
          setStats({ cities: cities.length, tours: tours.length });
        }
      } catch {
        if (!cancelled) setStats({ cities: 0, tours: 0 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const statItems = [
    {
      icon: Globe,
      label: "Cities Covered",
      value: stats ? String(stats.cities) : "—",
    },
    {
      icon: Headphones,
      label: "Audio Tours",
      value: stats ? String(stats.tours) : "—",
    },
    {
      icon: Languages,
      label: "Supported Languages",
      value: "7",
    },
    {
      icon: MapPin,
      label: "GPS Experience",
      value: "Location-Aware",
    },
  ];

  return (
    <section className="relative z-10 pb-4 pt-8 sm:pt-10">
      <div className="container-site">
        <div className="rounded-4xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
          {!stats ? (
            <CoverageStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {statItems.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <IconTile icon={stat.icon} tone={toneFor(i)} className="mb-3" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
