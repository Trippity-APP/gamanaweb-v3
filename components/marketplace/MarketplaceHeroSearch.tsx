"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { fetchCities, type ApiCity } from "@/lib/services/cityService";

/**
 * Same city-scoped search as Home's HeroCitySearch, but scoped to the Marketplace hero.
 * Commits via `router.replace(pathname + ?city=X)` — MarketplaceBrowser reads the same
 * `city` param reactively and re-filters tours whenever it changes.
 */
export function MarketplaceHeroSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city") ?? "";
  const [query, setQuery] = useState(cityFromUrl);
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(cityFromUrl);
  }, [cityFromUrl]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setCities([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetchCities({
          search: q,
          active: true,
          page_size: 8,
        });
        if (!cancelled) {
          setCities(response.data?.cities ?? []);
        }
      } catch {
        if (!cancelled) setCities([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const suggestions = useMemo(() => cities.slice(0, 6), [cities]);
  const showSuggestions = open && !!query.trim() && (suggestions.length > 0 || loading);

  const applyCity = (name: string) => {
    setOpen(false);
    setQuery(name);
    router.replace(`${pathname}?city=${encodeURIComponent(name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions[0]) {
      applyCity(suggestions[0].name);
    } else if (query.trim()) {
      applyCity(query.trim());
    }
  };

  return (
    <Popover open={showSuggestions} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full max-w-xl mx-auto">
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
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] max-w-xl rounded-xl border border-gray-100 bg-white p-0 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading && suggestions.length === 0 ? (
          <div className="px-4 py-3 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500">No cities found.</p>
        ) : (
          suggestions.map((city) => (
            <button
              key={city.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCity(city.name)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-[#F0FBFA] transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <MapPin className="h-3.5 w-3.5 text-[#159895] shrink-0" />
              <span className="text-sm font-medium text-gray-900">{city.name}</span>
              <span className="text-xs text-gray-400">{city.country_name}</span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
