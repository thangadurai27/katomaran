# Chapter 9 — Deployment & DevOps

## 1. Repository & workflow

- Monorepo on GitHub: `thangadurai27/katomaran`, branches → `main`.
- **CI/CD = git push:** Vercel auto-builds the frontend, Render auto-redeploys the backend on every push to `main`. No GitHub Actions needed (say this and its trade-off: no test gate before deploy).

## 2. Frontend on Vercel

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework | Vite |
| Build command | `npm run build` |
| Output | `dist` |

`frontend/vercel.json` (actual):

```json
"routes": [
  { "handle": "filesystem" },
  { "src": "/assets/.*", "status": 404 },
  { "src": "/(.*)", "dest": "/index.html" }
]
```

- `filesystem` serves real files first; everything else falls back to `index.html` (SPA deep-link refresh fix).
- Headers: `/assets/*` → `max-age=31536000, immutable`; `/index.html`, `/sw.js`, `/registerSW.js` → `max-age=0, must-revalidate`.
- Env vars optional — `frontend/src/config/env.js` falls back to the deployed Render API in prod builds, `localhost:5000` in dev.

## 3. Backend on Render

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build | `npm install` |
| Start | `npm start` (→ `node src/server.js`) |
| Node | 20.x (`engines` in `backend/package.json`) |
| Health check path | `/health` |

Key env vars: `MONGODB_URI` (URL-encoded Atlas password!), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `CLIENT_URL`, `SHORT_URL_BASE`, `NODE_ENV=production`, optional `GEMINI_API_KEY`, `EMAIL_*`, `BCRYPT_ROUNDS`, `JWT_EXPIRE`.

## 4. MongoDB Atlas

- Free M0 cluster; DB user + strong password; **Network Access `0.0.0.0/0`** (Render egress IPs are dynamic).
- Password encoding pitfalls are *actively detected by the code*: `validateMongoUri` in `configs/db.js` tells you to encode `@` as `%40` and validates the SRV host shape.

## 5. Build process details

- Frontend: Vite build emits content-hashed assets + Workbox service worker (`generateSW`, ~70 precache entries, ~1.3 MB).
- Backend: no build step — CommonJS Node app started directly.

## 6. Health check endpoint (`server.js`)

```json
{
  "status": "UP", "service": "SnapLink AI API",
  "mongo": "connected", "demoSeed": "enabled",
  "demoSeedStatus": "ok", "timestamp": "…", "version": "1.1.0"
}
```

Used by Render health checks, uptime monitors, and — crucially — by **us during deploys** to verify seeding (`demoSeedStatus: pending → ok`).

## 7. Render cold starts

Free tier sleeps after ~15 min idle → first request takes 30–60 s. Mitigations: external uptime pings on `/health`; accept latency on hobby tier; or upgrade to a paid always-on instance. This is a classic interview question — connect it to why health checks warm the instance.

## 8. Logs & debugging

- `utils/logger.js` (Winston + morgan in dev): production logs only `warn`+; dev is verbose.
- Render dashboard → Logs tab for boot sequence ("MongoDB connected…", "Demo account ready…", seed errors).
- Frontend failures debugged via browser console; our Playwright sweeps captured console errors during deploy verification.

## 9. PWA service worker in production

- Workbox precaches hashed assets; `skipWaiting + clientsClaim + cleanupOutdatedCaches` for clean updates; `autoUpdate` registration.
- `index.html` is deliberately **not** precached (Vercel serves it; avoids Workbox "non-precached-url" errors — comment in `vite.config.js`).
- Google Fonts: CacheFirst, 1-year expiry, max 10 entries. **API responses are never cached** (auth + private data safety).
- Stale-chunk prevention: immutable hashed assets + must-revalidate `index.html`/`sw.js` means a new deploy produces new asset URLs and browsers pick up the new SW.

## 10. CORS in production (config story)

- Backend whitelist (`utils/corsOrigins.js`): hardcoded production + preview origins, `FRONTEND_URL`/`CLIENT_URL` env values (trailing slash stripped), regex-allowed Vercel previews, localhost ports for dev.
- Cookies require `SameSite=None; Secure` cross-site → that's why credentials CORS must be exact, not wildcard.
- **Real incident:** an intermediate Playwright sweep recorded 5 CORS errors on `/api/analytics/*` — caused by an **active Render redeploy downtime window**, not config; confirmed 0 errors after the deploy settled (documented in `TESTING_REPORT.md`).

## 11. Production errors actually encountered & fixed (all real, from this repo's history)

| Error | Root cause | Fix |
|---|---|---|
| `500` / "buffering timed out" on signup/login | Atlas password misconfiguration / DB not connected | `validateMongoUri` fail-fast + encoded password + `0.0.0.0/0` network access |
| Login worked locally, CORS failed on Render | origin whitelist missing the production URL | `FRONTEND_URL`/`CLIENT_URL` + `corsOrigins.js` |
| Stale JS after deploys (old chunks 404) | cached `index.html`/SW pointing to purged hashed chunks | vercel.json cache headers (must-revalidate shell) + SW `skipWaiting/cleanupOutdatedCaches` |
| Push rejected (non-fast-forward) | remote had newer commits | `git pull --rebase origin main` then push |
| Demo login 401 → 423 saga | (a) deploy not finished, (b) pre-existing `demo@gmail.com` with old password, (c) lockout from public guessing, (d) `connectDB` waiter hang skipping seeding, (e) missing `Notification` import in the seed | reclaim + unlock-on-boot, waiter fix, import fix, `demoSeedStatus` on `/health` |

(Chapter 10 walks the best of these as STAR stories.)

## 12. Deployment verification checklist (executed, results in TESTING_REPORT.md)

Health (`demoSeedStatus: ok`) → landing → signup/login → demo login → dashboard data → create link → `/r/:code` redirect + click counting → expired-link behavior → QR → analytics → AI page → notifications → trash → logout → deep-route refresh → mobile viewport.

## 13. DevOps concepts you can attach to this project

- **Health probes** (`/health` with DB + seed status)
- **Immutable deploys** (hashed assets) vs mutable shell (`index.html`)
- **Environment parity** (dev proxy vs prod CORS)
- **Observability** (structured logs, seed status surfacing — born from a silent-failure incident)
- **Zero-downtime limits** (Render free tier restarts drop sockets briefly; Socket.io auto-reconnects)
