/** Placeholder dynamic segment for static-export SPA shells (no brackets — serve path matching breaks on `[id]`). */
export const STATIC_SPA_PARAM = "__spa__";

/** True for current or legacy static-export placeholder params. */
export function isStaticSpaParam(value: string | null | undefined): boolean {
  return value === STATIC_SPA_PARAM || value === "[id]" || value === "[slug]";
}

/**
 * Prefer the id/slug in the browser URL over the baked static-export param.
 * When serve-out rewrites `__spa__` → real id in HTML, paramId is already real;
 * when the shell is served without rewrite, paramId is `__spa__` and the path has the real id.
 */
export function resolveDetailIdFromPath(paramId: string, pathPattern: RegExp): string {
  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(pathPattern);
    const raw = match?.[1];
    if (raw) {
      try {
        const fromPath = decodeURIComponent(raw);
        if (fromPath && !isStaticSpaParam(fromPath)) return fromPath;
      } catch {
        if (raw && !isStaticSpaParam(raw)) return raw;
      }
    }
  }
  return paramId;
}

/**
 * Client should fetch when we have a detail id but no server-provided payload.
 * On the server (static export) we treat any param as "needs client resolve" so the
 * `__spa__` shell SSR's as Loading… — after serve-out rewrites `__spa__` → real id,
 * hydration stays in loading and then fetches instead of flashing "not available".
 */
export function shouldClientFetchDetail(
  paramId: string,
  hasInitial: boolean,
  pathPattern: RegExp,
): boolean {
  if (hasInitial) return false;
  if (!paramId) return false;
  if (typeof window === "undefined") return true;
  const resolved = resolveDetailIdFromPath(paramId, pathPattern);
  return Boolean(resolved && !isStaticSpaParam(resolved));
}
