"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Footprints, Headphones, Search, X } from "@/components/icons";
import { IconTile } from "@/components/icons/IconTile";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { MarketplaceCoverImage } from "@/components/marketplace/marketplace-cover-image";
import { fetchCities, type ApiCity } from "@/lib/services/cityService";
import { getTourHref } from "@/lib/marketplace-api";
import { buildExploreSuggestions, buildSearchRows, findBestTourMatch, type SearchRow } from "@/lib/explore-search";
import type { SearchTour } from "@/lib/marketplace-data";
import { loadSearchCatalog } from "@/lib/search-catalog";
import { getCityImage, type CityImage } from "@/lib/city-image";
import { FEATURED_CITIES } from "@/lib/data/home";
import { cn } from "@/lib/utils";

export type ExploreHeroSearchVariant = "explore" | "home";

type ExploreHeroSearchProps = {
  catalog?: SearchTour[];
  variant?: ExploreHeroSearchVariant;
  containerClassName?: string;
  /** Explore variant: sync input from URL search query. */
  urlQuery?: string;
  /** "sm" header pill, "md" original Explore look, "lg" rounded hero, "xl" Klook-style banner bar. */
  size?: "sm" | "md" | "lg" | "xl";
  placeholder?: string;
};

const INPUT_SIZE = {
  sm: "h-10 rounded-full pl-10 pr-[6.5rem] py-2 text-sm shadow-none border border-ink/10 bg-white focus:ring-brand-500/40",
  md: "h-13 rounded-full pl-11 pr-[7.5rem] py-3.5 text-sm shadow-lg bg-white/95 backdrop-blur-sm focus:ring-white/60",
  lg: "h-16 rounded-full pl-12 pr-[9.5rem] py-4 text-base shadow-2xl bg-white focus:ring-white/70",
  xl: "h-14 rounded-2xl pl-12 pr-[9rem] text-base shadow-[0_20px_50px_-12px_rgba(15,27,36,0.45)] bg-white focus:ring-sunset-300 sm:h-16 sm:pl-14 sm:pr-[11rem] sm:text-lg",
};

const BUTTON_SIZE = {
  sm: "right-1 rounded-full px-3 py-1.5 text-xs",
  md: "right-1.5 rounded-full px-4 py-2.5 text-xs",
  lg: "right-2 rounded-full px-6 py-3 text-sm",
  xl: "right-2 h-10 rounded-xl px-5 text-sm sm:h-12 sm:px-8 sm:text-base",
};

const CLEAR_POSITION = {
  sm: "right-[4.25rem]",
  md: "right-[5rem]",
  lg: "right-[7rem]",
  xl: "right-[6.75rem] sm:right-[8.5rem]",
};

const BUTTON_TONE = {
  teal: "bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#128a86] hover:to-[#164e63]",
  sunset: "bg-gradient-to-r from-sunset-400 to-sunset-500 hover:from-sunset-500 hover:to-sunset-500",
};

const ICON_SIZE = {
  sm: "left-3.5 h-4 w-4",
  md: "left-4 h-4 w-4",
  lg: "left-5 h-5 w-5",
  xl: "left-4 h-5 w-5 sm:left-5 sm:h-6 sm:w-6",
};

const thumbOf = (image: CityImage) => image.photo?.srcSet[0].src ?? image.src;
const safeSrc = (src: string) => (/^https?:\/\//.test(src) ? src : encodeURI(src));

const POPULAR_ROWS: SearchRow[] = FEATURED_CITIES.slice(0, 6).map((c) => ({
  key: `popular-${c.id}`,
  kind: "city",
  title: c.name,
  subtitle: `${c.tagline} · India`,
  image: thumbOf(c.image),
  select: { type: "city", value: c.name },
}));

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-extrabold text-ink">{text.slice(at, at + q.length)}</strong>
      {text.slice(at + q.length)}
    </>
  );
}

function RowThumb({ row }: { row: SearchRow }) {
  if (row.kind === "collection") {
    return (
      <IconTile
        icon={row.contentKind === "walk" ? Footprints : Headphones}
        tone={row.contentKind === "walk" ? "teal" : "sunset"}
        className="h-12 w-12 rounded-xl"
      />
    );
  }
  return (
    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand-100">
      {row.image &&
        (row.kind === "city" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={safeSrc(row.image)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <MarketplaceCoverImage src={row.image} alt="" fill className="object-cover" />
        ))}
    </span>
  );
}

/**
 * Site-wide search combobox: cities (API) plus audio stories and walks (catalog), shown as
 * one ranked list with thumbnails.
 * - explore: filters the current page via ?q=
 * - home: navigates to story/walk detail pages, or /marketplace?q= for cities
 */
export function ExploreHeroSearch({
  catalog: catalogProp,
  variant = "explore",
  containerClassName = "relative w-full max-w-xl mx-auto",
  urlQuery = "",
  size = "md",
  placeholder = "Search stories, walks, or cities…",
}: ExploreHeroSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const [query, setQuery] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lazyCatalog, setLazyCatalog] = useState<SearchTour[] | null>(null);
  const catalog = catalogProp ?? lazyCatalog ?? [];
  const wantsCatalog = open || query !== "";
  const trimmed = query.trim();

  useEffect(() => {
    if (catalogProp || !wantsCatalog) return;
    let cancelled = false;
    loadSearchCatalog().then((tours) => {
      if (!cancelled) setLazyCatalog(tours);
    });
    return () => {
      cancelled = true;
    };
  }, [catalogProp, wantsCatalog]);

  useEffect(() => {
    if (variant === "explore") setQuery(urlQuery);
  }, [urlQuery, variant]);

  useEffect(() => {
    if (!trimmed) {
      setCities([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetchCities({ search: trimmed, active: true, page_size: 8 });
        if (!cancelled) setCities(response.data?.cities ?? []);
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
  }, [trimmed]);

  useEffect(() => setActive(-1), [trimmed]);

  const suggestions = useMemo(() => buildExploreSuggestions(query, catalog, cities), [query, catalog, cities]);
  const rows = useMemo(
    () => buildSearchRows(query, catalog, cities.map((c) => ({ ...c, image: thumbOf(getCityImage(c)) }))),
    [query, catalog, cities]
  );

  const catalogLoading = !catalogProp && lazyCatalog === null;
  const pending = !!trimmed && rows.length === 0 && (loading || catalogLoading);
  const noResults = !!trimmed && rows.length === 0 && !pending;
  const visibleRows = trimmed ? (noResults ? POPULAR_ROWS : rows) : POPULAR_ROWS;
  const optionCount = visibleRows.length + (trimmed ? 1 : 0);
  const showPanel = open;

  const optionId = (i: number) => `${listId}-option-${i}`;

  const goToExploreSearch = (value: string) => {
    setOpen(false);
    setQuery(value);
    router.push(`/marketplace?q=${encodeURIComponent(value)}`);
  };

  const goToTour = (tour: SearchTour) => {
    setOpen(false);
    router.push(getTourHref(tour));
  };

  const applyExploreFilter = (value: string) => {
    setOpen(false);
    setQuery(value);
    router.replace(`${pathname}?q=${encodeURIComponent(value)}`);
  };

  const seeAll = () => (variant === "home" ? goToExploreSearch(trimmed) : applyExploreFilter(trimmed));

  const selectRow = (row: SearchRow) => {
    const { select } = row;
    if (select.type === "href") {
      setOpen(false);
      router.push(select.href);
    } else if (select.type === "city") {
      if (variant === "home") goToExploreSearch(select.value);
      else applyExploreFilter(select.value);
    } else if (variant === "home") {
      goToTour(select.tour);
    } else {
      applyExploreFilter(select.tour.title);
    }
  };

  const selectOption = (i: number) => {
    if (i < visibleRows.length) selectRow(visibleRows[i]);
    else seeAll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;

    if (variant === "home") {
      const normalized = trimmed.toLowerCase();
      const bestTour = findBestTourMatch(trimmed, catalogProp ?? (await loadSearchCatalog()));

      if (bestTour) {
        const title = bestTour.title.toLowerCase();
        if (title === normalized || title.startsWith(normalized)) {
          goToTour(bestTour);
          return;
        }
      }

      const topCity = suggestions.cities[0];
      if (topCity) {
        const cityName = topCity.label.toLowerCase();
        if (cityName === normalized || cityName.startsWith(normalized) || normalized.startsWith(cityName)) {
          goToExploreSearch(topCity.label);
          return;
        }
      }

      if (bestTour) {
        goToTour(bestTour);
        return;
      }
      goToExploreSearch(topCity?.label ?? trimmed);
      return;
    }

    if (suggestions.cities[0]) applyExploreFilter(suggestions.cities[0].label);
    else if (suggestions.stories[0]) applyExploreFilter(suggestions.stories[0].tour.title);
    else if (suggestions.walks[0]) applyExploreFilter(suggestions.walks[0].tour.title);
    else applyExploreFilter(trimmed);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (!optionCount) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i < 0 && step < 0 ? optionCount - 1 : (i + step + optionCount) % optionCount));
    } else if (e.key === "Enter" && open && active >= 0 && active < optionCount) {
      e.preventDefault();
      selectOption(active);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  const rowClass = (i: number) =>
    cn(
      "flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 transition-colors",
      i === active ? "bg-sand-100" : "hover:bg-sand-50"
    );

  return (
    <Popover open={showPanel} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={containerClassName}>
          <form onSubmit={handleSubmit} className="relative" role="search">
            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${ICON_SIZE[size]}`} aria-hidden />
            <input
              type="text"
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              aria-label={placeholder}
              autoComplete="off"
              className={`w-full text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 ${INPUT_SIZE[size]}`}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery("");
                  setOpen(true);
                }}
                className={`focus-ring absolute top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink ${CLEAR_POSITION[size]}`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
            <button
              type="submit"
              className={`focus-ring absolute top-1/2 -translate-y-1/2 text-white font-semibold transition-colors ${BUTTON_TONE[size === "xl" ? "sunset" : "teal"]} ${BUTTON_SIZE[size]}`}
            >
              Search
            </button>
          </form>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] min-w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-1rem)] max-h-[min(70vh,560px)] overflow-y-auto rounded-3xl border border-ink/5 bg-white p-2 shadow-lift"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {pending ? (
          <div className="space-y-1 p-1" role="status" aria-label="Loading suggestions">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <span className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {noResults && (
              <p className="px-3 pb-2 pt-3 text-sm text-ink-soft">
                No matches for &ldquo;{trimmed}&rdquo; yet. Try a city, or browse these popular destinations.
              </p>
            )}
            {(!trimmed || noResults) && (
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Popular destinations</p>
            )}
            <ul id={listId} role="listbox" aria-label="Search suggestions">
              {visibleRows.map((row, i) => (
                <li
                  key={row.key}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => selectRow(row)}
                  className={rowClass(i)}
                >
                  <RowThumb row={row} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      <Highlight text={row.title} query={noResults ? "" : trimmed} />
                    </span>
                    <span className="block truncate text-xs text-ink-muted">{row.subtitle}</span>
                  </span>
                </li>
              ))}
              {trimmed && (
                <li
                  id={optionId(visibleRows.length)}
                  role="option"
                  aria-selected={active === visibleRows.length}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(visibleRows.length)}
                  onClick={seeAll}
                  className={cn(rowClass(visibleRows.length), "mt-1 min-h-12 justify-between border-t border-ink/5 font-semibold text-brand-800")}
                >
                  <span className="truncate text-sm">See all results for &ldquo;{trimmed}&rdquo;</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </li>
              )}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
