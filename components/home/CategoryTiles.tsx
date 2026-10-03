import Link from "next/link";
import { GamanaCoinIcon } from "@/components/GamanaCoinIcon";
import { Building2, CloudDownload, Footprints, Headphones, Mic } from "@/components/icons";
import { IconTile, type IconTone, type TileIcon } from "@/components/icons/IconTile";

const TILES: { label: string; href: string; icon: TileIcon; tone: IconTone }[] = [
  { label: "Audio Walks", href: "/marketplace/tours/", icon: Footprints, tone: "teal" },
  { label: "Audio Stories", href: "/marketplace/story/", icon: Headphones, tone: "sunset" },
  { label: "Cities", href: "/cities/", icon: Building2, tone: "lilac" },
  { label: "Virtual Guides", href: "/features/virtual-travel-guides/", icon: Mic, tone: "mint" },
  { label: "Gamana Coins", href: "/features/gamana-coins/", icon: GamanaCoinIcon, tone: "sand" },
  { label: "Offline Listening", href: "/features/truly-immersive/", icon: CloudDownload, tone: "teal" },
];

/** Klook-style shortcut row that overlaps the bottom of the home banner. */
export function CategoryTiles() {
  return (
    <nav aria-label="Browse Gamana" className="relative z-10 -mt-8">
      <ul className="mx-auto grid max-w-[1160px] grid-cols-3 gap-2 px-4 sm:gap-3 sm:px-6 lg:grid-cols-6 lg:px-8">
        {TILES.map(({ label, href, icon, tone }) => (
          <li key={href}>
            <Link
              href={href}
              className="focus-ring group flex h-full min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white p-3 text-center shadow-card transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:text-left lg:flex-col lg:justify-center lg:gap-2 lg:px-2 lg:py-4 lg:text-center"
            >
              <IconTile
                icon={icon}
                tone={tone}
                size="sm"
                className="h-10 w-10 shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110"
              />
              <span className="min-w-0 text-balance text-sm font-semibold leading-tight text-ink">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
