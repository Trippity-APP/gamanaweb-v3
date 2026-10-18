/**
 * In-memory web session (decision 20). The access token never touches browser storage;
 * the refresh token lives in the httpOnly `gmn_rt` cookie set by /api/v1/auth/web/*.
 * Only the `gmn_session_hint` boolean is persisted, so auth-dependent UI can show
 * skeletons instead of flashing the logged-out state while the session is restored.
 */

export interface WebSession {
  accessToken: string;
  sessionId: string;
  expiresAt: number | null;
}

const SESSION_HINT_KEY = "gmn_session_hint";

let current: WebSession | null = null;

export const sessionEvents = typeof window !== "undefined" ? new EventTarget() : null;

export const SESSION_EXPIRED_EVENT = "session:expired";
export const SESSION_CHANGED_EVENT = "session:changed";

export function getSession(): WebSession | null {
  return current;
}

export function setSession(next: { accessToken: string; sessionId: string; expiresIn?: number | null }) {
  current = {
    accessToken: next.accessToken,
    sessionId: next.sessionId,
    expiresAt: next.expiresIn ? Date.now() + next.expiresIn * 1000 : null,
  };
  setSessionHint(true);
  sessionEvents?.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function clearSession() {
  current = null;
  setSessionHint(false);
  sessionEvents?.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function hasSessionHint(): boolean {
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setSessionHint(on: boolean) {
  try {
    if (on) window.localStorage.setItem(SESSION_HINT_KEY, "1");
    else window.localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Storage disabled — the hint is only a UX optimisation.
  }
}
