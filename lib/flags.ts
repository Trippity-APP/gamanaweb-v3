/**
 * Gates every logged-in feature (login, account, wallet, collection, booking). When off:
 * no Log in button, `/account/*` shows "Coming soon", and experiences "Book now" hands off
 * to the app. Public Experiences browse pages ship regardless.
 */
export const webAccountsEnabled = process.env.NEXT_PUBLIC_WEB_ACCOUNTS === "1";

/**
 * Dev-only: serve endpoints the backend doesn't have yet (web auth, checkout, bookings, web
 * unlock, handoff) from an in-browser mock (`lib/api/mock`). Public catalog calls still hit
 * the real API and only fall back to the mock when they fail. Never enable in production.
 */
export const apiMocksEnabled = webAccountsEnabled && process.env.NEXT_PUBLIC_API_MOCKS === "1";

/**
 * Buy coin packs on /pricing with Razorpay (INR). Needs the backend's
 * `/payments/razorpay/packs/*` endpoints and Razorpay keys on the server. When off, Buy hands
 * off to the app.
 */
export const webCoinCheckoutEnabled = webAccountsEnabled && process.env.NEXT_PUBLIC_WEB_COIN_CHECKOUT === "1";

/**
 * With the USD toggle selected, pay through Stripe Checkout in USD instead of Razorpay in INR.
 * Needs the backend's `/payments/stripe/packs/*` endpoints and Stripe keys on the server. When
 * off, USD prices are shown but charged in INR through Razorpay.
 */
export const webStripeCheckoutEnabled =
  webCoinCheckoutEnabled && process.env.NEXT_PUBLIC_WEB_STRIPE_CHECKOUT === "1";
