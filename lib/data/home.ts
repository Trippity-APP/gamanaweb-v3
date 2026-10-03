import type { FaqItem } from "@/components/site/FaqAccordion";
import type { CityImage } from "@/lib/city-image";
import { DESTINATION_IMAGES } from "@/lib/data/destination-images";
import type { PhotoKey } from "@/lib/images";

// Wording comes from the 2026 SEO workbook (Home sheet); keep verbatim.
export const HOME_FAQS: FaqItem[] = [
  {
    question: "How can I get started with the Gamana travel app?",
    answer:
      "Download Gamana from the App Store or Google Play, then sign up to get started. Once you're in, Gamana shows nearby places of interest based on your location. Choose a site, select a narrator if you want, and tap play to begin your audio journey.",
  },
  {
    question: "Can I use Gamana as an offline travel guide?",
    answer:
      "Yes. Gamana can work as an offline travel guide when you download narrations before exploring. Once the narrations are downloaded, you can listen to them without an internet connection, which is useful when mobile data or network coverage is limited.",
  },
  {
    question: "What can I do with Gamana as a tourist guide app?",
    answer:
      "As a tourist guide app, Gamana helps you discover places of interest and learn about them through engaging audio stories. Choose a place, select a narrator when available, and explore at your own pace.",
  },
  {
    question: "How do Gamana’s audio tour guides work?",
    answer:
      "Gamana’s audio tour guides let you choose a tour or place and listen to stories as you explore. Select a narrator when available and enjoy historical, cultural, and local insights without needing to constantly read your phone.",
  },
  {
    question: "Can I use Gamana as a GPS tour guide app?",
    answer:
      "Yes. As a GPS tour guide app, Gamana uses your location to show nearby places of interest and help you discover audio stories as you explore. Choose a place and start listening when you're ready.",
  },
];

export type FeatureKey =
  | "exquisite-storytelling"
  | "truly-immersive"
  | "virtual-travel-guides"
  | "gamana-coins"
  | "user-generated-tours"
  | "local-languages";

export const KEY_FEATURES: { slug: FeatureKey; title: string; description: string }[] = [
  { slug: "exquisite-storytelling", title: "Exquisite Storytelling", description: "History, culture, and the details most guides skip" },
  { slug: "truly-immersive", title: "Truly Immersive", description: "Hands-free, eyes-up exploration" },
  { slug: "virtual-travel-guides", title: "Virtual Travel Guides", description: "Narrator voices you can pick for each walk" },
  { slug: "gamana-coins", title: "Gamana Coins", description: "Earn rewards as you explore" },
  { slug: "user-generated-tours", title: "User-Generated Tours", description: "Create and share storylists" },
  { slug: "local-languages", title: "Local Languages", description: "Stories in local languages" },
];

function destinationPhoto(cityId: string): CityImage {
  const match = DESTINATION_IMAGES.find((d) => d.cityId === cityId);
  if (!match) throw new Error(`No destination photo for city ${cityId}`);
  return match.image;
}

// City IDs verified against the live catalogue (each has published audio tours).
export const FEATURED_CITIES: readonly { id: string; name: string; tagline: string; image: CityImage }[] = [
  { id: "134327", name: "Varanasi", tagline: "Ghats & Ganga Aarti", image: destinationPhoto("134327") },
  { id: "131679", name: "Delhi", tagline: "Mughal lanes & bazaars", image: destinationPhoto("131679") },
  { id: "6a6129112b3d15826864654c", name: "Goa", tagline: "Forts, churches & coast", image: destinationPhoto("6a6129112b3d15826864654c") },
  { id: "57933", name: "Bengaluru", tagline: "Gardens & heritage", image: destinationPhoto("57933") },
  { id: "57601", name: "Agra", tagline: "Taj Mahal & Mughal forts", image: destinationPhoto("57601") },
  { id: "132201", name: "Jaipur", tagline: "The Pink City", image: destinationPhoto("132201") },
  { id: "133024", name: "Mumbai", tagline: "Sea face & Art Deco", image: destinationPhoto("133024") },
  { id: "131517", name: "Chennai", tagline: "Marina & temples", image: destinationPhoto("131517") },
];

export type HeroSlide = { photo: PhotoKey; cityId: string; place: string; caption: string };

/** Home banner slides; the first is the LCP image. */
export const HERO_SLIDES: HeroSlide[] = [
  { photo: "slide-varanasi", cityId: "134327", place: "Varanasi, India", caption: "Ganga Aarti on the ghats" },
  { photo: "slide-jaipur", cityId: "132201", place: "Jaipur, India", caption: "Hawa Mahal, the Palace of Winds" },
  { photo: "slide-goa", cityId: "6a6129112b3d15826864654c", place: "Old Goa, India", caption: "Basilica of Bom Jesus" },
  { photo: "slide-delhi", cityId: "131679", place: "Delhi, India", caption: "Humayun's Tomb" },
];

export const HERO_CITY_CHIPS = FEATURED_CITIES.filter((c) =>
  ["Varanasi", "Delhi", "Goa", "Jaipur", "Bengaluru"].includes(c.name)
);
