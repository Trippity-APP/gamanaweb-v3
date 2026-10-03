export type Narrator = {
  name: string;
  role: string;
  demographics: string;
  image: string;
  audio: string;
  specialties: string[];
};

export const NARRATORS: Narrator[] = [
  {
    name: "Lewis",
    role: "Analytic Historian",
    demographics: "45-55, Male, British",
    image: "/narrator1.png",
    audio: "/lewis-sample.mp3",
    specialties: ["heritage", "art"],
  },
  {
    name: "Bella",
    role: "Human-Centered Historian",
    demographics: "30-40, Female, American",
    image: "/narrator2.png",
    audio: "/bella-sample.mp3",
    specialties: ["food", "culture"],
  },
  {
    name: "Aria",
    role: "Renaissance Expert",
    demographics: "35-45, Female, American",
    image: "/narrator3.png",
    audio: "/aria-sample.mp3",
    specialties: ["art", "culture"],
  },
  {
    name: "Arjun",
    role: "Systems Historian",
    demographics: "30-40, Male, Indian",
    image: "/narrator4.png",
    audio: "/arjun-sample.mp3",
    specialties: ["heritage", "offbeat"],
  },
  {
    name: "Aarti",
    role: "Indic Historian",
    demographics: "30-35, Female, Indian",
    image: "/narrator6.png",
    audio: "/aarti-sample.mp3",
    specialties: ["spiritual", "heritage"],
  },
  {
    name: "Neerja",
    role: "Punchy Comedian",
    demographics: "30-40, Female, Indian",
    image: "/narrator7.png",
    audio: "/Neerja_intro.mp3",
    specialties: ["offbeat", "sports"],
  },
];
