import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

import type { RouteCTA } from "@/lib/data/route-ctas";

interface Props {
  route: RouteCTA;
}

export default function RouteCTAModule({ route }: Props) {
  return (
    <section className="relative rounded-2xl border border-[#159895]/20 bg-gradient-to-br from-[#159895]/5 to-[#1A5F7A]/5 p-6 sm:p-8 my-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#159895]/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[#1A5F7A] mb-2">
          <MapPin className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            Route Collection
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {route.heading}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-5 max-w-2xl leading-relaxed">
          {route.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {route.cities.map((city) => (
            <Link
              key={city.name}
              href={city.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#159895]/20 text-sm font-medium text-[#1A5F7A] hover:border-[#159895]/40 hover:bg-[#159895]/5 transition-colors"
            >
              <MapPin className="h-3 w-3" />
              {city.name}
            </Link>
          ))}
        </div>
        <Link
          href={route.ctaLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A5F7A] text-white font-semibold text-sm hover:bg-[#159895] transition-colors"
        >
          {route.ctaText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
