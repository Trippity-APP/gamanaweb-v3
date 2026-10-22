"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Compass,
  Filter,
  Footprints,
  Landmark,
  Navigation,
  PenTool,
  Sparkles,
  Stars,
  Utensils,
  X,
  type IconProps,
} from "@/components/icons";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { ExperienceCard, ExperienceCardSkeleton } from "@/components/experiences/ExperienceCard";
import { ExperienceFiltersPanel, Pill } from "@/components/experiences/ExperienceFiltersPanel";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { ExperienceFilterOptions, ExperienceSummary } from "@/lib/api/schemas/experiences";
import { getExperienceFilterOptions, listExperiences } from "@/lib/experiences/api";
import { formatMoney } from "@/lib/experiences/format";
import { writeLastCity } from "@/lib/home/last-city";
import { track } from "@/lib/analytics";
import {
  EMPTY_FILTERS,
  activeChips,
  categoryLabel,
  parseFilters,
  parsePage,
  serializeFilters,
  toListQuery,
  type ExperienceFilters,
} from "@/lib/experiences/filters";

const CATEGORY_ICONS: Record<string, ComponentType<IconProps>> = {
  adventure: Compass,
  attraction: Landmark,
  food: Utensils,
  heritage: Building2,
  spiritual: Stars,
  transport: Navigation,
  walking: Footprints,
  workshop: PenTool,
};

type LoadState = "loading" | "ready" | "error";

export function ExperiencesBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filters = useMemo(() => parseFilters(new URLSearchParams(queryString)), [queryString]);

  useEffect(() => writeLastCity(filters.city), [filters.city]);
  const filterKey = serializeFilters(filters);
  const urlPage = parsePage(new URLSearchParams(queryString));

  const [options, setOptions] = useState<ExperienceFilterOptions | null>(null);
  const [items, setItems] = useState<ExperienceSummary[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<LoadState>("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const loadedKey = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getExperienceFilterOptions(controller.signal).then(setOptions).catch(() => setOptions(null));
    return () => controller.abort();
  }, []);

  const replaceUrl = useCallback(
    (next: ExperienceFilters, nextPage = 1) => {
      const qs = serializeFilters(next, nextPage);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const setFilters = useCallback((next: ExperienceFilters) => replaceUrl(next, 1), [replaceUrl]);

  // Restoring `?page=N` loads pages 1..N so Load more keeps working from where the user left off.
  useEffect(() => {
    if (loadedKey.current === `${filterKey}#${reloadToken}`) return;
    loadedKey.current = `${filterKey}#${reloadToken}`;
    const controller = new AbortController();
    const targetPage = urlPage;
    setState("loading");
    setLoadMoreFailed(false);
    (async () => {
      try {
        const collected: ExperienceSummary[] = [];
        let last = null as Awaited<ReturnType<typeof listExperiences>> | null;
        for (let p = 1; p <= targetPage; p += 1) {
          last = await listExperiences(toListQuery(filters, p), controller.signal);
          collected.push(...last.items);
          if (!last.has_next) break;
        }
        if (controller.signal.aborted || !last) return;
        setItems(collected);
        setTotal(last.total ?? collected.length);
        setHasNext(!!last.has_next);
        setPage(last.page ?? targetPage);
        setState("ready");
        track("experience_list_view", { filters: serializeFilters(filters), results: last.total ?? collected.length, city: filters.city || undefined, category: filters.category || undefined });
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    })();
    return () => controller.abort();
  }, [filterKey, reloadToken]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      const res = await listExperiences(toListQuery(filters, nextPage));
      setItems((prev) => [...prev, ...res.items]);
      setHasNext(!!res.has_next);
      setPage(nextPage);
      loadedKey.current = `${filterKey}#${reloadToken}`;
      replaceUrl(filters, nextPage);
    } catch {
      setLoadMoreFailed(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const resultCurrency = useMemo(() => {
    const codes = Array.from(new Set(items.map((i) => i.currency).filter((c): c is string => !!c)));
    return codes.length === 1 ? codes[0] : null;
  }, [items]);
  const formatPrice = useCallback(
    (n: number) => (resultCurrency ? formatMoney(n, resultCurrency) : n.toLocaleString()),
    [resultCurrency]
  );

  const chips = activeChips(filters, formatPrice);
  const filterCount = chips.filter((c) => c.key !== "q").length;
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const visible = items.filter((item) => !!item.slug);

  return (
    <>
      <div className="border-b border-sand-200 bg-white">
        <div className="container-site space-y-3 py-5">
          {!!options?.cities.length && (
            <ChipRow label="Cities">
              {options.cities.map((city) => (
                <Pill key={city} active={filters.city === city} onClick={() => setFilters({ ...filters, city: filters.city === city ? "" : city })}>
                  {city}
                </Pill>
              ))}
            </ChipRow>
          )}
          {!!options?.categories.length && (
            <ChipRow label="Categories">
              {options.categories.map((category) => {
                const Icon = CATEGORY_ICONS[category] ?? Sparkles;
                return (
                  <Pill
                    key={category}
                    active={filters.category === category}
                    onClick={() => setFilters({ ...filters, category: filters.category === category ? "" : category })}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {categoryLabel(category)}
                  </Pill>
                );
              })}
            </ChipRow>
          )}
        </div>
      </div>

      <div className="sticky top-14 z-30 border-b border-sand-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="container-site flex gap-2 py-3">
          <Pill active={filterCount > 0} onClick={() => setDrawerOpen(true)}>
            <Filter className="h-4 w-4" aria-hidden />
            Filters{filterCount ? ` (${filterCount})` : ""}
          </Pill>
        </div>
      </div>

      <section id="experience-results" className="container-site scroll-mt-24 py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl bg-white p-5 shadow-card">
              <ExperienceFiltersPanel filters={filters} options={options} onChange={setFilters} formatPrice={formatPrice} />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-h3 text-ink" aria-live="polite">
                {state === "loading" && total == null ? "Loading experiences…" : `${(total ?? 0).toLocaleString()} experiences`}
              </h2>
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => setFilters(chip.clear(filters))}
                      className="focus-ring inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 hover:bg-brand-100"
                      aria-label={`Remove filter ${chip.label}`}
                    >
                      {chip.label}
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ))}
                  <button type="button" onClick={clearAll} className="focus-ring rounded text-sm font-semibold text-brand-700 hover:underline">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {state === "error" ? (
              <ErrorState title="Couldn't load experiences" onRetry={() => setReloadToken((t) => t + 1)} />
            ) : state === "loading" ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <ExperienceCardSkeleton key={i} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <EmptyState
                title="No experiences match these filters"
                hint="Try a different city or remove a filter."
                action={
                  <Button type="button" variant="outline" className="rounded-full" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item, index) => (
                    <li key={item.id}>
                      <ExperienceCard experience={item} position={index + 1} />
                    </li>
                  ))}
                </ul>
                {hasNext && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <p role="status" aria-live="polite" className="text-sm text-ink-soft">
                      {loadMoreFailed ? "Couldn't load more experiences." : ""}
                    </p>
                    <Button type="button" variant="outline" size="lg" className="rounded-full px-8" disabled={loadingMore} onClick={loadMore}>
                      {loadingMore ? "Loading…" : loadMoreFailed ? "Try again" : "Load more"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-xl">Filters</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4">
            <ExperienceFiltersPanel filters={filters} options={options} onChange={setFilters} formatPrice={formatPrice} />
          </div>
          <DrawerFooter className="flex-row gap-3 border-t border-sand-200 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="outline" className="rounded-full" onClick={clearAll}>
              Clear
            </Button>
            <Button type="button" className="flex-1 rounded-full bg-brand-700 text-white hover:bg-brand-800" onClick={() => setDrawerOpen(false)}>
              {state === "loading" ? "Updating…" : `Show ${(total ?? 0).toLocaleString()} experiences`}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      {children}
    </div>
  );
}
