import Image from "next/image";
import type { ReactNode } from "react";
import { Check } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { StoreBadges } from "@/components/site/StoreBadges";
import type { StoreBadgeLabels } from "@/lib/data/nav-config";

type DownloadBandProps = {
  title: ReactNode;
  lead?: ReactNode;
  source: string;
  keyword?: string;
  badgeLabels?: StoreBadgeLabels;
  points?: string[];
  image?: { src: string; alt: string; title?: string };
  /** Right-hand column content (e.g. a partner card); takes precedence over `image`. */
  aside?: ReactNode;
};

/** Closing "get the app" band shared across pages. */
export function DownloadBand({
  title,
  lead,
  source,
  keyword,
  badgeLabels,
  points = ["Free to download", "Works offline", "7 languages"],
  image,
  aside,
}: DownloadBandProps) {
  return (
    <section className="section-tight">
      <div className="container-site">
        <Reveal
          variant="scale"
          className="relative isolate overflow-hidden rounded-4xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-6 py-14 text-white shadow-lift sm:px-12 lg:px-16"
        >
          <div
            className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sunset-400/30 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-32 -left-20 -z-10 h-96 w-96 rounded-full bg-brand-400/25 blur-3xl"
            aria-hidden
          />

          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-h2 text-balance">{title}</h2>
              {lead && <p className="text-lead mt-4 max-w-xl text-white/80">{lead}</p>}
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <StoreBadges source={source} keyword={keyword} labels={badgeLabels} size="lg" className="mt-8" />
            </div>
            {aside}
            {!aside && image && (
              <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-xs lg:block">
                <Image
                  src={image.src}
                  alt={image.alt}
                  title={image.title}
                  fill
                  sizes="320px"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
