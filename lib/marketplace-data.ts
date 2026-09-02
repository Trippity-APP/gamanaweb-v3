/**
 * Shared marketplace catalog — used by both the signed-out /marketplace page and the
 * signed-in, personalized /marketplace-redesign page, so the two never show different
 * inventories. Tour/experience data is still illustrative (fictional cities/narrators) —
 * flagged and deliberately left as-is per the founder's explicit call to defer real-catalog
 * work.
 *
 * Pricing model: Tours and Combos — all digital audio content — are priced in Gamana
 * Coins only, unlocked directly against a traveler's coin balance (no cart). Experiences
 * are real-world, third-party-operator bookings and stay in real currency via the cart.
 * Coins themselves are bought with real currency through the coinBundles catalog below —
 * that's the only real-money-to-Coins on-ramp, per the founder's explicit direction.
 */

export interface Tour {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  /** Gamana Coins, not USD. */
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  tier: 'silver' | 'gold' | 'platinum';
  category: string;
  image: string;
  highlights: string[];
  narrator: string;
  isPremium: boolean;
  discount?: number;
  /** Lowercase tokens for city/search matching — populated by lib/marketplace-api.ts */
  searchTerms?: string[];
  /** URL slug derived from tour title — populated by lib/marketplace-api.ts */
  slug?: string;
  /** Audio Stories (single-stop) vs Audio Walks (multi-stop) — from API storylist type/stops */
  contentKind?: 'story' | 'walk';
  /** Curated for catalog — from API is_recommended */
  isRecommended?: boolean;
}

export interface TourStop {
  id: string;
  position: number;
  name: string;
  description?: string;
  image?: string;
  audioDurationSeconds?: number;
}

export interface WalkDetail extends Tour {
  contentKind: 'walk';
  stops: TourStop[];
  stopsCount: number;
  totalDurationMinutes?: number;
  totalAudioDurationSeconds?: number;
}

export interface StorySource {
  type: 'academic' | 'oral' | 'archival' | 'mixed';
  title: string;
  url?: string;
}

export interface StoryLanguageOption {
  code: string;
  label: string;
  nativeLabel?: string;
  isActive?: boolean;
  availableInApp?: boolean;
}

export interface StoryNarratorLens {
  id: string;
  name: string;
  title: string;
  description: string;
  durationMinutes?: number;
  isPrimary?: boolean;
}

export interface StoryVisitTip {
  type: 'respect' | 'safety' | 'practical';
  title: string;
  description: string;
}

export interface StorySubTopic {
  id: string;
  name: string;
  durationSeconds?: number;
  durationLabel?: string;
}

export interface StoryDetail extends Tour {
  contentKind: 'story';
  placeName?: string;
  placeDescription?: string;
  subtitle?: string;
  coordinates?: [number, number];
  audioDurationMinutes?: number;
  storyTypeLabel?: string;
  whatToNotice: string[];
  sources: StorySource[];
  languages: StoryLanguageOption[];
  narrators: StoryNarratorLens[];
  beforeYouVisit: StoryVisitTip[];
  lensesAvailableCount?: number;
  /** Audio sub-topics from place audios — shown in Go deeper. */
  subTopics: StorySubTopic[];
}

export const tours: Tour[] = [
  {
    id: '1',
    title: 'Ancient Rome: The Empire\'s Heart',
    description: 'Walk through 2,000 years of history from the Colosseum to the Roman Forum',
    location: 'Rome, Italy',
    duration: '2.5 hours',
    price: 15,
    originalPrice: 20,
    rating: 4.9,
    reviews: 1243,
    tier: 'platinum',
    category: 'Historical',
    image: 'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Colosseum insights', 'Forum mysteries', 'Imperial stories'],
    narrator: 'Dr. Marcus Romano',
    isPremium: true,
    discount: 35,
  },
  {
    id: '2',
    title: 'Paris: Hidden Montmartre',
    description: 'Discover the artistic soul of Paris beyond the tourist trails',
    location: 'Paris, France',
    duration: '3 hours',
    price: 12,
    rating: 4.8,
    reviews: 892,
    tier: 'gold',
    category: 'Art & Culture',
    image: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Artists\' studios', 'Secret gardens', 'Local cafes'],
    narrator: 'Sophie Laurent',
    isPremium: true,
  },
  {
    id: '3',
    title: 'Tokyo Street Food Journey',
    description: "A walking tour of Tokyo's best street food neighbourhoods",
    location: 'Tokyo, Japan',
    duration: '2 hours',
    price: 0,
    rating: 4.7,
    reviews: 2105,
    tier: 'silver',
    category: 'Food & Drink',
    image: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Ramen origins', 'Sushi secrets', 'Local markets'],
    narrator: 'Kenji Yamamoto',
    isPremium: false,
  },
  {
    id: '4',
    title: 'London Royal Heritage',
    description: 'Explore the palaces, crown jewels, and royal traditions',
    location: 'London, UK',
    duration: '3.5 hours',
    price: 18,
    originalPrice: 25,
    rating: 4.9,
    reviews: 1567,
    tier: 'platinum',
    category: 'Historical',
    image: 'https://images.pexels.com/photos/460740/pexels-photo-460740.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Buckingham Palace', 'Tower of London', 'Westminster'],
    narrator: 'Lady Catherine Wells',
    isPremium: true,
    discount: 32,
  },
  {
    id: '5',
    title: 'New York Jazz Era',
    description: 'Walk through Harlem and Greenwich Village\'s jazz history',
    location: 'New York, USA',
    duration: '2.5 hours',
    price: 10,
    rating: 4.6,
    reviews: 743,
    tier: 'gold',
    category: 'Music & Arts',
    image: 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Jazz clubs', 'Blues history', 'Musical legends'],
    narrator: 'Miles Jackson',
    isPremium: true,
  },
  {
    id: '6',
    title: 'Barcelona Gaudí Tour',
    description: 'Marvel at the architectural genius of Antoni Gaudí',
    location: 'Barcelona, Spain',
    duration: '3 hours',
    price: 0,
    rating: 4.8,
    reviews: 1891,
    tier: 'silver',
    category: 'Architecture',
    image: 'https://images.pexels.com/photos/819764/pexels-photo-819764.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: ['Sagrada Familia', 'Park Güell', 'Casa Batlló'],
    narrator: 'Isabella Martinez',
    isPremium: false,
  },
];

export interface Combo {
  id: string;
  title: string;
  description: string;
  tours: string[];
  /** Gamana Coins, not USD. */
  price: number;
  originalPrice: number;
  savings: number;
  validity: string;
}

export const combos: Combo[] = [
  {
    id: 'combo1',
    title: 'Delhi Heritage Pass',
    description: "Explore the layers of Delhi's history",
    tours: ['Old Delhi Bazaars', 'Red Fort Chronicles', 'Humayun\'s Tomb', 'Qutub Complex', 'Chandni Chowk Food Trail'],
    price: 40,
    originalPrice: 65,
    savings: 38,
    validity: '90 days',
  },
  {
    id: 'combo2',
    title: 'Asian Discovery Bundle',
    description: 'Explore Tokyo, Bangkok, and Seoul with expert narrators',
    tours: ['Tokyo Street Food', 'Bangkok Temples', 'Seoul Modern', 'Kyoto Gardens'],
    price: 30,
    originalPrice: 45,
    savings: 33,
    validity: '60 days',
  },
];

export interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  /** Real currency (USD), not Coins — booked and paid through the cart. */
  price: number;
  rating: number;
  reviews: number;
  category: string;
  operator: string;
  image: string;
}

// Real-world, third-party-operator bookings — paid in real money, separate from Gamana's
// own audio-tour content (which stays on Gamana Coins). Operator names here are
// illustrative/generic (cooperatives, collectives) rather than naming real companies,
// since no actual operator partnerships are confirmed yet beyond the draft Bókun agreement.
export const experiences: Experience[] = [
  {
    id: 'exp1',
    title: 'Sunrise Boat Ride on the Ganges',
    description: 'Drift past the ghats as the city wakes up, guided by a local boatman who has rowed these waters for decades.',
    location: 'Varanasi, India',
    duration: '1.5 hours',
    price: 18,
    rating: 4.9,
    reviews: 312,
    category: 'Nature & Water',
    operator: 'Varanasi River Guides Cooperative',
    image: '/varanasi ghats golden hour river boats temple spires panoramic view.jpg',
  },
  {
    id: 'exp2',
    title: 'Old Delhi Food Walking Tour',
    description: "Chaat, parathas, and kebabs through the lanes of Chandni Chowk with a guide who grew up eating this way.",
    location: 'Delhi, India',
    duration: '3 hours',
    price: 25,
    rating: 4.8,
    reviews: 587,
    category: 'Food',
    operator: 'Delhi Food Walks Collective',
    image: '/chandni-chowk-golden-hour-street-view-old-delhi-walking-tour.png',
  },
  {
    id: 'exp3',
    title: 'Home-Style Rajasthani Cooking Class',
    description: "Cook a full thali in a family kitchen, dal baati churma, gatte ki sabzi, and the stories behind them.",
    location: 'Jaipur, India',
    duration: '3 hours',
    price: 32,
    rating: 4.9,
    reviews: 204,
    category: 'Food',
    operator: 'Rajasthani Home Kitchens',
    image: '/traditional rajasthani thali jaipur food culture.jpg',
  },
  {
    id: 'exp4',
    title: 'Kerala Backwaters Houseboat Day Trip',
    description: 'A full day drifting through Alleppey\'s canals and coconut groves on a traditional kettuvallam houseboat.',
    location: 'Alleppey, India',
    duration: '6 hours',
    price: 45,
    rating: 4.9,
    reviews: 441,
    category: 'Nature & Water',
    operator: 'Alleppey Backwater Cruises',
    image: '/kerala-backwaters-houseboat-coconut-palms-morning-light.jpg',
  },
  {
    id: 'exp5',
    title: 'Hampi Sunset Coracle Ride',
    description: 'Round boat, still water, boulder-strewn hills turning gold, a quiet way to close a day among the ruins.',
    location: 'Hampi, India',
    duration: '1 hour',
    price: 15,
    rating: 4.7,
    reviews: 168,
    category: 'Nature & Water',
    operator: 'Hampi Heritage Boatmen',
    image: '/hampi-vittala-temple-chariot-golden-hour-boulder-landscape.jpg',
  },
  {
    id: 'exp6',
    title: 'Mumbai Local Life Walking Tour',
    description: 'Marine Drive at dusk, Colaba backstreets, and the everyday rhythm of a city that never really stops.',
    location: 'Mumbai, India',
    duration: '2.5 hours',
    price: 20,
    rating: 4.7,
    reviews: 289,
    category: 'Culture & Craft',
    operator: 'Mumbai Local Walks Collective',
    image: '/mumbai-marine-drive-dusk-queens-necklace-arabian-sea.jpg',
  },
  {
    id: 'exp7',
    title: 'Sunrise Photography Walk at the Taj Mahal',
    description: 'Beat the crowds and the heat, a guided walk timed to first light, with tips for the shot everyone wants.',
    location: 'Agra, India',
    duration: '2 hours',
    price: 28,
    rating: 4.9,
    reviews: 526,
    category: 'Heritage',
    operator: 'Agra Heritage Photo Walks',
    image: '/taj-mahal-sunrise-reflection-central-pool-agra.jpg',
  },
  {
    id: 'exp8',
    title: 'North Goa Beach & Fort Sunset Walk',
    description: 'Anjuna\'s cliffs and shoreline at golden hour, ending at a centuries-old Portuguese fort.',
    location: 'Goa, India',
    duration: '2 hours',
    price: 16,
    rating: 4.6,
    reviews: 143,
    category: 'Nature & Water',
    operator: 'Goa Coastal Trails',
    image: '/anjuna-beach-self-guided-tour-best-way-to-explore-north-goa.jpg',
  },
];

export const experienceCategories = ['All', 'Food', 'Nature & Water', 'Heritage', 'Culture & Craft'];

export interface CoinBundle {
  id: string;
  name: string;
  blurb: string;
  baseCoins: number;
  bonusCoins: number;
  /** Real currency (USD) — the only real-money-to-Coins on-ramp. */
  price: number;
  popular?: boolean;
}

// The sole real-money purchase for digital content: buy a Coin bundle here, then unlock
// Tours and Combos directly against that balance — no separate checkout for audio content.
export const coinBundles: CoinBundle[] = [
  {
    id: 'bundle-starter',
    name: 'Starter Pack',
    blurb: 'Enough for a couple of Themed Tours',
    baseCoins: 20,
    bonusCoins: 0,
    price: 4.99,
  },
  {
    id: 'bundle-explorer',
    name: 'Explorer Pack',
    blurb: 'Our most popular pack for regular travelers',
    baseCoins: 50,
    bonusCoins: 5,
    price: 9.99,
    popular: true,
  },
  {
    id: 'bundle-traveler',
    name: "Traveler's Pack",
    blurb: 'Best value per Coin, great for a full trip',
    baseCoins: 120,
    bonusCoins: 20,
    price: 19.99,
  },
  {
    id: 'bundle-globetrotter',
    name: 'Globetrotter Pack',
    blurb: 'Unlock nearly the whole catalog',
    baseCoins: 250,
    bonusCoins: 70,
    price: 39.99,
  },
];

// Silver/Gold/Platinum are internal-only tier names (Content Bible / System Prompt) —
// never shown to users. These are the plain-language equivalents.
export const tierLabels: Record<string, string> = {
  silver: 'Free Story',
  gold: 'Themed Tour',
  platinum: 'Premium Tour',
};

export function getTierColor(tier: string) {
  switch (tier) {
    case 'silver':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
    case 'gold':
      return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg';
    case 'platinum':
      return 'bg-gradient-to-r from-[#159895] via-[#57C5B6] to-[#1A5F7A] text-white shadow-lg';
    default:
      return 'bg-gray-400 text-white';
  }
}

export type WalkAccessLabel = 'free' | 'premium';

export function isCatalogFree(tour: Pick<Tour, 'price'>): boolean {
  return tour.price === 0;
}

/** Explore catalog badge — matches All/Free/Premium filters (tour.price from coins_price). */
export function getCatalogAccessLabel(tour: Pick<Tour, 'price'>): WalkAccessLabel {
  return isCatalogFree(tour) ? 'free' : 'premium';
}

export function getCatalogAccessBadgeText(tour: Pick<Tour, 'price'>): string {
  return isCatalogFree(tour) ? 'Free' : 'Premium';
}

export function getCatalogAccessBadgeClass(tour: Pick<Tour, 'price'>): string {
  if (isCatalogFree(tour)) {
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200';
  }
  return 'bg-gradient-to-r from-[#1A5F7A] to-[#159895] text-white shadow-sm';
}

/** @deprecated Use getCatalogAccessLabel */
export function getWalkAccessLabel(tour: Pick<Tour, 'price'>): WalkAccessLabel {
  return getCatalogAccessLabel(tour);
}

/** @deprecated Use getCatalogAccessBadgeText */
export function getWalkAccessBadgeText(tour: Pick<Tour, 'price'>): string {
  return getCatalogAccessBadgeText(tour);
}

/** @deprecated Use getCatalogAccessBadgeClass */
export function getWalkAccessBadgeClass(tour: Pick<Tour, 'price'>): string {
  return getCatalogAccessBadgeClass(tour);
}

/**
 * Loose mapping from the catalog's free-text `category` fields to the wizard's interest
 * taxonomy (lib/personalization.ts), so the personalized marketplace can score/sort the
 * same catalog against what a traveler told us they're into. Not a real taxonomy join —
 * a first pass, same caveat as lib/personalization.ts.
 */
export const tourCategoryToInterests: Record<string, string[]> = {
  Historical: ['heritage'],
  'Art & Culture': ['art', 'culture'],
  'Food & Drink': ['food'],
  'Music & Arts': ['culture', 'art'],
  Architecture: ['art', 'heritage'],
};

export const experienceCategoryToInterests: Record<string, string[]> = {
  'Nature & Water': ['nature'],
  Food: ['food'],
  Heritage: ['heritage'],
  'Culture & Craft': ['culture'],
};
