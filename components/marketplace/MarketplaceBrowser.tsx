'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  MapPin,
  Sparkles, Lock,
  Search,
  Smartphone,
} from '@/components/icons';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { ExploreWhyGamana } from '@/components/marketplace/ExploreTrustPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CityNotCovered } from '@/components/marketplace/CityNotCovered';
import { cn } from '@/lib/utils';
import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
import { UnlockFlow } from '@/components/unlock/UnlockFlow';
import { TourGridSkeleton } from '@/components/ui/list-skeletons';
import {
  clearMarketplaceCache,
  fetchPublicTours,
  getExploreSearchQuery,
  getTourHref,
  isWalkCatalogVisible,
  mergeTours,
  searchLiveCatalog,
  tourMatchesSearch,
} from '@/lib/marketplace-api';
import {
  countSearchResults,
  getExploreCatalogPath,
  getExploreTabFromPathname,
  tourSearchScore,
} from '@/lib/explore-search';
import { useAuth } from '@/lib/auth/auth-context';
import { useJourney } from '@/lib/journey-context';
import {
  getCatalogAccessBadgeClass,
  getCatalogAccessBadgeText,
  isCatalogFree,
  tourCategoryToInterests,
  type Tour,
} from '@/lib/marketplace-data';
import { interestCategoryOptions } from '@/lib/personalization';

type AccessFilter = 'all' | 'free' | 'premium';

function matchesAccessFilter(tour: Tour, filter: AccessFilter): boolean {
  // Same rule as Audio Walk badges: price === 0 → Free, price > 0 → Premium.
  if (filter === 'all') return true;
  if (filter === 'free') return tour.price === 0;
  return tour.price > 0;
}

const TOURS_INITIAL_VISIBLE = 12;

const ACCESS_FILTERS: { value: AccessFilter; label: string }[] = [
  { value: 'all', label: 'All tiers' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
];

/**
 * The Audio Stories / Audio Walks browsing surface for /marketplace.
 *
 * Premium stories and walks are unlocked with coins here (UnlockFlow) and listened
 * to in the app.
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

  const [internalSearchQuery, setInternalSearchQuery] = useState(searchFromUrl);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const { status, balance } = useAuth();
  const signedIn = status === 'authenticated';
  const { journey } = useJourney();

  const clearSearchFilter = () => {
    setSearchQuery('');
    router.replace(pathname);
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
    if (!term) return recommendedTours;
    return recommendedTours.filter((tour) => tourMatchesSearch(tour, term));
  }, [recommendedTours, searchFromUrl]);

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

  const catalogHref = (tab: 'stories' | 'walks' | 'recommended') => {
    const qs = urlSearchParams.toString();
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
  }, [searchFromUrl, toursLoading, liveSearching, storySearchCount, walkSearchCount, pathname, router]);

  useEffect(() => {
    setVisibleTourCount(TOURS_INITIAL_VISIBLE);
  }, [searchQuery, accessFilter, searchFromUrl, activeTab]);

  const showAccessFilter = activeTab === 'walks' || activeTab === 'stories';

  const buildFilteredTours = (kind: 'story' | 'walk') =>
    tours
      .filter((tour) => (tour.contentKind ?? 'walk') === kind)
      .filter((tour) => isWalkCatalogVisible(tour))
      .filter((tour) => tourMatchesSearch(tour, searchQuery) && matchesAccessFilter(tour, accessFilter))
      .sort(
        (a, b) =>
          (active ? Number(tourMatches(b)) - Number(tourMatches(a)) : 0) ||
          (searchQuery ? tourSearchScore(b, searchQuery) - tourSearchScore(a, searchQuery) : 0),
      );

  /*
    Coverage detection for the empty states below.
    An empty grid has three very different causes, and telling a traveller "we don't
    cover your city" when we actually do would be a straightforward accuracy failure —
    so each cause gets its own message:
      1. The access filter zeroed an otherwise-populated result set.
      2. This tab has nothing for the city, but the other tab does.
      3. Neither tab has anything, the only case that is genuinely "not covered yet",
         and the only one that shows the demand-capture card.
    These counts deliberately ignore the access filters so cause 1 can't be
    mistaken for cause 3.
  */
  const tourSearchTerm = searchQuery.trim();

  const toursForSearch = (kind: 'story' | 'walk') =>
    tourSearchTerm
      ? tours.filter(
          (t) =>
            (t.contentKind ?? 'walk') === kind &&
            isWalkCatalogVisible(t) &&
            tourMatchesSearch(t, tourSearchTerm),
        ).length
      : 0;

  const renderCatalogTab = (kind: 'story' | 'walk', labelPlural: string) => {
    const filteredTours = buildFilteredTours(kind);
    const visibleTours = filteredTours.slice(0, visibleTourCount);
    const hasMoreTours = filteredTours.length > visibleTourCount;
    const catalogCount = tours.filter(
      (t) => (t.contentKind ?? 'walk') === kind && isWalkCatalogVisible(t),
    ).length;

    return (
      <TabsContent value={kind === 'story' ? 'stories' : 'walks'} className="mt-0 space-y-6">
        {toursLoading || (liveSearching && filteredTours.length === 0) ? (
          <TourGridSkeleton count={TOURS_INITIAL_VISIBLE} />
        ) : filteredTours.length > 0 ? (
          <>
            <p className="text-sm text-ink-muted" aria-live="polite">
              {filteredTours.length} {filteredTours.length === 1 ? labelPlural.replace(/s$/, '').toLowerCase() : labelPlural.toLowerCase()}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleTours.map((tour, index) =>
                tourCard(tour, index, active && tourMatches(tour), kind),
              )}
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
        ) : tourSearchTerm && toursForSearch(kind) === 0 ? (
          <CityNotCovered city={tourSearchTerm} source={kind === 'story' ? 'audio-stories' : 'audio-walks'} />
        ) : catalogCount === 0 ? (
          <p className="py-12 text-center text-gray-500">No {labelPlural.toLowerCase()} available yet.</p>
        ) : (
          <p className="py-12 text-center text-gray-500">
            No {labelPlural.toLowerCase()} match this filter
            {tourSearchTerm ? ` for ${tourSearchTerm}` : ''}.
          </p>
        )}
      </TabsContent>
    );
  };

  const catalogActionButton = (tour: Tour, catalogKind: 'story' | 'walk' = 'story') => {
    if (isCatalogFree(tour)) {
      return (
        <Button asChild variant="outline" size="sm" className="rounded-full px-4">
          <Link href={getTourHref(tour)} aria-label={`View ${tour.title}`}>View</Link>
        </Button>
      );
    }

    return (
      <UnlockFlow
        item={{
          kind: catalogKind === 'walk' ? 'storylist' : 'place',
          id: tour.id,
          title: tour.title,
          price: tour.price,
          image: tour.image,
          city: tour.location,
          narrator: tour.narrator,
        }}
        source={catalogKind === 'walk' ? 'explore-walk-unlock' : 'explore-story-unlock'}
      >
        {({ state, start }) =>
          state === 'unlocked' ? (
            <Button size="sm" variant="outline" onClick={start} className="min-h-11 rounded-full px-4">
              <Smartphone className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Open in app
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={start}
              aria-label={`Unlock ${tour.title} for ${tour.price} coins`}
              className="min-h-11 rounded-full bg-ink px-4 text-white hover:bg-black"
            >
              <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Unlock
            </Button>
          )
        }
      </UnlockFlow>
    );
  };

  const tourCard = (
    tour: Tour,
    index: number,
    recommended = false,
    catalogKind: 'story' | 'walk' = 'story',
  ) => (
    <article
      key={tour.id}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <Link href={getTourHref(tour)} className="focus-ring flex flex-1 flex-col rounded-t-3xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
          {catalogKind === 'walk' && isPlaceholderTourImage(tour.image) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700/15 via-brand-500/10 to-sand-100" />
          ) : (
            <MarketplaceCoverImage
              src={tour.image}
              alt={tour.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105 motion-reduce:transition-none"
              priority={index < 3}
              useDefaultFallback={catalogKind !== 'walk'}
            />
          )}
          <span
            className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${getCatalogAccessBadgeClass(tour)}`}
          >
            {tour.price > 0 && <GamanaCoinIcon className="h-3 w-3" aria-hidden />}
            {getCatalogAccessBadgeText(tour)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pb-3">
          {recommended && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-700">Recommended for you</p>
          )}
          {!recommended && tour.discount && (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-700">Special offer</p>
          )}
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{tour.location}</span>
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold leading-snug text-ink">{tour.title}</h3>
          <p className="mt-1.5 text-sm text-ink-muted">
            {tour.duration}
            {' · '}
            {catalogKind === 'walk' ? 'Organized by Gamana' : `Narrated by ${tour.narrator}`}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-ink/5 px-5 py-3.5">
        {tour.price === 0 ? (
          <p className="text-base font-bold text-emerald-700">Free</p>
        ) : (
          <div className="flex items-center gap-1.5">
            <GamanaCoinIcon className="h-4 w-4" aria-hidden />
            <p className="text-base font-bold text-ink">{tour.price}</p>
            <span className="text-sm text-ink-muted">{tour.price === 1 ? 'coin' : 'coins'}</span>
            {tour.originalPrice && <p className="text-xs text-ink-muted line-through">{tour.originalPrice}</p>}
          </div>
        )}
        {catalogActionButton(tour, catalogKind)}
      </div>
    </article>
  );

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
                      Audio Walks{searchFromUrl ? ` (${walkSearchCount})` : ''}
                    </TabsTrigger>
                  </TabsList>

                  {showAccessFilter && (
                    <div
                      role="group"
                      aria-label="Filter by access tier"
                      className="relative inline-grid h-11 w-fit grid-cols-3 rounded-full border border-ink/10 bg-white p-1 text-sm font-semibold shadow-card"
                    >
                      <span
                        className={cn(
                          'absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-brand-700 shadow-sm transition-transform duration-500 ease-spring motion-reduce:transition-none',
                          accessFilter === 'free' && 'translate-x-full',
                          accessFilter === 'premium' && 'translate-x-[200%]'
                        )}
                        aria-hidden
                      />
                      {ACCESS_FILTERS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={accessFilter === value}
                          onClick={() => setAccessFilter(value)}
                          className={cn(
                            'focus-ring relative z-10 rounded-full px-4 transition-colors duration-300 sm:px-5',
                            accessFilter === value ? 'text-white' : 'text-ink-soft hover:text-ink'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {signedIn && balance !== null && (
                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm font-semibold text-ink">
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
              <p className="text-sm text-gray-500">
                Because you told us you&apos;re into {interestLabels.join(', ')}.
              </p>

              {filteredRecommendedTours.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Picked for you</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredRecommendedTours.map((tour, i) =>
                      tourCard(
                        tour,
                        i,
                        true,
                        (tour.contentKind ?? 'walk') === 'walk' ? 'walk' : 'story',
                      ),
                    )}
                  </div>
                </div>
              ) : searchFromUrl ? (
                <p className="py-12 text-center text-gray-500">
                  No personalized matches for &ldquo;{searchFromUrl}&rdquo;. Try the Audio Stories or Audio Walks tabs.
                </p>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-gray-500">No personalized matches yet, browse the full catalog.</p>
                  <Button variant="outline" onClick={() => selectCatalogTab('stories')}>
                    Browse audio stories
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          {renderCatalogTab('story', 'Audio Stories')}
              {renderCatalogTab('walk', 'Audio Walks')}
            </Tabs>
      </div>

      <ExploreWhyGamana />
    </>
  );
}
