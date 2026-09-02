'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  MapPin, Heart,
  Check as CheckIcon, Sparkles, Lock, AlertCircle, LogIn,
  Smartphone, Search,
} from 'lucide-react';
import { GamanaCoinIcon } from '@/components/GamanaCoinIcon';
import { ExploreTrustPanel, ExploreMobileAppNotice } from '@/components/marketplace/ExploreTrustPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cart } from '@/components/cart/Cart';
import { CityNotCovered } from '@/components/marketplace/CityNotCovered';
import { MarketplaceCoverImage, isPlaceholderTourImage } from '@/components/marketplace/marketplace-cover-image';
import { TourGridSkeleton } from '@/components/ui/list-skeletons';
import {
  clearMarketplaceCache,
  fetchPublicTours,
  getExploreSearchQuery,
  getTourHref,
  isWalkCatalogVisible,
  tourMatchesSearch,
} from '@/lib/marketplace-api';
import { countSearchResults } from '@/lib/explore-search';
import { useCart } from '@/lib/cart-context';
import { useAccount } from '@/lib/account-context';
import {
  coinBundles,
  getCatalogAccessBadgeClass,
  getCatalogAccessBadgeText,
  isCatalogFree,
  tourCategoryToInterests,
  type Tour, type CoinBundle,
} from '@/lib/marketplace-data';
import { interestCategoryOptions } from '@/lib/personalization';

type UnlockTarget = { id: string; type: 'tour' | 'combo'; title: string; priceCoins: number };
type AccessFilter = 'all' | 'free' | 'premium';

function matchesAccessFilter(tour: Tour, filter: AccessFilter): boolean {
  // Same rule as Audio Walk badges: price === 0 → Free, price > 0 → Premium.
  if (filter === 'all') return true;
  if (filter === 'free') return tour.price === 0;
  return tour.price > 0;
}

const TOURS_INITIAL_VISIBLE = 9;

/**
 * The full Tours / Combos / Experiences / Buy Coins / Special Offers browsing surface,
 * shared by both the signed-out /marketplace page and the signed-in, personalized
 * /marketplace-redesign page — same catalog, same cart, same checkout either way.
 *
 * Two separate purchase rails, deliberately:
 *  - Tours, Topics, and Combos are digital content, priced in Gamana Coins, and unlock
 *    directly against the traveler's Coin balance with one click — no cart, no checkout
 *    screen. See lib/account-context.tsx's unlockItem.
 *  - Experiences (real-world, third-party-operator bookings) and Coin bundles (the only
 *    real-money-to-Coins on-ramp) both go through the single real-money Cart
 *    (components/cart/Cart.tsx), paid via Card/RazorPay. This is why Coin-bundle and
 *    Experience actions share the same orange/amber color language, distinct from the
 *    teal "unlock with Coins" actions.
 *
 * The "Recommended for you" treatment (matching items boosted to the front of each grid,
 * called out with a small label, scored against the traveler's saved interests via
 * lib/personalization.ts / lib/marketplace-data.ts's category mapping) is driven purely
 * by live login state (useAccount() below), not by which of the two pages rendered this
 * component — so it appears the moment you log in and disappears the moment you log out,
 * regardless of whether you're on /marketplace or /marketplace-redesign. Signed-out
 * visitors never see it — there's nothing to personalize against yet.
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
  const { account, journey, login, coinBalance, unlockItem, isUnlocked } = useAccount();

  const clearSearchFilter = () => {
    setSearchQuery('');
    router.replace(pathname);
  };

  // MarketplaceHeroSearch commits via `?q=`; keep internal query in sync.
  useEffect(() => {
    setInternalSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  // --- Unlock flow: Tours/Combos spend Coins directly, no cart ---
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  // Drives the "added to your Gamana app" toast — separate from justUnlocked's brief
  // button-flash so the cue can stay visible a little longer without blocking re-unlocks.
  const [appSyncToast, setAppSyncToast] = useState<string | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<UnlockTarget | null>(null);
  const [insufficientOpen, setInsufficientOpen] = useState(false);
  /** Item awaiting "spend these Coins?" confirmation — see attemptUnlock below. */
  const [confirmUnlock, setConfirmUnlock] = useState<UnlockTarget | null>(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireLogin = (action: () => void) => {
    if (!account) {
      setPendingAction(() => action);
      setLoginPromptOpen(true);
      return;
    }
    action();
  };

  const completeLogin = (email: string, method: 'google' | 'apple' | 'email') => {
    login(email, method);
    setLoginPromptOpen(false);
    setLoginEmail('');
    const action = pendingAction;
    setPendingAction(null);
    if (action) action();
  };

  /*
    Unlocking spends Coins irreversibly against the traveller's balance with no undo and
    no cart step to pause at, so it gets an explicit confirmation, the one-click version
    made it far too easy to burn Coins on a mis-tap. The insufficient-balance check runs
    before the prompt so someone who can't afford it is sent straight to the bundle
    picker instead of being asked to confirm something that would fail.
  */
  const attemptUnlock = (item: UnlockTarget) => {
    if (isUnlocked(item.id, item.type)) return;
    requireLogin(() => {
      if (coinBalance < item.priceCoins) {
        setPendingUnlock(item);
        setInsufficientOpen(true);
        return;
      }
      setConfirmUnlock(item);
    });
  };

  const performUnlock = (item: UnlockTarget) => {
    setConfirmUnlock(null);
    const success = unlockItem(item);
    if (success) {
      const key = `${item.type}-${item.id}`;
      setJustUnlocked(key);
      setTimeout(() => setJustUnlocked((current) => (current === key ? null : current)), 1500);
      setAppSyncToast(item.title);
      setTimeout(() => setAppSyncToast((current) => (current === item.title ? null : current)), 4000);
      setPendingUnlock(null);
    } else {
      // Balance changed between opening the prompt and confirming — fall back rather
      // than silently doing nothing.
      setPendingUnlock(item);
      setInsufficientOpen(true);
    }
  };

  // --- Real-money cart: Coin bundles ---
  const { addItem, items: cartItems } = useCart();
  const [justAddedBundle, setJustAddedBundle] = useState<string | null>(null);
  // "Buy Coins" used to be its own tab, duplicating the "Buy more" chip next to the
  // balance — collapsed into one cue: "Buy more" now opens this bundle-picker dialog
  // directly instead of switching tabs.
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);

  const isBundleInCart = (id: string) => cartItems.some((i) => i.id === id && i.kind === 'coins');

  const handleAddBundle = (bundle: CoinBundle) => {
    const totalCoins = bundle.baseCoins + bundle.bonusCoins;
    addItem({
      id: bundle.id,
      kind: 'coins',
      title: `${bundle.name}, ${totalCoins.toLocaleString()} Coins`,
      image: '/gamana-logo.png',
      price: bundle.price,
      coinsGranted: totalCoins,
    });
    setJustAddedBundle(bundle.id);
    setTimeout(() => setJustAddedBundle((current) => (current === bundle.id ? null : current)), 1500);
  };

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

  // --- Personalization: score the same catalog against the traveler's saved interests ---
  const interestIds = useMemo(
    () => Array.from(new Set(journey?.travelerProfiles?.flatMap((p) => p.interests) ?? [])),
    [journey]
  );
  const interestLabels = interestIds
    .map((id) => interestCategoryOptions.find((c) => c.id === id)?.label)
    .filter((l): l is string => Boolean(l));
  const active = !!account && interestIds.length > 0;

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

  const [activeTab, setActiveTab] = useState('stories');
  const prevSearchRef = useRef('');

  // When search changes, open the tab with more matching results (stories wins ties).
  useEffect(() => {
    if (prevSearchRef.current === searchFromUrl) return;
    prevSearchRef.current = searchFromUrl;

    if (!searchFromUrl.trim()) return;
    if (toursLoading) return;

    const preferredTab = walkSearchCount > storySearchCount ? 'walks' : 'stories';
    setActiveTab(preferredTab);
  }, [searchFromUrl, toursLoading, storySearchCount, walkSearchCount]);

  useEffect(() => {
    if (!searchFromUrl && hasRecommendations && (activeTab === 'stories' || activeTab === 'walks') && !toursLoading) {
      setActiveTab('recommended');
    }
  }, [searchFromUrl, hasRecommendations, activeTab, toursLoading]);

  useEffect(() => {
    setVisibleTourCount(TOURS_INITIAL_VISIBLE);
  }, [searchQuery, accessFilter, searchFromUrl, activeTab]);

  const buildFilteredTours = (kind: 'story' | 'walk') =>
    tours
      .filter((tour) => (tour.contentKind ?? 'walk') === kind)
      .filter((tour) => isWalkCatalogVisible(tour))
      .filter((tour) => {
        const matchesSearch = tourMatchesSearch(tour, searchQuery);
        const matchesAccess = matchesAccessFilter(tour, accessFilter);
        return matchesSearch && matchesAccess;
      })
      .sort((a, b) => (active ? Number(tourMatches(b)) - Number(tourMatches(a)) : 0));

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
      <TabsContent value={kind === 'story' ? 'stories' : 'walks'} className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button variant={accessFilter === 'all' ? 'default' : 'outline'} onClick={() => setAccessFilter('all')} size="sm">
            All Tiers
          </Button>
          <Button variant={accessFilter === 'free' ? 'default' : 'outline'} onClick={() => setAccessFilter('free')} size="sm">
            Free
          </Button>
          <Button variant={accessFilter === 'premium' ? 'default' : 'outline'} onClick={() => setAccessFilter('premium')} size="sm">
            Premium
          </Button>
        </div>

        {toursLoading ? (
          <TourGridSkeleton count={TOURS_INITIAL_VISIBLE} />
        ) : filteredTours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTours.map((tour, index) =>
                tourCard(tour, index, active && tourMatches(tour), kind),
              )}
            </div>
            {hasMoreTours && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleTourCount((count) => count + TOURS_INITIAL_VISIBLE)}
                  className="min-w-40"
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

  const catalogActionButton = (tour: Tour) => {
    const target: UnlockTarget = {
      id: tour.id,
      type: 'tour',
      title: tour.title,
      priceCoins: tour.price,
    };
    const unlocked = isUnlocked(tour.id, 'tour');
    const showView = isCatalogFree(tour) || unlocked;

    if (showView) {
      return (
        <Button asChild variant="outline" size="sm">
          <Link href={getTourHref(tour)}>View</Link>
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => attemptUnlock(target)}
        className="bg-gray-900 hover:bg-black text-white"
      >
        <Lock className="mr-1.5 h-3.5 w-3.5" />
        Unlock
      </Button>
    );
  };

  const tourCard = (
    tour: Tour,
    index: number,
    recommended = false,
    catalogKind: 'story' | 'walk' = 'story',
  ) => (
    <Card key={tour.id} className="overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white group">
      <Link href={getTourHref(tour)} className="block">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          {catalogKind === 'walk' && isPlaceholderTourImage(tour.image) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A5F7A]/15 via-[#159895]/10 to-gray-100" />
          ) : (
            <MarketplaceCoverImage
              src={tour.image}
              alt={tour.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={index < 3}
              useDefaultFallback={catalogKind !== 'walk'}
            />
          )}
          <span
            className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${getCatalogAccessBadgeClass(tour)}`}
          >
            {tour.price > 0 && (
              <GamanaCoinIcon className="h-3 w-3" aria-hidden />
            )}
            {getCatalogAccessBadgeText(tour)}
          </span>
          <button
            type="button"
            aria-label="Save"
            onClick={(e) => e.preventDefault()}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-red-500"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>

        <CardHeader className="p-3 pb-0 space-y-1">
          {recommended && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0B6E4F]">Recommended for you</p>
          )}
          {!recommended && tour.discount && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">Special offer</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{tour.title}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {tour.location} · {tour.duration}
          </p>
        </CardHeader>

        <CardContent className="p-3 pt-2 space-y-1.5">
          {catalogKind === 'walk' ? (
            <p className="text-xs text-gray-500">Organized by: Gamana</p>
          ) : (
            <p className="text-xs text-gray-500">Narrated by {tour.narrator}</p>
          )}
        </CardContent>
      </Link>

      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div>
          {tour.price === 0 ? (
            <p className="text-base font-bold text-emerald-700">Free</p>
          ) : (
            <div className="flex items-center gap-1.5">
              <GamanaCoinIcon className="h-3.5 w-3.5" aria-hidden />
              <p className="text-base font-bold text-gray-900">{tour.price}</p>
              {tour.originalPrice && <p className="text-xs text-gray-400 line-through">{tour.originalPrice}</p>}
            </div>
          )}
        </div>
        {catalogActionButton(tour)}
      </CardFooter>
    </Card>
  );

  const coinBundleCard = (bundle: CoinBundle) => {
    const totalCoins = bundle.baseCoins + bundle.bonusCoins;
    const inCart = isBundleInCart(bundle.id);
    return (
      <Card
        key={bundle.id}
        className={`overflow-hidden rounded-xl border ${bundle.popular ? 'border-amber-400 ring-1 ring-amber-400' : 'border-gray-200'} hover:shadow-md transition-shadow duration-200 bg-white`}
      >
        <CardContent className="p-5 space-y-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 h-3.5">
            {bundle.popular ? 'Most Popular' : ''}
          </p>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mx-auto">
            <GamanaCoinIcon className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalCoins.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              Coins{bundle.bonusCoins > 0 ? ` (${bundle.baseCoins} + ${bundle.bonusCoins} bonus)` : ''}
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900">{bundle.name}</p>
          <p className="text-xs text-gray-500">{bundle.blurb}</p>
        </CardContent>
        <CardFooter className="p-5 pt-0">
          <Button
            onClick={() => handleAddBundle(bundle)}
            className={
              justAddedBundle === bundle.id || inCart
                ? 'w-full bg-green-600 hover:bg-green-700 text-white'
                : 'w-full bg-amber-500 hover:bg-amber-600 text-white'
            }
          >
            {justAddedBundle === bundle.id || inCart ? (
              <><CheckIcon className="mr-1.5 h-3.5 w-3.5" /> In cart</>
            ) : (
              `$${bundle.price}`
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <Cart />

      <div className="relative z-10 -mt-10 sm:-mt-12 max-w-7xl mx-auto px-4 pb-10">
        {searchFromUrl && (
          <div className="mb-4 flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#159895]/30 bg-[#F0FBFA] px-4 py-2 text-sm font-semibold text-[#0B6E4F]">
            <Search className="h-4 w-4" />
            Results for {searchFromUrl}
            <button
              type="button"
              onClick={clearSearchFilter}
              aria-label="Clear search"
              className="ml-1 text-[#159895] hover:text-[#128a86]"
            >
              ✕
            </button>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start lg:gap-6">
          <div className="min-w-0">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-5">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <TabsList className={`grid ${hasRecommendations ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {hasRecommendations && (
                      <TabsTrigger
                        value="recommended"
                        className="gap-1.5 bg-[#159895]/10 font-semibold text-[#0B6E4F] data-[state=active]:bg-[#159895] data-[state=active]:text-white"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> For You
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="stories">
                      Audio Stories{searchFromUrl ? ` (${storySearchCount})` : ''}
                    </TabsTrigger>
                    <TabsTrigger value="walks">
                      Audio Walks{searchFromUrl ? ` (${walkSearchCount})` : ''}
                    </TabsTrigger>
                  </TabsList>

                  {account && (
                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                      <GamanaCoinIcon className="h-4 w-4" aria-hidden />
                      {coinBalance.toLocaleString()} Coins
                      <button
                        type="button"
                        onClick={() => setBuyCoinsOpen(true)}
                        className="ml-1 font-semibold text-[#159895] underline underline-offset-2 hover:text-[#128a86]"
                      >
                        Buy more
                      </button>
                    </div>
                  )}
                </div>

                <ExploreMobileAppNotice />

                <details className="group mb-4 rounded-xl border border-gray-100 bg-gray-50/80 open:bg-white lg:hidden">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-2">
                      Why Gamana?
                      <span className="text-xs font-normal text-gray-500 group-open:hidden">Show</span>
                      <span className="hidden text-xs font-normal text-gray-500 group-open:inline">Hide</span>
                    </span>
                  </summary>
                  <div className="border-t border-gray-100 px-4 pb-4">
                    <ExploreTrustPanel variant="compact" showAppNotice={false} />
                  </div>
                </details>

          {hasRecommendations && (
            <TabsContent value="recommended" className="space-y-8">
              <p className="text-sm text-gray-500">
                Because you told us you&apos;re into {interestLabels.join(', ')}.
              </p>

              {filteredRecommendedTours.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Picked for you</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                  <Button variant="outline" onClick={() => setActiveTab('stories')}>
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
          </div>

          <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Why Gamana</h2>
              <ExploreTrustPanel />
            </div>
          </aside>
        </div>
      </div>

      {/* Spend confirmation — Coins leave the balance immediately and can't be refunded,
          so the exact cost and resulting balance are both shown before committing. */}
      <Dialog open={!!confirmUnlock} onOpenChange={(open) => { if (!open) setConfirmUnlock(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Unlock this {confirmUnlock?.type === 'combo' ? 'combo' : 'tour'}?</DialogTitle>
          </DialogHeader>
          {confirmUnlock && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-900">{confirmUnlock.title}</p>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cost</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                    <GamanaCoinIcon className="h-4 w-4" aria-hidden />
                    {confirmUnlock.priceCoins} Coins
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Balance after</span>
                  <span className="font-semibold text-gray-900">
                    {(coinBalance - confirmUnlock.priceCoins).toLocaleString()} Coins
                  </span>
                </div>
              </div>

              <p className="flex items-start gap-2 text-xs text-gray-500">
                <Smartphone className="h-3.5 w-3.5 shrink-0 text-[#159895] mt-0.5" />
                Unlocks instantly in your Gamana app. Coins are spent immediately and
                can&apos;t be refunded.
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmUnlock(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => performUnlock(confirmUnlock)}
                  className="flex-1 bg-[#159895] hover:bg-[#128a86] text-white"
                >
                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                  Unlock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Not enough Coins to unlock — steer straight to the bundle picker instead of a dead end */}
      <Dialog open={insufficientOpen} onOpenChange={setInsufficientOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Not enough Coins</DialogTitle>
          </DialogHeader>
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-amber-500" />
          </div>
          {pendingUnlock && (
            <p className="text-sm text-gray-600">
              {pendingUnlock.title} costs {pendingUnlock.priceCoins} Coins, you have {coinBalance}.
            </p>
          )}
          <Button
            onClick={() => {
              setInsufficientOpen(false);
              setBuyCoinsOpen(true);
            }}
            className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A]"
          >
            Get Coins
          </Button>
        </DialogContent>
      </Dialog>

      {/* The one and only "buy Coins" entry point — opened from the "Buy more" chip next
          to the balance, and from "Get Coins" above when an unlock fails for insufficient
          balance. Previously this content also lived in its own "Buy Coins" tab, which
          duplicated the "Buy more" cue right next to it. */}
      <Dialog open={buyCoinsOpen} onOpenChange={setBuyCoinsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buy Gamana Coins</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 -mt-2">
            Coins unlock Tours, Topics, and Combos. This is the only place to buy them, with real
            currency, through your cart.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coinBundles.map((bundle) => coinBundleCard(bundle))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Login gate — unlocking and claiming Coins both need an identity to hold a balance against */}
      <Dialog open={loginPromptOpen} onOpenChange={(open) => { setLoginPromptOpen(open); if (!open) setPendingAction(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log in to continue</DialogTitle>
          </DialogHeader>
          {pendingUnlock ? (
            <p className="text-sm text-gray-500">
              {pendingUnlock.title} costs {pendingUnlock.priceCoins} Coins. Log in to spend from your balance.
            </p>
          ) : (
            <p className="text-sm text-gray-500">Your Coins balance is tied to your account.</p>
          )}
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => completeLogin('you@gmail.com', 'google')}
              className="justify-start gap-3 h-11"
            >
              <span className="w-5 h-5 rounded-full bg-[#4285F4] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                G
              </span>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => completeLogin('you@icloud.com', 'apple')}
              className="justify-start gap-3 h-11"
            >
              <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                A
              </span>
              Continue with Apple
            </Button>
            <div className="flex items-center gap-2 pt-1">
              <Input
                type="email"
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="h-10 text-sm"
              />
              <Button
                type="button"
                onClick={() => {
                  if (!loginEmail.trim()) return;
                  completeLogin(loginEmail.trim(), 'email');
                }}
                className="bg-[#159895] hover:bg-[#128a86] shrink-0 h-10"
                aria-label="Log in with email"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 text-center">
            Prototype note: login here doesn&apos;t create a real account yet.
          </p>
        </DialogContent>
      </Dialog>

      {/* Confirms the unlock actually synced to the app account, not just the website —
          the website never plays audio itself, so this cue matters more here than a
          typical "added to cart" toast would. */}
      {appSyncToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm rounded-full pl-4 pr-5 py-3 shadow-xl max-w-[90vw]">
          <span className="h-7 w-7 rounded-full bg-[#159895] flex items-center justify-center shrink-0">
            <CheckIcon className="h-4 w-4" />
          </span>
          <span className="truncate">
            <span className="font-semibold">{appSyncToast}</span> is now in your Gamana app, open the app to start listening.
          </span>
        </div>
      )}
    </>
  );
}
