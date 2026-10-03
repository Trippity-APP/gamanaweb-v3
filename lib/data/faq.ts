export type FaqSection = {
  id: string;
  title: string;
  faqs: { question: string; answer: string }[];
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    faqs: [
      {
        question: "How do I download and start using Gamana?",
        answer: "Use the link below to find Gamana on the App Store or Google Play, download the app, and sign up. Once you're in, the app will show you nearby places of interest based on your location. Tap on any site, choose a narrator (optional), and hit play to start your audio journey.",
      },
      {
        question: "Do I need an internet connection to use audio narrations?",
        answer: "You need internet to play narrations. If you are in a place with unreliable internet penetration, you can download the narrations and, once downloaded, you can listen completely offline. Perfect for travelers without mobile data access.",
      },
      {
        question: "How does the AI personalization work?",
        answer: "Gamana lets you choose from different narrators who have unique personalities and interests, like history, architecture, art, etc. Over time, we'll recommend content and voices based on your preferences and listening habits.",
      },
    ],
  },
  {
    id: "pricing-plans",
    title: "Pricing & Plans",
    faqs: [
      {
        question: "How does the pricing work?",
        answer: "You can access a limited selection of content for free. To unlock premium stories and walks, buy a one-time coin pack. There's no subscription, and unused coins stay in your wallet.",
      },
      {
        question: "What currencies can I pay with?",
        answer: "Gamana supports payments in local currencies, including USD, EUR, INR and more, depending on your app store and region.",
      },
      {
        question: "Can I get a refund on a coin purchase?",
        answer: "We follow the refund policies of the App Store and Google Play. If you face an issue, reach out to us at support@gamana.app and we'll do our best to help.",
      },
    ],
  },
  {
    id: "features-technology",
    title: "Features & Technology",
    faqs: [
      {
        question: "How accurate is the GPS navigation?",
        answer: "Gamana uses your device's GPS to show nearby places, not to trigger audio automatically (yet). GPS accuracy may vary slightly depending on your phone and signal, but it generally works well in open areas.",
      },
      {
        question: "Does the app work with headphones and speakers?",
        answer: "Absolutely. Gamana works with wired and Bluetooth headphones, earbuds, car speakers, and external speakers, whatever suits your style of exploring.",
      },
      {
        question: "Can I share tours with family and friends?",
        answer: "While content is linked to your account, we're working on family sharing and gift token options. For now, friends can create their own account and explore with their own preferences.",
      },
    ],
  },
  {
    id: "narration-content",
    title: "Narration & Content",
    faqs: [
      {
        question: "Can I request a specific tour or city?",
        answer: "Absolutely! We're always adding new places. Email support@gamana.app with the locations you'd love to see covered.",
      },
      {
        question: "Are the stories historically accurate?",
        answer: "Yes. Our scripts are built using verified sources and research-based prompts, often reviewed or designed with expert input. In cases where legends or myths are told, we clearly flag them as such.",
      },
      {
        question: "How long is each tour or narration?",
        answer: "Most narrations range from 5 to 15 minutes per site. You can mix and match them to create your own route, or listen in short bursts between other activities.",
      },
      {
        question: "How many languages are supported?",
        answer: "Gamana currently supports English, with select tours also available in Hindi, French, Tamil and Spanish. We're actively expanding to more languages based on user demand.",
      },
    ],
  },
  {
    id: "vision-philosophy",
    title: "Vision & Philosophy",
    faqs: [
      {
        question: "Why the name 'Gamana'?",
        answer: "Gamana is a Sanskrit word meaning movement, journey, or path. It reflects our mission: to guide travelers not just through space, but through culture, memory, and meaning.",
      },
      {
        question: "What makes Gamana different from other tour apps?",
        answer: "We focus on depth, storytelling, and personalization, not checklists or trivia. With AI-assisted content, local flavor, and multiple narrator options, Gamana gives you a more human and culturally rich experience. We aim to move humanity to connect through the power of story.",
      },
    ],
  },
];
