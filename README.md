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

## Branches

Never commit or push to `main`, `dev` or `webux`. Work on `web-accounts/*` branches and open a PR into `web-accounts/integration`. `.githooks/pre-push` blocks pushes to live branches once you run `git config core.hooksPath .githooks`.
