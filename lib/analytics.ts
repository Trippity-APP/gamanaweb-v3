declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackEvent(
  event: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...params,
  });
}

export const STORE_URLS = {
  play: "https://play.google.com/store/apps/details?id=com.agent.gamana.ai",
  apple: "https://apps.apple.com/in/app/gamana-ai/id6748155654",
} as const;

export function trackStoreClick(store: "play" | "apple", source: string) {
  trackEvent("store_click", { store, source });
}
