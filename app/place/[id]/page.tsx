import type { Metadata } from "next";
import { PlaceRedirectClient } from "@/components/handoff/PlaceRedirectClient";
import { STATIC_SPA_PARAM } from "@/lib/static-spa";

export const metadata: Metadata = {
  title: "Opening story",
  description: "Opening this Gamana audio story.",
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return [{ id: STATIC_SPA_PARAM }];
}

export default function PlacePage() {
  return <PlaceRedirectClient />;
}
