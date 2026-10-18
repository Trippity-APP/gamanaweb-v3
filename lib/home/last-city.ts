/**
 * `gmn_last_city` — UI convenience only (allowed by the storage rule): the last city the
 * visitor opened or filtered by, used to pick the personalized home's city shelf.
 */
const LAST_CITY_KEY = "gmn_last_city";

export function readLastCity(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LAST_CITY_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function writeLastCity(name: string | null | undefined): void {
  const value = name?.trim();
  if (!value || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_CITY_KEY, value);
  } catch {
    // Private mode — ignore.
  }
}

/** "Jaipur, Rajasthan, India" → "Jaipur" (autocomplete results carry region and country). */
export function cityLabel(value: string): string {
  return value.split(",")[0].trim();
}
