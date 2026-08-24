import Link from "next/link";
import type { ArticleRegion } from "@/content/blog/articles";

const regionLabels: Record<string, string> = {
  india: "India",
  europe: "Europe",
  "southeast-asia": "Southeast Asia",
  japan: "Japan",
  "middle-east": "the Middle East",
  americas: "the Americas",
  general: "your next destination",
};

interface Props {
  region?: ArticleRegion;
  title?: string;
}

export default function EndOfArticleCTA({ region, title }: Props) {
  const destination = region ? regionLabels[region] ?? "your next destination" : "your next destination";

  const heading =
    region && region !== "general"
      ? `Use Gamana for your ${destination} trip`
      : "Use Gamana for this trip";

  return (
    <section className="relative py-16 bg-gradient-to-br from-[#1A5F7A]/5 via-white to-[#159895]/5 rounded-3xl my-12 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#159895]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#1A5F7A]/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        <p className="text-sm uppercase tracking-widest text-[#159895] font-semibold mb-3">
          Ready to explore?
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {heading}
        </h2>
        <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
          Download Gamana and get AI-narrated, self-guided walking tours with
          GPS-triggered stories, offline maps, and complete freedom to explore at
          your own pace.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-6">
          <a
            href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Download Gamana on Google Play"
              className="h-14 w-auto"
            />
          </a>
          <a
            href="https://apps.apple.com/in/app/gamana-ai/id6748155654"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-105 transition-transform"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="Download Gamana on the App Store"
              className="h-14 w-auto"
            />
          </a>
        </div>
        <Link
          href="/cities"
          className="text-[#159895] font-semibold hover:text-[#1A5F7A] transition-colors underline underline-offset-4"
        >
          Browse all cities we cover →
        </Link>
      </div>
    </section>
  );
}
