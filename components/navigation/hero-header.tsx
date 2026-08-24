import SiteHeader from "@/components/navigation/site-header";

/** Transparent header for hero sections */
export default function HeroHeader({
  transparent = true,
}: {
  transparent?: boolean;
}) {
  return <SiteHeader variant={transparent ? "transparent" : "solid"} />;
}
