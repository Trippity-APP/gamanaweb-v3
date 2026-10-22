import { libraryUnlockSchema, type LibraryUnlock } from "@/lib/api/schemas/library";

type Row = Record<string, unknown>;

function rows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.filter((r): r is Row => r !== null && typeof r === "object");
  if (value && typeof value === "object") {
    const items = (value as { items?: unknown; data?: unknown }).items ?? (value as { data?: unknown }).data;
    if (Array.isArray(items)) return rows(items);
  }
  return [];
}

function parseRow(row: Row): LibraryUnlock | null {
  const parsed = libraryUnlockSchema.safeParse(row);
  return parsed.success ? parsed.data : null;
}

/**
 * Free places come back with `expires_at: null`; only paid unlocks (with an
 * expiry) and web unlocks still waiting for their first app open count.
 */
function isPaidUnlock(u: LibraryUnlock): boolean {
  return Boolean(u.expires_at) || u.activation_status === "pending";
}

/** `GET /api/v2/library/unlocks` → `{ places: [...], storylists: [...] }` (ids and expiry only). */
export function parseLibraryUnlocks(data: unknown): { places: LibraryUnlock[]; storylists: LibraryUnlock[] } {
  const doc = data && typeof data === "object" && !Array.isArray(data) ? (data as Row) : {};
  const parse = (value: unknown) =>
    rows(value)
      .map(parseRow)
      .filter((u): u is LibraryUnlock => u !== null && isPaidUnlock(u));
  return {
    places: parse(doc.places).filter((u) => u.place_id),
    storylists: parse(doc.storylists).filter((u) => u.storylist_id),
  };
}

/** `GET /api/v2/tours/mine` cards → the same shape as a storylist unlock. */
export function parseToursMine(data: unknown): LibraryUnlock[] {
  return rows(data)
    .map((card) =>
      parseRow({
        ...card,
        storylist_id: card.id ?? card._id,
        image_url: card.image_url ?? card.cover_image_url,
      }),
    )
    .filter((u): u is LibraryUnlock => u !== null && Boolean(u.storylist_id));
}

function key(u: LibraryUnlock): string {
  return String(u.place_id ?? u.storylist_id ?? u.id ?? u._id ?? "");
}

/** First occurrence of each id wins, but display fields missing on it are filled from later ones. */
export function mergeUnlocks(...lists: LibraryUnlock[][]): LibraryUnlock[] {
  const byId = new Map<string, LibraryUnlock>();
  for (const u of lists.flat()) {
    const id = key(u);
    if (!id) continue;
    const seen = byId.get(id);
    byId.set(
      id,
      seen
        ? { ...seen, title: seen.title ?? u.title, image_url: seen.image_url ?? u.image_url, city: seen.city ?? u.city }
        : u,
    );
  }
  return Array.from(byId.values());
}

/**
 * Unlocking a walk also unlocks each stop as a place, and `/library/unlocks` doesn't say which
 * places came from a walk. Those stops belong to the walk row, not the Stories list.
 */
export function withoutWalkStops(places: LibraryUnlock[], walkStopIds: Set<string>): LibraryUnlock[] {
  if (walkStopIds.size === 0) return places;
  return places.filter((u) => !walkStopIds.has(key(u)));
}

export type DisplayData = { title?: string | null; image_url?: string | null; city?: string | null };

/** Unlock rows carry only ids; fill title, image and city from the public catalogue. */
export function withDisplayData(list: LibraryUnlock[], lookup: Map<string, DisplayData>): LibraryUnlock[] {
  return list.map((u) => {
    const extra = lookup.get(key(u));
    if (!extra) return u;
    return {
      ...u,
      title: u.title || extra.title || undefined,
      image_url: u.image_url || extra.image_url || undefined,
      city: u.city || extra.city || undefined,
    };
  });
}
