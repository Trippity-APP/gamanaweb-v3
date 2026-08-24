"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { cities as cityDirectory } from "@/lib/data/cities";

/**
 * Same city-scoped search as Home's HeroCitySearch, but for the two Marketplace hero
 * pages (/marketplace and /marketplace-redesign) — moved up here (was previously buried
 * in the white overlap card below the hero) so the primary action sits right under the
 * "Travel with Confidence" headline instead of a scroll-step away.
 *
 * Commits via `router.replace(pathname + ?city=X)` rather than navigating to a fixed
 * route (unlike HeroCitySearch, which always sends you to /marketplace) — this keeps you
 * on whichever of the two Marketplace pages you're already on. MarketplaceBrowser reads
 * the same `city` param reactively and re-filters Tours/Experiences whenever it changes,
 * so this component doesn't need any direct connection to MarketplaceBrowser itself.
 */
export function MarketplaceHeroSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city") ?? "";
  const [query, setQuery] = useState(cityFromUrl);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cityDirectory
      .filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query]);

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

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
          {suggestions.map((c) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCity(c.name)}
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
