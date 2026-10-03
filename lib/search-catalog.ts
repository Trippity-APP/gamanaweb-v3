import type { SearchTour } from "@/lib/marketplace-data";

let pending: Promise<SearchTour[]> | null = null;

/** Fetches the static search catalog once per page load, shared by every search box. */
export function loadSearchCatalog(): Promise<SearchTour[]> {
  pending ??= fetch("/search-catalog.json")
    .then((res) => (res.ok ? (res.json() as Promise<SearchTour[]>) : []))
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}
