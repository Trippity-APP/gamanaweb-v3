import Link from "next/link";
import { Globe, Headphones, Map, Compass } from "lucide-react";

const links = [
  { label: "Explore all cities", href: "/cities", icon: Globe },
  { label: "How Gamana works", href: "/features/user-generated-tours", icon: Compass },
  { label: "Self-guided tours", href: "/blog/self-guided-walking-tour-app-explore-any-city-smarter-easier-and-your-way", icon: Map },
  { label: "AI audio guides", href: "/blog/how-audio-guide-ai-is-transforming-the-way-we-discover-places", icon: Headphones },
];

export default function InternalLinkingWidget() {
  return (
    <section className="my-12 py-8 border-t border-gray-100">
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
        Explore more
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#159895]/40 hover:text-[#1A5F7A] hover:bg-[#159895]/5 transition-colors"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
