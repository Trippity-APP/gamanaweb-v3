import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "@/components/site/ResponsiveImage";
import type { CityImage } from "@/lib/city-image";

type CityTileProps = {
  href: string;
  name: string;
  country?: string;
  image: CityImage;
  meta?: string;
  className?: string;
};

const SIZES = "(min-width: 640px) 17rem, 15rem";

/** Portrait (4:5) destination tile with zoom-on-hover, sized for CardRail or grids. */
export function CityTile({ href, name, country, image, meta, className }: CityTileProps) {
  const imageClass = "object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110";
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring group relative block aspect-[4/5] w-[15rem] overflow-hidden rounded-3xl bg-ink shadow-card transition-shadow duration-500 hover:shadow-lift sm:w-[17rem]",
        className
      )}
    >
      {image.photo ? (
        <ResponsiveImage image={image.photo} alt={image.alt} title={image.title} sizes={SIZES} fill className={imageClass} />
      ) : (
        <Image src={image.src} alt={image.alt} title={image.title} fill sizes={SIZES} className={imageClass} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" aria-hidden />
      <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100 group-focus-visible:opacity-100">
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        {meta && (
          <span className="mb-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
            {meta}
          </span>
        )}
        <h3 className="font-display text-2xl font-bold leading-tight">{name}</h3>
        {country && <p className="text-sm text-white/75">{country}</p>}
      </div>
    </Link>
  );
}
