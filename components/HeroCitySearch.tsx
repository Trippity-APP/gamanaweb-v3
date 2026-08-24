"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { cities } from "@/lib/data/cities";

/**
 * VoiceMap-inspired search-first hero element — scoped to Gamana's own city catalog
 * (lib/data/cities.ts) rather than a raw Google Places autocomplete, so every suggestion
 * is guaranteed to resolve to real coverage instead of dead-ending on a city we don't
 * have. Selecting or submitting a city routes straight into a city-filtered Marketplace
 * (/marketplace?city=<name>) rather than the Cities info page — the goal is to get a
 * cold visitor looking at buyable Tours/Combos/Experiences as fast as possible, per the
 * same "low cognitive load, beautifully clear" reasoning already used on /marketplace's
 * own hero. MarketplaceBrowser reads the `city` param client-side and filters to it.
 */
export function HeroCitySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

  const goToCity = (name: string) => {
    setOpen(false);
    router.push(`/marketplace?city=${encodeURIComponent(name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions[0]) {
      goToCity(suggestions[0].name);
    } else if (query.trim()) {
      goToCity(query.trim());
    }
  };

  return (
    // max-w-xl matches MarketplaceHeroSearch on Explore, so the two search boxes read as
    // the same control rather than two different ones.
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto lg:mx-0">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Where are you headed? Try Delhi, Goa, Varanasi..."
          className="w-full h-13 rounded-full bg-white/95 backdrop-blur-sm pl-11 pr-24 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:from-[#128a86] hover:to-[#164e63] transition-colors"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
          {suggestions.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToCity(c.name)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F0FBFA] transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-[#159895] shrink-0" />
              <span className="text-sm font-medium text-gray-900">{c.name}</span>
              <span className="text-xs text-gray-400">{c.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
