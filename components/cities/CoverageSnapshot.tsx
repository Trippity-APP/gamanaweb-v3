"use client";

import { useEffect, useState } from "react";
import { Globe, Headphones, Languages, MapPin } from "lucide-react";
import { fetchAllActiveCities } from "@/lib/services/cityService";
import { fetchPublicTours } from "@/lib/marketplace-api";
import { CoverageStatsSkeleton } from "@/components/ui/list-skeletons";

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
          fetchPublicTours(),
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
      color: "text-[#159895]",
      bg: "bg-[#159895]/10",
    },
    {
      icon: Headphones,
      label: "Audio Tours",
      value: stats ? String(stats.tours) : "—",
      color: "text-[#159895]",
      bg: "bg-[#159895]/10",
    },
    {
      icon: Languages,
      label: "Supported Languages",
      value: "7",
      color: "text-[#159895]",
      bg: "bg-[#159895]/10",
    },
    {
      icon: MapPin,
      label: "GPS Experience",
      value: "Location-Aware",
      color: "text-[#159895]",
      bg: "bg-[#159895]/10",
    },
  ];

  return (
    <section className="relative z-10 -mt-14 sm:-mt-16 pb-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card shadow-lg p-5 sm:p-8">
          {!stats ? (
            <CoverageStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {statItems.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-3 rounded-full ${stat.bg} mb-3`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
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
