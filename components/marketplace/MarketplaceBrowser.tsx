'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Sparkles, Search } from '@/components/icons';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { ExploreWhyGamana } from '@/components/marketplace/ExploreTrustPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CityNotCovered } from '@/components/marketplace/CityNotCovered';
import { CatalogCard, catalogKindOf } from '@/components/marketplace/CatalogCard';
import {
  CatalogFilterSheet,
  FALLBACK_TOUR_OPTIONS,
  useTourFilterOptions,
  type TourFilterOptions,
} from '@/components/marketplace/CatalogFilterSheet';
import { CitySelect } from '@/components/site/CitySelect';
import { TourGridSkeleton } from '@/components/ui/list-skeletons';
import {
  fetchCityCatalog,
  fetchPublicTours,
  getExploreCityId,
  getExploreSearchQuery,
  isWalkCatalogVisible,
  mergeTours,
  searchLiveCatalog,
  tourMatchesCity,
  tourMatchesSearch,
} from '@/lib/marketplace-api';
import {
  applyStoryFilters,
  applyTourFilters,
  buildCategoryOptions,
  clearFilterParams,
  countStoryFilters,
  countTourFilters,
  parseStoryFilters,
  parseTourFilters,
  writeStoryFilters,
  writeTourFilters,
  type StoryFilters,
  type TourFilters,
} from '@/lib/catalog-filters';
import {
  countSearchResults,
  getExploreCatalogPath,
  getExploreTabFromPathname,
  tourSearchScore,
} from '@/lib/explore-search';
import { useAuth } from '@/lib/auth/auth-context';
import { writeLastCity } from '@/lib/home/last-city';
import { useJourney } from '@/lib/journey-context';
import { unlockTargetId, useLibrary } from '@/lib/library/library-context';
import { cityCoordinates, loadActiveCities, type ApiCity } from '@/lib/services/cityService';
import { tourCategoryToInterests, type Tour } from '@/lib/marketplace-data';
import { interestCategoryOptions } from '@/lib/personalization';

const TOURS_INITIAL_VISIBLE = 12;

function otherCountLabel(count: number, kind: 'story' | 'walk'): string {
  const noun = kind === 'walk' ? (count === 1 ? 'audio tour' : 'audio tours') : count === 1 ? 'audio story' : 'audio stories';
  return `${count === 1 ? 'is' : 'are'} ${count} ${noun}`;
}

/**
 * The Audio Stories / Audio Tours browsing surface for /marketplace.
 *
 * Premium stories and tours are unlocked with coins here (UnlockFlow) and listened
 * to in the app.
 *
 * City and filters mirror the Gamana app: the city list comes from `/locations/cities`,
 * and the filter sheets use the app's option ids (see lib/catalog-filters.ts). Both live in
 * the URL (`?city=<id>&sort=…`) so results are shareable and the back button works.
 *
 * The "Recommended for you" treatment (matching items boosted to the front of each grid,
 * called out with a small label, scored against the traveler's saved interests via
 * lib/personalization.ts / lib/marketplace-data.ts's category mapping) only appears for
 * signed-in visitors who have personalization answers — there's nothing to personalize
 * against otherwise.
 */
export function MarketplaceBrowser({
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  initialTours = [],
}: {
  /** Lets the page's hero search box drive the Tours search. Falls back to internal state if omitted. */
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  /** Server-prefetched catalog — required for Audio Stories (places API has no browser CORS). */
  initialTours?: Tour[];
}) {
  // Search query from URL (`q` or legacy `city`) — read client-side for static export.
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchFromUrl = getExploreSearchQuery(urlSearchParams);
  const cityId = getExploreCityId(urlSearchParams);

  const [internalSearchQuery, setInternalSearchQuery] = useState(searchFromUrl);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;
  const { status, balance } = useAuth();
  const signedIn = status === 'authenticated';
  const { journey } = useJourney();
  const { places: unlockedPlaces, tours: unlockedStorylists } = useLibrary();

  const replaceParams = (next: URLSearchParams) => {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearSearchFilter = () => {
    setSearchQuery('');
    const next = new URLSearchParams(urlSearchParams.toString());
    next.delete('q');
    if (!getExploreCityId(next)) next.delete('city');
    replaceParams(next);
  };

  // MarketplaceHeroSearch commits via `?q=`; keep internal query in sync.
  useEffect(() => {
    setInternalSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  const [tours, setTours] = useState<Tour[]>(initialTours);
  const [toursLoading, setToursLoading] = useState(initialTours.length === 0);
  const [visibleTourCount, setVisibleTourCount] = useState(TOURS_INITIAL_VISIBLE);

  const loadTours = async () => {
    setToursLoading(true);
    try {
      const nextTours = await fetchPublicTours();
      setTours(nextTours);
    } catch (error) {
      console.error('Failed to load explore catalog', error);
      setTours([]);
    } finally {
      setToursLoading(false);
    }
  };

  useEffect(() => {
    if (initialTours.length > 0) return;
    void loadTours();
  }, [initialTours.length]);

  // Pre-rendered catalogs carry image SAS URLs signed at build time, which expire after 24h.
  // Only cover URLs are swapped so the build-time list, order and filters stay as they are.
  useEffect(() => {
    if (initialTours.length === 0) return;
    let cancelled = false;
    fetchPublicTours()
      .then((fresh) => {
        if (cancelled) return;
        const images = new Map(fresh.map((tour) => [tour.id, tour.image]));
        setTours((current) =>
          current.map((tour) => {
            const image = images.get(tour.id);
            return image && image !== tour.image ? { ...tour, image } : tour;
          }),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [initialTours.length]);

  // Pull database matches newer than the build-time catalog into the grid for `?q=`.
  // Derived rather than set in the effect so the tab auto-switch below sees "pending" on the first render.
  const [liveSettledFor, setLiveSettledFor] = useState('');
  const liveTerm = searchFromUrl.trim();
  const liveSearching = liveTerm !== '' && liveSettledFor !== liveTerm;
  useEffect(() => {
    if (!liveTerm) return;
    const controller = new AbortController();
    searchLiveCatalog(liveTerm, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return;
        setTours((current) => mergeTours(current, found));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setLiveSettledFor(liveTerm);
      });
    return () => controller.abort();
  }, [liveTerm]);

  // --- City (from /locations/cities, the app's list) ---
  const [city, setCity] = useState<ApiCity | null>(null);
  useEffect(() => {
    if (!cityId) {
      setCity(null);
      return;
    }
    if (city?.id === cityId) return;
    let cancelled = false;
    loadActiveCities()
      .then((list) => !cancelled && setCity(list.find((c) => String(c.id) === cityId) ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  // The prefetched catalog only covers India's stories; fetch the selected city live from the database.
  const [citySettledFor, setCitySettledFor] = useState('');
  const cityLoading = Boolean(city) && citySettledFor !== city?.id;
  useEffect(() => {
    if (!city) return;
    const controller = new AbortController();
    fetchCityCatalog(city.name, controller.signal)
      .then((found) => {
        if (!controller.signal.aborted) setTours((current) => mergeTours(current, found));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setCitySettledFor(city.id);
      });
    return () => controller.abort();
  }, [city]);

  const selectCity = (next: ApiCity | null) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (next) {
      setCity(next);
      writeLastCity(next.name, next.id);
      params.set('city', String(next.id));
    } else {
      params.delete('city');
      params.delete('radius');
    }
    replaceParams(params);
  };

  const origin = city ? cityCoordinates(city) : null;
  const inSelectedCity = (tour: Tour) => !city || tourMatchesCity(tour, city.name);

  // --- Filters (URL state) ---
  const storyFilters = parseStoryFilters(urlSearchParams);
  const tourFilters = parseTourFilters(urlSearchParams);
  const unlockedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const u of [...(unlockedPlaces ?? []), ...(unlockedStorylists ?? [])]) ids.add(unlockTargetId(u));
    return ids;
  }, [unlockedPlaces, unlockedStorylists]);

  const applyStory = (next: StoryFilters) => replaceParams(writeStoryFilters(urlSearchParams, next));
  const applyTour = (next: TourFilters) => replaceParams(writeTourFilters(urlSearchParams, next));

  const apiTourOptions = useTourFilterOptions(signedIn);
  const tourOptions: TourFilterOptions = useMemo(() => {
    const catalogCategories = buildCategoryOptions(
      tours.filter((t) => catalogKindOf(t) === 'walk' && isWalkCatalogVisible(t)),
    );
    return {
      categories: apiTourOptions?.categories?.length ? apiTourOptions.categories : catalogCategories,
      duration: apiTourOptions?.duration?.length ? apiTourOptions.duration : FALLBACK_TOUR_OPTIONS.duration,
      price: apiTourOptions?.price?.length ? apiTourOptions.price : FALLBACK_TOUR_OPTIONS.price,
      stops: apiTourOptions?.stops?.length ? apiTourOptions.stops : FALLBACK_TOUR_OPTIONS.stops,
      sort: apiTourOptions?.sort?.length ? apiTourOptions.sort : FALLBACK_TOUR_OPTIONS.sort,
    };
  }, [tours, apiTourOptions]);

  // --- Personalization: score the same catalog against the traveler's saved interests ---
  const interestIds = useMemo(
    () => Array.from(new Set(journey?.travelerProfiles?.flatMap((p) => p.interests) ?? [])),
    [journey]
  );
  const interestLabels = interestIds
    .map((id) => interestCategoryOptions.find((c) => c.id === id)?.label)
    .filter((l): l is string => Boolean(l));
  const active = signedIn && interestIds.length > 0;

  const tourMatches = (t: Tour) => (tourCategoryToInterests[t.category] || []).some((id) => interestIds.includes(id));

  const recommendedTours = active ? tours.filter(tourMatches) : [];
  const hasRecommendations = active && recommendedTours.length > 0;

  const filteredRecommendedTours = useMemo(() => {
    const term = searchFromUrl.trim();
    return recommendedTours.filter(
      (tour) => isWalkCatalogVisible(tour) && inSelectedCity(tour) && (!term || tourMatchesSearch(tour, term)),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedTours, searchFromUrl, city]);

  const storySearchCount = useMemo(
    () => (searchFromUrl ? countSearchResults(tours, searchFromUrl, 'story') : 0),
    [tours, searchFromUrl],
  );
  const walkSearchCount = useMemo(
    () => (searchFromUrl ? countSearchResults(tours, searchFromUrl, 'walk') : 0),
    [tours, searchFromUrl],
  );

  const [activeTab, setActiveTab] = useState(
    () => getExploreTabFromPathname(pathname) ?? 'stories',
  );
  const prevSearchRef = useRef('');

  // Filter ids differ per tab, so switching tabs starts from clean filters but keeps city and search.
  const catalogHref = (tab: 'stories' | 'walks' | 'recommended') => {
    const qs = clearFilterParams(urlSearchParams).toString();
    const path = getExploreCatalogPath(tab);
    return qs ? `${path}?${qs}` : path;
  };

  const selectCatalogTab = (tab: string) => {
    if (tab === 'walks' || tab === 'stories' || tab === 'recommended') {
      router.push(catalogHref(tab));
    }
  };

  useEffect(() => {
    const fromPath = getExploreTabFromPathname(pathname);
    if (fromPath) {
      setActiveTab(fromPath);
      return;
    }
    if (pathname === '/marketplace' || pathname === '/marketplace/') {
      setActiveTab(hasRecommendations ? 'recommended' : 'stories');
    }
  }, [pathname, hasRecommendations]);

  // When search changes, open the tab with more matching results (stories wins ties).
  useEffect(() => {
    if (!searchFromUrl.trim()) {
      prevSearchRef.current = searchFromUrl;
      return;
    }
    if (toursLoading || liveSearching) return;
    if (prevSearchRef.current === searchFromUrl) return;
    prevSearchRef.current = searchFromUrl;

    const preferredTab = walkSearchCount > storySearchCount ? 'walks' : 'stories';
    const currentTab = getExploreTabFromPathname(pathname);
    if (currentTab !== preferredTab) {
      router.push(catalogHref(preferredTab));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFromUrl, toursLoading, liveSearching, storySearchCount, walkSearchCount, pathname, router]);

  const filterKey = urlSearchParams.toString();
  useEffect(() => {
    setVisibleTourCount(TOURS_INITIAL_VISIBLE);
  }, [searchQuery, filterKey, activeTab]);

  const tourSearchTerm = searchQuery.trim();

  const baseForKind = (kind: 'story' | 'walk') =>
    tours.filter(
      (tour) =>
        catalogKindOf(tour) === kind &&
        isWalkCatalogVisible(tour) &&
        tourMatchesSearch(tour, searchQuery),
    );

  const buildFilteredTours = (kind: 'story' | 'walk') => {
    // A story radius around the city's coordinates replaces the city-name match, like the app's nearby list.
    const byRadius = kind === 'story' && Boolean(origin) && storyFilters.radius !== 'all';
    const base = baseForKind(kind)
      .filter((tour) => byRadius || inSelectedCity(tour))
      .sort(
        (a, b) =>
          (active ? Number(tourMatches(b)) - Number(tourMatches(a)) : 0) ||
          (searchQuery ? tourSearchScore(b, searchQuery) - tourSearchScore(a, searchQuery) : 0),
      );
    return kind === 'story'
      ? applyStoryFilters(base, storyFilters, { origin, unlockedIds })
      : applyTourFilters(base, tourFilters, { unlockedIds });
  };

  /*
    Coverage detection for the empty states below.
    An empty grid has three very different causes, and telling a traveller "we don't
    cover your city" when we actually do would be a straightforward accuracy failure —
    so each cause gets its own message:
      1. The filters zeroed an otherwise-populated result set.
      2. This tab has nothing for the city, but the other tab does.
      3. Neither tab has anything, the only case that is genuinely "not covered yet",
         and the only one that shows the demand-capture card.
    These counts deliberately ignore the filters so cause 1 can't be mistaken for cause 3.
  */
  const unfilteredCount = (kind: 'story' | 'walk') => baseForKind(kind).filter(inSelectedCity).length;

  const renderCatalogTab = (kind: 'story' | 'walk', labelPlural: string) => {
    const filteredTours = buildFilteredTours(kind);
    const visibleTours = filteredTours.slice(0, visibleTourCount);
    const hasMoreTours = filteredTours.length > visibleTourCount;
    const catalogCount = tours.filter((t) => catalogKindOf(t) === kind && isWalkCatalogVisible(t)).length;
    const otherKind = kind === 'story' ? 'walk' : 'story';
    const scopeLabel = city?.name ?? tourSearchTerm;
    const loading = toursLoading || ((liveSearching || cityLoading) && filteredTours.length === 0);

    return (
      <TabsContent value={kind === 'story' ? 'stories' : 'walks'} className="mt-0 space-y-6">
        {loading ? (
          <TourGridSkeleton count={TOURS_INITIAL_VISIBLE} />
        ) : filteredTours.length > 0 ? (
          <>
            <p className="text-sm text-ink-muted" aria-live="polite">
              {filteredTours.length} {filteredTours.length === 1 ? labelPlural.replace(/s$/, '').toLowerCase() : labelPlural.toLowerCase()}
              {city ? ` in ${city.name}` : ''}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleTours.map((tour, index) => (
                <CatalogCard key={tour.id} tour={tour} kind={kind} index={index} recommended={active && tourMatches(tour)} />
              ))}
            </div>
            {hasMoreTours && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleTourCount((count) => count + TOURS_INITIAL_VISIBLE)}
                  className="min-w-40 rounded-full"
                >
                  View more
                </Button>
              </div>
            )}
          </>
        ) : scopeLabel && unfilteredCount(kind) === 0 && unfilteredCount(otherKind) === 0 ? (
          <CityNotCovered city={scopeLabel} source={kind === 'story' ? 'audio-stories' : 'audio-walks'} />
        ) : scopeLabel && unfilteredCount(kind) === 0 ? (
          <div className="space-y-4 py-12 text-center" aria-live="polite">
            <p className="text-ink-soft">
              No {labelPlural.toLowerCase()} in {scopeLabel} yet, but there{' '}
              {otherCountLabel(unfilteredCount(otherKind), otherKind)}.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => selectCatalogTab(kind === 'story' ? 'walks' : 'stories')}>
              Browse {kind === 'story' ? 'audio tours' : 'audio stories'}
            </Button>
          </div>
        ) : catalogCount === 0 ? (
          <p className="py-12 text-center text-ink-muted">No {labelPlural.toLowerCase()} available yet.</p>
        ) : (
          <div className="space-y-4 py-12 text-center" aria-live="polite">
            <p className="text-ink-muted">
              No {labelPlural.toLowerCase()} match these filters
              {scopeLabel ? ` in ${scopeLabel}` : ''}.
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => replaceParams(clearFilterParams(urlSearchParams))}
            >
              Clear filters
            </Button>
          </div>
        )}
      </TabsContent>
    );
  };

  return (
    <>
      <div className="container-site pb-4 pt-8 sm:pt-10">
            <Tabs value={activeTab} onValueChange={selectCatalogTab} className="w-full">
              <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-ink/5 bg-sand-50/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-16 lg:mx-0 lg:px-0">
                <div className="flex flex-wrap items-center gap-3">
                  <TabsList className="h-11 rounded-full bg-white p-1 shadow-card">
                    {hasRecommendations && (
                      <TabsTrigger
                        value="recommended"
                        className="h-9 gap-1.5 rounded-full px-4 font-semibold text-brand-700 data-[state=active]:bg-brand-600 data-[state=active]:text-white"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden /> For You
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="stories" className="h-9 rounded-full px-4 data-[state=active]:bg-ink data-[state=active]:text-white">
                      Audio Stories{searchFromUrl ? ` (${storySearchCount})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="walks" className="h-9 rounded-full px-4 data-[state=active]:bg-ink data-[state=active]:text-white">
                      Audio Tours{searchFromUrl ? ` (${walkSearchCount})` : ''}
                    </TabsTrigger>
                  </TabsList>

                  <CitySelect value={city} onChange={selectCity} clearable className="w-56 max-w-full" />

                  {activeTab === 'stories' && (
                    <CatalogFilterSheet
                      kind="story"
                      value={storyFilters}
                      onApply={applyStory}
                      activeCount={countStoryFilters(storyFilters)}
                      signedIn={signedIn}
                      hasCity={Boolean(origin)}
                    />
                  )}
                  {activeTab === 'walks' && (
                    <CatalogFilterSheet
                      kind="walk"
                      value={tourFilters}
                      onApply={applyTour}
                      options={tourOptions}
                      activeCount={countTourFilters(tourFilters)}
                      signedIn={signedIn}
                      hasCity={Boolean(origin)}
                    />
                  )}

                  {signedIn && balance !== null && (
                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm font-semibold text-ink lg:ml-auto">
                      <GamanaCoinIcon className="h-4 w-4" aria-hidden />
                      {balance.toLocaleString()} coins
                      <Link
                        href="/pricing/"
                        className="focus-ring ml-1 rounded font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                      >
                        Get coins
                      </Link>
                    </div>
                  )}
                </div>

              </div>

              {searchFromUrl && (
                <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-brand-500/30 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800">
                  <Search className="h-4 w-4" aria-hidden />
                  Results for {searchFromUrl}
                  <button
                    type="button"
                    onClick={clearSearchFilter}
                    aria-label="Clear search"
                    className="focus-ring ml-1 rounded-full text-brand-700 hover:text-brand-900"
                  >
                    ✕
                  </button>
                </div>
              )}

          {hasRecommendations && (
            <TabsContent value="recommended" className="space-y-8">
              <p className="text-sm text-ink-muted">
                Because you told us you&apos;re into {interestLabels.join(', ')}.
              </p>

              {filteredRecommendedTours.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-ink">Picked for you{city ? ` in ${city.name}` : ''}</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredRecommendedTours.map((tour, i) => (
                      <CatalogCard key={tour.id} tour={tour} index={i} recommended />
                    ))}
                  </div>
                </div>
              ) : searchFromUrl || city ? (
                <p className="py-12 text-center text-ink-muted">
                  No personalized matches for &ldquo;{searchFromUrl || city?.name}&rdquo;. Try the Audio Stories or Audio Tours tabs.
                </p>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-ink-muted">No personalized matches yet, browse the full catalog.</p>
                  <Button variant="outline" onClick={() => selectCatalogTab('stories')}>
                    Browse audio stories
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {renderCatalogTab('story', 'Audio Stories')}
              {renderCatalogTab('walk', 'Audio Tours')}
            </Tabs>
      </div>

      <ExploreWhyGamana />
    </>
  );
}
