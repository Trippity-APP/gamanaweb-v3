# Gamana website

Public website for [www.gamana.app](https://www.gamana.app) — Next.js 16, static export (`output: 'export'`).

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Before opening a PR: `npm run typecheck && npm run lint && npm run build`.

## API proxy

The browser always calls the backend same-origin (`/api/v1/*`, `/api/v2/*`) so the httpOnly refresh cookie stays first-party and CORS never applies. The proxy lives in three places and must stay in sync:

- `next.config.js` rewrites — `next dev`
- `scripts/serve-out.mjs` — Railway (`npm start`)
- `vercel.json` rewrites — Vercel

## Environment variables

| Var | Example | Used for |
|---|---|---|
| `API_PROXY_TARGET` | `https://api-beta.gamana.app` | runtime proxy |
| `NEXT_PUBLIC_API_URL` | `https://api-beta.gamana.app/api/v1` | build-time fetches |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Google Identity Services |
| `NEXT_PUBLIC_APPLE_SERVICES_ID` | `app.gamana.web` | Sign in with Apple JS |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI` | `https://www.gamana.app/login/` | Apple popup flow |
| `NEXT_PUBLIC_WEB_ACCOUNTS` | `1` | feature flag for all logged-in features (`0` in production until rollout) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.gamana.app` | return URLs, canonical |
| `NEXT_PUBLIC_API_MOCKS` | `1` | dev-only mock API (needs `NEXT_PUBLIC_WEB_ACCOUNTS=1`); never set in production |
| `NEXT_PUBLIC_WEB_COIN_CHECKOUT` | `1` | Razorpay coin packs on `/pricing` (needs `NEXT_PUBLIC_WEB_ACCOUNTS=1` and the backend's `/payments/razorpay/packs/*`); Razorpay keys live on the backend only |

## Mock API (dev only)

With `NEXT_PUBLIC_WEB_ACCOUNTS=1` and `NEXT_PUBLIC_API_MOCKS=1`, every logged-in flow runs without backend changes:

- Authenticated endpoints (auth, profile, coins, passbook, personalization, wishlist, unlocks, collection, checkout, bookings, reviews) are answered by `lib/api/mock/*`.
- Public endpoints that may be missing on a given environment (availability, order summary, pickup places, booking questions, coin packages, catalogs) try the real API first and fall back to the mock.
- Log in with any phone number and OTP `123456`. Promo code `WELCOME10` adds 10 coins.
- Experience payments redirect to `/dev/mock-pay/`, where you choose success, declined card or cancel.
- Mock state lives in sessionStorage `gmn_mock_db` (the one documented exception to "no data in browser storage"). The orange pill in the corner resets it.

The hook is `lib/api/transport.ts`; with the flag off the mock code is never loaded.

## Branches

Never commit or push to `main`, `dev` or `webux`. Work on `web-accounts/*` branches and open a PR into `web-accounts/integration`. `.githooks/pre-push` blocks pushes to live branches once you run `git config core.hooksPath .githooks`.
