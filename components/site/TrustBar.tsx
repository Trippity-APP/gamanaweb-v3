import type { LucideIcon } from "@/components/icons";
import { Download, Headphones, Languages, MapPin, WifiOff } from "@/components/icons";
import { cn } from "@/lib/utils";

const DEFAULT_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Download, label: "Free to download" },
  { icon: WifiOff, label: "Works offline" },
  { icon: MapPin, label: "GPS-triggered stories" },
  { icon: Languages, label: "7 languages" },
  { icon: Headphones, label: "Hands-free listening" },
];

export function TrustBar({
  items = DEFAULT_ITEMS,
  className,
}: {
  items?: { icon: LucideIcon; label: string }[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-ink-soft",
        className
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-600" weight="fill" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
