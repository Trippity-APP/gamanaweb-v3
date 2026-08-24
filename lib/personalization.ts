/**
 * Shared personalization taxonomy and types — the single source of truth for both the
 * "Start Your Gamana Journey" wizard (app/start-your-journey/page.tsx) and the inline
 * Personalization editor on /account. Keeping this in one place means the two editing
 * surfaces can't drift apart on what a "traveler profile" or "interest" even is.
 *
 * Grounded in the real Place Types tag system used in the Admin Panel's Stories
 * Management (hindu temple, monument, garden, historical place, tourist attraction,
 * point of interest) plus Content Bible themes — Gamana doesn't yet have a canonical
 * personalization taxonomy, so this is a first pass, not a locked schema.
 */

export type Corridor = "inbound" | "domestic" | "outbound" | null;
export type Depth = "highlights" | "balanced" | "deep-dive" | null;

export interface TravelerProfile {
  name: string;
  interests: string[];
  subInterests: string[];
  dietary: string;
  religiousObservance: string;
  allergies: string;
}

export const blankProfile = (): TravelerProfile => ({
  name: "",
  interests: [],
  subInterests: [],
  dietary: "",
  religiousObservance: "",
  allergies: "",
});

export const corridorOptions: { id: NonNullable<Corridor>; label: string; description: string }[] = [
  { id: "inbound", label: "I'm coming to India", description: "Visiting from abroad" },
  { id: "domestic", label: "I'm exploring within India", description: "Traveling domestically" },
  { id: "outbound", label: "I'm heading abroad from India", description: "Outbound travel" },
];

export const groupTypeOptions = [
  "Just me",
  "A couple",
  "Family with kids",
  "Multi-generational group",
  "Friends",
];

export const interestCategoryOptions = [
  { id: "heritage", label: "Heritage & History" },
  { id: "spiritual", label: "Spirituality & Faith" },
  { id: "art", label: "Art & Architecture" },
  { id: "food", label: "Food & Local Life" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "culture", label: "Culture & Arts" },
  { id: "sports", label: "Sports & Recreation" },
  { id: "offbeat", label: "Offbeat & Local Discoveries" },
];

export const subInterestOptions: Record<string, { id: string; label: string }[]> = {
  heritage: [
    { id: "heritage-ancient", label: "Ancient & Archaeological" },
    { id: "heritage-colonial", label: "Colonial Era" },
    { id: "heritage-independence", label: "Independence Movement" },
    { id: "heritage-royal", label: "Royal & Dynastic Stories" },
  ],
  spiritual: [
    { id: "spiritual-temples", label: "Temples & Shrines" },
    { id: "spiritual-pilgrimage", label: "Pilgrimage Routes" },
    { id: "spiritual-festivals", label: "Festivals & Rituals" },
    { id: "spiritual-meditation", label: "Meditation & Mindfulness" },
  ],
  art: [
    { id: "art-mughal", label: "Mughal Architecture" },
    { id: "art-temple", label: "Temple Architecture" },
    { id: "art-colonial", label: "Colonial Buildings" },
    { id: "art-sculpture", label: "Sculpture & Carving" },
  ],
  food: [
    { id: "food-street", label: "Street Food" },
    { id: "food-regional", label: "Regional Cuisine" },
    { id: "food-markets", label: "Markets & Bazaars" },
    { id: "food-life", label: "Everyday Local Life" },
  ],
  nature: [
    { id: "nature-wildlife", label: "Wildlife" },
    { id: "nature-trekking", label: "Trekking & Hills" },
    { id: "nature-beaches", label: "Beaches & Backwaters" },
    { id: "nature-gardens", label: "Gardens & Parks" },
  ],
  culture: [
    { id: "culture-music", label: "Music & Dance" },
    { id: "culture-literature", label: "Literature & Poetry" },
    { id: "culture-handicrafts", label: "Handicrafts & Textiles" },
    { id: "culture-cinema", label: "Cinema & Folklore" },
  ],
  sports: [
    { id: "sports-cricket", label: "Cricket" },
    { id: "sports-football", label: "Football" },
    { id: "sports-venues", label: "Historic Sporting Venues" },
    { id: "sports-adventure", label: "Adventure Sports" },
  ],
  offbeat: [
    { id: "offbeat-gems", label: "Hidden Gems" },
    { id: "offbeat-legends", label: "Local Legends & Folklore" },
    { id: "offbeat-streetart", label: "Street Art" },
    { id: "offbeat-museums", label: "Unusual Museums" },
  ],
};

export const depthOptions: { id: NonNullable<Depth>; label: string; description: string }[] = [
  {
    id: "highlights",
    label: "Just the essentials",
    description: "Short, high-impact stories at the places that matter most",
  },
  {
    id: "balanced",
    label: "A balanced mix",
    description: "Highlights most places, deeper dives where it's worth it",
  },
  {
    id: "deep-dive",
    label: "Immerse me fully",
    description: "Long, layered, multi-stop stories — take your time",
  },
];

export const depthLabels: Record<string, string> = {
  highlights: "Just the essentials",
  balanced: "A balanced mix",
  "deep-dive": "Immerse me fully",
};

export const walkingToleranceOptions = [
  "Short strolls only",
  "Comfortable with a few hours on foot",
  "Happy to walk all day",
];

export const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Non-vegetarian",
  "Eggetarian",
  "Jain",
  "Halal",
  "Kosher",
  "No restrictions",
];
