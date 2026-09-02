'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  MapPin, Star, Heart, Headphones, CloudDownload, Users2, Compass,
  Check as CheckIcon, Sparkles, Coins as CoinsIcon, Lock, AlertCircle, LogIn,
  Smartphone,
} from 'lucide-react';
import { useStoreUrl } from '@/hooks/use-store-url';
import { trackStoreClick } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Cart } from '@/components/cart/Cart';
import { CityNotCovered } from '@/components/marketplace/CityNotCovered';
import { MarketplaceCoverImage } from '@/components/marketplace/marketplace-cover-image';
import { TourGridSkeleton } from '@/components/ui/list-skeletons';
import {
  clearMarketplaceCache,
  fetchPublicTours,
  getTourHref,
  tourMatchesSearch,
} from '@/lib/marketplace-api';
import { useCart } from '@/lib/cart-context';
import { useAccount } from '@/lib/account-context';
import {
  tierLabels, getTierColor, coinBundles,
  tourCategoryToInterests,
  type Tour, type CoinBundle,
} from '@/lib/marketplace-data';
import { interestCategoryOptions } from '@/lib/personalization';

const trustPoints = [
  { icon: Headphones, title: 'Audio-first', description: 'Hands-free, made for walking and looking up, not down' },
  { icon: CloudDownload, title: 'Works offline', description: 'Download once, listen with no signal' },
  // No narrator count here on purpose: the roster varies by city and language, so a fixed
  // number would be wrong somewhere. The point is that the traveller chooses.
  { icon: Users2, title: 'Your pick of narrator', description: 'Scholarly, devotional, comic, local, choose the voice that suits you' },
  { icon: Compass, title: 'India-first', description: 'Deep India coverage, extended worldwide' },
];

type UnlockTarget = { id: string; type: 'tour' | 'combo'; title: string; priceCoins: number };

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
}: {
  /** Lets the page's hero search box drive the Tours search. Falls back to internal state if omitted. */
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
}) {
  // City personalization: static export has no server-side searchParams, so the `city`
  // param — set either by the Home hero search (components/HeroCitySearch.tsx) or by
  // this page's own hero search (components/marketplace/MarketplaceHeroSearch.tsx) — is
  // read client-side here and used to seed both the Tours and Experiences filters, same
  // `location` text match either search box already does, just pre-filled instead of
  // typed.
  const urlSearchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cityFromUrl = urlSearchParams.get('city') ?? '';

  const [internalSearchQuery, setInternalSearchQuery] = useState(cityFromUrl);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;
  const [selectedTier, setSelectedTier] = useState('all');
  const { account, journey, login, coinBalance, unlockItem, isUnlocked, claimWelcomeCoins, welcomeCoinsClaimed } = useAccount();
  const { url: storeUrl, platform } = useStoreUrl();

  const clearCityFilter = () => {
    setSearchQuery('');
    router.replace(pathname);
  };

  // MarketplaceHeroSearch (in the page's hero, above this component) owns the actual
  // search input now and commits by updating the `city` URL param. This keeps both
  // derived filters — and the active tab — in sync whenever that param changes, the same
  // way the old in-card search box used to do it directly.
  useEffect(() => {
    setInternalSearchQuery(cityFromUrl);
    if (cityFromUrl && (!hasRecommendations || activeTab === 'recommended')) {
      setActiveTab('tours');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFromUrl]);

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

  const [tours, setTours] = useState<Tour[]>([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [visibleTourCount, setVisibleTourCount] = useState(TOURS_INITIAL_VISIBLE);

  const loadTours = async () => {
    setToursLoading(true);
    try {
      const nextTours = await fetchPublicTours();
      setTours(nextTours);
    } catch {
      setTours([]);
    } finally {
      setToursLoading(false);
    }
  };

  useEffect(() => {
    void loadTours();
  }, []);

  useEffect(() => {
    setVisibleTourCount(TOURS_INITIAL_VISIBLE);
  }, [searchQuery, selectedTier, cityFromUrl]);

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

  // A city search always wins over the recommended-tab default — the visitor came in
  // asking for a specific place, not a personalized mix.
  const [activeTab, setActiveTab] = useState(cityFromUrl ? 'tours' : 'tours');

  useEffect(() => {
    if (!cityFromUrl && hasRecommendations && activeTab === 'tours' && !toursLoading) {
      setActiveTab('recommended');
    }
  }, [cityFromUrl, hasRecommendations, activeTab, toursLoading]);

  const filteredTours = tours
    .filter((tour) => {
      const matchesSearch = tourMatchesSearch(tour, searchQuery);
      const matchesTier = selectedTier === 'all' || tour.tier === selectedTier;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => (active ? Number(tourMatches(b)) - Number(tourMatches(a)) : 0));

  /*
    Coverage detection for the empty states below.
    An empty grid has three very different causes, and telling a traveller "we don't
    cover your city" when we actually do would be a straightforward accuracy failure —
    so each cause gets its own message:
      1. The tier/category filter zeroed an otherwise-populated result set.
      2. This tab has nothing for the city, but the other tab does.
      3. Neither tab has anything, the only case that is genuinely "not covered yet",
         and the only one that shows the demand-capture card.
    These counts deliberately ignore the tier/category filters so cause 1 can't be
    mistaken for cause 3.
  */
  const tourSearchTerm = searchQuery.trim();

  const toursForSearch = tourSearchTerm
    ? tours.filter((t) => tourMatchesSearch(t, tourSearchTerm)).length
    : 0;

  const visibleTours = filteredTours.slice(0, visibleTourCount);
  const hasMoreTours = filteredTours.length > visibleTourCount;

  const unlockButton = (target: UnlockTarget) => {
    const key = `${target.type}-${target.id}`;
    const unlocked = isUnlocked(target.id, target.type);
    const showUnlocked = unlocked || justUnlocked === key;
    return (
      <Button
        size="sm"
        onClick={() => attemptUnlock(target)}
        disabled={unlocked}
        className={showUnlocked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-[#159895] hover:bg-[#128a86] text-white'}
      >
        {showUnlocked ? (
          <><CheckIcon className="mr-1.5 h-3.5 w-3.5" /> Unlocked</>
        ) : (
          <><Lock className="mr-1.5 h-3.5 w-3.5" /> Unlock</>
        )}
      </Button>
    );
  };

  const tourCard = (tour: Tour, index: number, recommended = false) => (
    <Card key={tour.id} className="overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white group">
      <Link href={getTourHref(tour)} className="block">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <MarketplaceCoverImage
            src={tour.image}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            priority={index < 3}
          />
          <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded ${getTierColor(tour.tier)}`}>
            {tierLabels[tour.tier]?.toUpperCase() ?? tour.tier.toUpperCase()}
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
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="font-semibold text-gray-900">{tour.rating}</span>
            <span className="text-gray-500">({tour.reviews.toLocaleString()})</span>
          </div>
          <p className="text-xs text-gray-500">Narrated by {tour.narrator}</p>
        </CardContent>
      </Link>

      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div>
          {tour.price === 0 ? (
            <p className="text-base font-bold text-emerald-700">Free</p>
          ) : (
            <div className="flex items-center gap-1.5">
              <CoinsIcon className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-base font-bold text-gray-900">{tour.price}</p>
              {tour.originalPrice && <p className="text-xs text-gray-400 line-through">{tour.originalPrice}</p>}
            </div>
          )}
        </div>
        {unlockButton({ id: tour.id, type: 'tour', title: tour.title, priceCoins: tour.price })}
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
            <CoinsIcon className="h-6 w-6 text-amber-500" />
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

      <div className="max-w-7xl mx-auto px-4">
        {/*
          Search + trust strip live in one card that overlaps the hero photo above it —
          gives the page a focal point right where the eye lands instead of a search pill
          floating alone in white space, and ties the "why Gamana" points visually to the
          hero rather than reading as a separate, easy-to-skim-past section.
        */}
        <div className="relative z-10 -mt-14 sm:-mt-16 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-6">
          {/* The Tours search box itself moved up into the hero (MarketplaceHeroSearch) so
              it sits right under the headline instead of a scroll-step away, this card
              now just reflects the resulting city filter, plus trust points and the app
              notice. searchQuery/experienceSearch stay in sync with the URL via the
              cityFromUrl effect above. */}
          {cityFromUrl && (
            <div className="mb-6 flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#159895]/30 bg-[#F0FBFA] px-4 py-2 text-sm font-semibold text-[#0B6E4F]">
              <MapPin className="h-4 w-4" />
              Showing {cityFromUrl}
              <button
                type="button"
                onClick={clearCityFilter}
                aria-label="Clear city filter"
                className="ml-1 text-[#159895] hover:text-[#128a86]"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4 md:gap-6">
            {trustPoints.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#159895]/10">
                  <p.icon className="h-4 w-4 text-[#159895]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                  <p className="text-xs leading-snug text-gray-500">{p.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Browsing and unlocking happens here, but playback only happens in the app —
              this is the one place on the page that says so up front, before anyone
              unlocks something and wonders where it went. */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 border-t-0">
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Smartphone className="h-3.5 w-3.5 text-[#159895] shrink-0" />
              Everything you unlock or book here plays in the Gamana app, sign in with the same account.
            </p>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreClick(platform === 'ios' ? 'apple' : 'play', 'marketplace-trust-strip')}
              className="text-xs font-semibold text-[#159895] hover:text-[#128a86] underline underline-offset-2 whitespace-nowrap"
            >
              Get the app free
            </a>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-10 pb-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* Combos and Special Offers merged into one "Deals" tab: both answered the
                same shopper question ("where's the better price?"), and splitting them
                meant a discounted bundle and a promotional offer lived two clicks apart
                for no reason the visitor could see. */}
            <TabsList className={`grid ${hasRecommendations ? 'max-w-2xl grid-cols-4' : 'max-w-xl grid-cols-3'}`}>
              {hasRecommendations && (
                <TabsTrigger
                  value="recommended"
                  className="gap-1.5 bg-[#159895]/10 text-[#0B6E4F] font-semibold data-[state=active]:bg-[#159895] data-[state=active]:text-white"
                >
                  <Sparkles className="h-3.5 w-3.5" /> For You
                </TabsTrigger>
              )}
              <TabsTrigger value="tours">Tours</TabsTrigger>
              <TabsTrigger value="experiences">Experiences</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
            </TabsList>

            {/* Single cue for buying Coins now — this chip opens the bundle picker
                directly (below) instead of duplicating a "Buy Coins" tab. */}
            {account && (
              <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                <CoinsIcon className="h-4 w-4" />
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

          {hasRecommendations && (
            <TabsContent value="recommended" className="space-y-8">
              <p className="text-sm text-gray-500">
                Because you told us you&apos;re into {interestLabels.join(', ')}.
              </p>

              {recommendedTours.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Tours for you</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedTours.map((tour, i) => tourCard(tour, i, true))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <p className="text-gray-500">No personalized matches yet, browse the full catalog.</p>
                  <Button variant="outline" onClick={() => setActiveTab('tours')}>
                    Browse all tours
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="tours" className="space-y-6">
            <div className="flex gap-3 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button variant={selectedTier === 'all' ? 'default' : 'outline'} onClick={() => setSelectedTier('all')} size="sm">
                  All tiers
                </Button>
                <Button
                  variant={selectedTier === 'silver' ? 'default' : 'outline'}
                  onClick={() => setSelectedTier('silver')}
                  size="sm"
                  className={selectedTier === 'silver' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  {tierLabels.silver}
                </Button>
                <Button
                  variant={selectedTier === 'gold' ? 'default' : 'outline'}
                  onClick={() => setSelectedTier('gold')}
                  size="sm"
                  className={selectedTier === 'gold' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  {tierLabels.gold}
                </Button>
                <Button
                  variant={selectedTier === 'platinum' ? 'default' : 'outline'}
                  onClick={() => setSelectedTier('platinum')}
                  size="sm"
                  className={selectedTier === 'platinum' ? 'bg-[#159895] hover:bg-[#128a86]' : ''}
                >
                  {tierLabels.platinum}
                </Button>
              </div>
              <p className="text-sm text-gray-500">{filteredTours.length} tours</p>
            </div>

            {toursLoading ? (
              <TourGridSkeleton count={TOURS_INITIAL_VISIBLE} />
            ) : filteredTours.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTours.map((tour, index) => tourCard(tour, index, active && tourMatches(tour)))}
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
            ) : tourSearchTerm && toursForSearch === 0 ? (
              <CityNotCovered city={tourSearchTerm} source="tours" />
            ) : tours.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No tours available.</p>
            ) : (
              <p className="text-center text-gray-500 py-12">
                No tours match this filter{tourSearchTerm ? ` for ${tourSearchTerm}` : ''}. Try a different tier.
              </p>
            )}
          </TabsContent>


          <TabsContent value="experiences" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Real-world experiences</h2>
              <p className="text-sm text-gray-600 max-w-2xl">
                Put away those headphones and mingle with a real local guide. Enjoy
                authentic experiences with real people.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/70 px-5 py-8 text-center space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Coming soon</p>
              <p className="text-sm text-gray-600 max-w-xl mx-auto">
                Bookable experiences with local operators are on the way. For now, explore our live audio tours
                {cityFromUrl ? ` in ${cityFromUrl}` : ''}.
              </p>
              {cityFromUrl ? (
                <div className="pt-2">
                  <CityNotCovered city={cityFromUrl} source="experiences" />
                </div>
              ) : (
                <Button variant="outline" onClick={() => setActiveTab('tours')}>
                  Browse audio tours
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deals" className="space-y-10">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Limited time offers</h2>
              <p className="text-sm text-gray-500">Member deals and promotions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-xl overflow-hidden bg-[#0B6E4F] text-white border-0">
                <CardContent className="p-5 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">New user</p>
                  <h3 className="text-lg font-semibold">Claim your free 5 Coins</h3>
                  <p className="text-sm text-white/85">Unlock 5 premium stories, on us</p>
                  <p className="text-2xl font-bold pt-2">5 Coins</p>
                  <p className="text-xs text-white/70">Awarded instantly, once per account</p>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button
                    size="sm"
                    onClick={() => requireLogin(claimWelcomeCoins)}
                    disabled={welcomeCoinsClaimed}
                    className="w-full bg-white text-[#0B6E4F] hover:bg-gray-100 disabled:opacity-60"
                  >
                    {welcomeCoinsClaimed ? (
                      <><CheckIcon className="mr-1.5 h-3.5 w-3.5" /> Claimed</>
                    ) : (
                      'Claim offer'
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="rounded-xl overflow-hidden bg-amber-600 text-white border-0">
                <CardContent className="p-5 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">New user</p>
                  <h3 className="text-lg font-semibold">Welcome bonus</h3>
                  <p className="text-sm text-white/85">First tour free for new Gamana members</p>
                  <p className="text-2xl font-bold pt-2">Sign up today</p>
                  <p className="text-xs text-white/70">Plus earn 100 referral points</p>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button size="sm" className="w-full bg-white text-amber-700 hover:bg-gray-100">Get started</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
                    <CoinsIcon className="h-4 w-4 text-amber-500" />
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
