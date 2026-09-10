/** Placeholder dynamic segment for static-export SPA shells (no brackets — serve path matching breaks on `[id]`). */
export const STATIC_SPA_PARAM = "__spa__";

/** True for current or legacy static-export placeholder params. */
export function isStaticSpaParam(value: string | null | undefined): boolean {
  return value === STATIC_SPA_PARAM || value === "[id]" || value === "[slug]";
}
