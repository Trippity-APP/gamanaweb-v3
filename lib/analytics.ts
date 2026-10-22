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

/** Product events (spec §10.3). Never pass PII: no names, emails, phones or tokens. */
export type AnalyticsEvent =
  | "login_view"
  | "login_method_selected"
  | "login_success"
  | "login_error"
  | "login_org_user"
  | "experience_list_view"
  | "experience_card_click"
  | "experience_view"
  | "availability_check"
  | "availability_no_slots"
  | "book_now_click"
  | "checkout_view"
  | "checkout_step_complete"
  | "checkout_pay_click"
  | "booking_confirmed"
  | "booking_failed"
  | "wishlist_toggle"
  | "unlock_click"
  | "unlock_insufficient_coins"
  | "unlock_success"
  | "handoff_qr_view"
  | "handoff_open_app_click"
  | "pricing_buy_click"
  | "pricing_checkout_dismissed"
  | "pricing_purchase_success"
  | "pricing_purchase_failed"
  | "home_shelf_impression"
  | "home_shelf_click";

export function track(event: AnalyticsEvent, params?: Record<string, string | number | boolean | undefined>) {
  trackEvent(event, params);
}

export const STORE_URLS = {
  play: "https://play.google.com/store/apps/details?id=com.agent.gamana.ai",
  apple: "https://apps.apple.com/in/app/gamana-ai/id6748155654",
} as const;

export function trackStoreClick(store: "play" | "apple", source: string) {
  trackEvent("store_click", { store, source });
}
