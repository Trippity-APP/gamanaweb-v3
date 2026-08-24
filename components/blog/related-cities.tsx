import Link from "next/link";
import { MapPin } from "lucide-react";

import { cities, type City } from "@/lib/data/cities";
import type { ArticleRegion } from "@/content/blog/articles";

const regionToCountries: Record<string, string[]> = {
  india: ["India"],
  europe: [
    "United Kingdom",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Germany",
    "Czech Republic",
    "Austria",
    "Hungary",
    "Portugal",
    "Greece",
  ],
  "southeast-asia": [
    "Singapore",
    "Thailand",
    "Vietnam",
    "Malaysia",
    "Indonesia",
    "Philippines",
    "Taiwan",
  ],
  japan: ["Japan"],
  "middle-east": ["UAE", "Turkey"],
  americas: ["United States", "Brazil", "Argentina", "Mexico", "Peru"],
};

interface Props {
  region?: ArticleRegion;
  excludeCityNames?: string[];
  limit?: number;
}

export default function RelatedCities({
  region,
  excludeCityNames = [],
  limit = 4,
}: Props) {
  if (!region || region === "general") return null;

  const countries = regionToCountries[region] ?? [];
  const matched = cities
    .filter(
      (c) =>
        countries.includes(c.country) &&
        !excludeCityNames.includes(c.name.toLowerCase())
    )
    .slice(0, limit);

  if (matched.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Destinations you might like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {matched.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </section>
  );
}

function CityCard({ city }: { city: City }) {
  return (
    <Link href="/all-cities" className="group block">
      <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
        <img
          src={city.image}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1 text-white">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-sm font-semibold truncate">{city.name}</span>
          </div>
          <p className="text-white/70 text-xs">{city.country}</p>
        </div>
      </div>
    </Link>
  );
}
