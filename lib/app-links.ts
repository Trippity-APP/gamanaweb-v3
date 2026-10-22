import { PLAY_STORE_URL } from "@/lib/data/nav-config";

const ANDROID_PACKAGE = "com.agent.gamana.ai";

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

/**
 * Android only verifies `shareable.gamana.app` in the current app build, so an https link to
 * www.gamana.app stays in the browser. An explicit intent opens the app when it is installed
 * and falls back to the Play Store otherwise.
 */
export function androidIntentUrl(link: string): string {
  const url = new URL(link);
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
}

/** Try to open `link` in the Gamana app. iOS relies on the universal link (AASA). */
export function openInApp(link: string): void {
  window.location.href = isAndroid() ? androidIntentUrl(link) : link;
}
