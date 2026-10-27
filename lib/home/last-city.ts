/**
 * `gmn_last_city` (+ `gmn_last_city_id`) — UI convenience only (allowed by the storage rule):
 * the last city the visitor opened or filtered by, used to pick the personalized home's city.
 */
const LAST_CITY_KEY = "gmn_last_city";
const LAST_CITY_ID_KEY = "gmn_last_city_id";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function readLastCity(): string | null {
  return read(LAST_CITY_KEY);
}

/** `/locations/cities` id of the last city, when it was picked from Gamana's list. */
export function readLastCityId(): string | null {
  return read(LAST_CITY_ID_KEY);
}

export function writeLastCity(name: string | null | undefined, id?: string | number | null): void {
  const value = name?.trim();
  if (!value || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_CITY_KEY, value);
    if (id != null && String(id).trim()) window.localStorage.setItem(LAST_CITY_ID_KEY, String(id).trim());
    else window.localStorage.removeItem(LAST_CITY_ID_KEY);
  } catch {
    // Private mode — ignore.
  }
}

/** "Jaipur, Rajasthan, India" → "Jaipur" (autocomplete results carry region and country). */
export function cityLabel(value: string): string {
  return value.split(",")[0].trim();
}
