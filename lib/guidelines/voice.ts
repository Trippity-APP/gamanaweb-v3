/** Voice and tone content for /guidelines-v1. Copy examples are seeded from gamana.app. */

export const voicePillars = [
  {
    name: "Warm companion",
    description: "We walk beside the traveller. Calm, encouraging and practical when things get confusing.",
    soundsLike: "“Take your time. The next story starts when you reach the gate.”",
    neverSoundsLike: "“Hurry! Don't miss out on this amazing deal!!”",
  },
  {
    name: "Curious storyteller",
    description: "We lead with people and moments, then add the facts that make them land.",
    soundsLike: "“Listen for the bells: priests have rung them at dusk for four hundred years.”",
    neverSoundsLike: "“Built in 1631. Height 73 m. UNESCO site since 1983.”",
  },
  {
    name: "Respectful and culturally aware",
    description: "We name rituals correctly, explain without exoticising and give sacred places quiet.",
    soundsLike: "“The Ganga Aarti is a nightly prayer to the river. Stand back from the steps and keep your phone low.”",
    neverSoundsLike: "“Witness the mystical, exotic rituals of ancient India!”",
  },
];

export const writingRules = [
  { rule: "Talk to “you”", example: "You'll hear the story as you reach the gate." },
  { rule: "Short, benefit-led sentences", example: "Stories play by themselves. Keep your phone in your pocket." },
  { rule: "Place before abstraction", example: "Start with the pink sandstone, then explain the Rajput style." },
  { rule: "Active verbs", example: "“Download the walk”, not “The walk can be downloaded”." },
  { rule: "Sentence case everywhere", example: "“Explore by city”, not “Explore By City”." },
  { rule: "No keyword stuffing in UI copy", example: "SEO pages are their own context; product UI stays plain." },
];

export const toneMap = [
  { moment: "Onboarding", shift: "Welcoming and brief", example: "Pick a city. We'll take it from there." },
  { moment: "Now playing", shift: "Quiet, out of the way", example: "Next: Hawa Mahal · 3 min walk" },
  { moment: "Offline or error", shift: "Calm, specific, with a way forward", example: "You're offline. Downloaded stories still play." },
  { moment: "Paywall and Coins", shift: "Transparent, never pushy", example: "This walk costs 40 Coins. You have 120." },
  {
    moment: "Sacred and sensitive sites",
    shift: "Respectful, lower energy",
    example: "This is an active place of worship. Remove your shoes before the inner hall.",
  },
  { moment: "Booking and transactions", shift: "Precise and reassuring", example: "Booked with the operator. Confirmation sent to your email." },
];

export const copyPairs = [
  { do: "Just you, the city and a story in your ears.", dont: "Experience our revolutionary audio solution." },
  { do: "Your personal travel guide, in your pocket.", dont: "The #1 AI-powered next-gen tourism platform." },
  { do: "Walk and listen. Stories start as you arrive.", dont: "Leverage GPS-triggered content delivery." },
  { do: "We couldn't find a Gamana city near you yet.", dont: "Error 404: city not found." },
  { do: "The Ganga Aarti is an evening prayer to the river.", dont: "Witness the mystical rituals of exotic India." },
  { do: "Shoes off inside the temple; photos aren't allowed in the sanctum.", dont: "Snap the perfect temple selfie!" },
  { do: "Hear how Old Delhi's spice traders built Khari Baoli.", dont: "Discover the chaotic, colourful madness of Old Delhi." },
  { do: "Explore by city", dont: "EXPLORE AMAZING DESTINATIONS NOW!!!" },
  { do: "Claim your free 5 Coins", dont: "Click here to get your bonus!" },
];

export const ctaVocabulary = [
  { cta: "Listen", when: "Play a story or sample right now." },
  { cta: "Explore city", when: "Open a city page from a tile or search result." },
  { cta: "Get the app", when: "Any web-to-app handoff. Pair with the store badges." },
  { cta: "Claim offer", when: "Redeem a promo or free Coins." },
  { cta: "View bundle", when: "Open a multi-story bundle." },
  { cta: "View all cities", when: "End of a city rail or grid." },
];

export const bannedPhrases = ["Click here", "Revolutionary", "Exotic", "Mystical India", "Hidden gem (as a headline)", "Don't miss out"];

export const errorPatterns = [
  {
    title: "Location permission denied",
    problem: "Location permission was denied.",
    cause: "Gamana needs your location to start stories as you arrive.",
    next: "Turn on location in Settings, or pick a city instead.",
  },
  {
    title: "No city nearby",
    problem: "We couldn't find a Gamana city near you yet.",
    cause: "We're adding cities every month.",
    next: "Browse all cities or tell us where you'd like to go.",
  },
  {
    title: "Empty collection",
    problem: "Your collection is empty.",
    cause: "Stories you unlock or save appear here.",
    next: "Explore stories near you.",
  },
];

export const narrationNote =
  "Story scripts follow the human-centred historian approach used by our narrators: a person, a moment, then the meaning. Script rules live in the content team doc.";
export const CONTENT_DOC_URL = "{{CONTENT_TEAM_DOC_URL}}";
