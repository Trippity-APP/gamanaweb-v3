export interface RouteCTA {
  id: string;
  region: string;
  heading: string;
  description: string;
  cities: { name: string; href: string }[];
  ctaText: string;
  ctaLink: string;
}

export const routeCTAs: RouteCTA[] = [
  {
    id: "europe",
    region: "europe",
    heading: "Explore Europe with confidence",
    description:
      "From London's royal landmarks to Barcelona's Gaudí masterpieces, Gamana gives you narrated, self-guided walking tours across Europe's greatest cities.",
    cities: [
      { name: "London", href: "/all-cities" },
      { name: "Barcelona", href: "/all-cities" },
      { name: "Paris", href: "/all-cities" },
      { name: "Rome", href: "/all-cities" },
      { name: "Amsterdam", href: "/all-cities" },
      { name: "Prague", href: "/all-cities" },
    ],
    ctaText: "Start your Europe route",
    ctaLink: "/all-cities",
  },
  {
    id: "southeast-asia",
    region: "southeast-asia",
    heading: "Explore the Southeast Asia Confidence Route",
    description:
      "Singapore, Vietnam, Cambodia and beyond. Walk through markets, temples, and coast with audio in your ears.",
    cities: [
      { name: "Singapore", href: "/all-cities" },
      { name: "Hanoi", href: "/all-cities" },
      { name: "Ho Chi Minh City", href: "/all-cities" },
      { name: "Kuala Lumpur", href: "/all-cities" },
      { name: "Jakarta", href: "/all-cities" },
      { name: "Bangkok", href: "/all-cities" },
    ],
    ctaText: "Start your Southeast Asia route",
    ctaLink: "/all-cities",
  },
  {
    id: "japan",
    region: "japan",
    heading: "Plan your Japan route",
    description:
      "Tokyo's alleyways, Kyoto's temples, Osaka's street food. Hear Japan at your own pace with GPS-triggered audio tours.",
    cities: [
      { name: "Tokyo", href: "/all-cities" },
      { name: "Kyoto", href: "/all-cities" },
      { name: "Osaka", href: "/all-cities" },
    ],
    ctaText: "Start your Japan route",
    ctaLink: "/all-cities",
  },
  {
    id: "turkey",
    region: "turkey",
    heading: "Explore Turkey with more clarity",
    description:
      "Istanbul's bazaars, Byzantine architecture, and Bosphorus views. Hear the city's history as you walk.",
    cities: [
      { name: "Istanbul", href: "/all-cities" },
    ],
    ctaText: "Start your Turkey route",
    ctaLink: "/all-cities",
  },
];

export const getRouteCTAByRegion = (region: string): RouteCTA | undefined =>
  routeCTAs.find((cta) => cta.region === region);

export const getRouteCTAsForIndex = (): RouteCTA[] => routeCTAs;
