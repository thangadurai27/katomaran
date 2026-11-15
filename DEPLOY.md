# Deploy SnapLink AI — Complete Guide

Deploy the full stack from zero:

| Component | Platform | Root directory |
|-----------|----------|----------------|
| Frontend (React SPA) | [Vercel](https://vercel.com) | `frontend/` |
| Backend (Express API) | [Render](https://render.com) | `backend/` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — |

**Reference deployment (this repository):**

- Frontend: https://katomaran-eight.vercel.app
- Backend: https://katomaran-y789.onrender.com (health: [/health](https://katomaran-y789.onrender.com/health))
- Short links: `https://<backend-host>/r/{shortCode}`

---

## A. MongoDB Atlas

1. **Create an account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free M0 tier is enough).
2. **Create a cluster** — choose the free tier and the region closest to your Render region (e.g. both in `Oregon` / `Frankfurt`) to cut cold-start latency.
3. **Create a database user** — Database Access → *Add New Database User* → password authentication. Use a strong password.
4. **Configure network access** — Network Access → *Add IP Address* → **Allow Access from Anywhere** (`0.0.0.0/0`). Render's egress IPs are dynamic, so a fixed allow-list won't work on the free plan.
5. **Get the connection string** — Database → *Connect* → *Drivers* → copy the SRV string.
6. **Configure `MONGODB_URI`** — replace `<user>`/`<password>` and **URL-encode special characters** in the password:

   | Character | Encoded |
   |-----------|---------|
   | `@` | `%40` |
   | `#` | `%23` |
   | `%` | `%25` |

   Example: password `Snaplink@123` → `mongodb+srv://user:Snaplink%40123@cluster0.xxxxx.mongodb.net/snaplink?retryWrites=true&w=majority`

   > The backend detects an unencoded `@` in the password at boot and fails fast with a clear message (see `backend/src/configs/db.js`).

7. **Verify connectivity** — after the backend deploys, `GET /health` must report `"mongo": "connected"`.

---

## B. Backend on Render

1. **Connect the repository** — Render Dashboard → *New* → *Web Service* → pick your GitHub repo.
2. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Node version | `20.x` (set via `engines` in `backend/package.json` or `NODE_VERSION=20`) |
   | Health Check Path | `/health` |

3. **Set environment variables** (Render → *Environment*):

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `MONGODB_URI` | your Atlas string | **required** |
   | `JWT_SECRET` | long random string | **required** — boot fails without it |
   | `JWT_REFRESH_SECRET` | *different* long random string | **required** |
   | `FRONTEND_URL` | `https://your-app.vercel.app` | **required** — CORS origin + email link base, no trailing slash |
   | `CLIENT_URL` | `https://your-app.vercel.app` | additional allowed origin |
   | `SHORT_URL_BASE` | `https://your-backend.onrender.com/r/` | used for `shortUrl` fields and QR targets |
   | `NODE_ENV` | `production` | secure cookies, production log level |
   | `GEMINI_API_KEY` | your key from [AI Studio](https://aistudio.google.com/apikey) | optional — AI endpoints degrade gracefully |
   | `GEMINI_MODEL` | `gemini-2.5-flash` | optional |
   | `EMAIL_*` (HOST/PORT/USER/PASS/FROM) | SMTP credentials | optional — verification/reset emails are skipped and logged without them |
   | `BCRYPT_ROUNDS` | `10` | optional |
   | `JWT_EXPIRE` / `JWT_REFRESH_EXPIRE` | `15m` / `7d` | optional |
   | `MONGODB_DB_NAME` | db name | optional override |

   Generate secrets locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

4. **Deploy** and watch the logs. Expected startup sequence:
   ```
   MongoDB connected - API routes will function normally
   Demo account ready (demo@gmail.com).
   ```
5. **Demo account seeding** — on every boot, after MongoDB connects, `backend/src/utils/demoSeed.js` runs (`ensureDemoAccount()` called from `src/server.js`):
   - Creates the shared demo user `demo@gmail.com` (plan `free`, `isDemo: true`) with a **bcrypt-hashed** `demo123` password — never stored in plain text.
   - If the email already exists with different credentials (e.g. an old signup), it is **reclaimed**: password reset to `demo123`, name set to "Demo User", demo flags forced.
   - Any brute-force lockout on the public account is cleared on every boot.
   - Seeds missing demo data idempotently (only what's absent): 5 sample links (one expired) with real QR codes, ~870 visit records across 14 days, 3 campaigns, notifications and activity logs. Already-present data is never duplicated; data you delete from the demo account during testing is re-created on the next deploy/restart — that *is* the reset mechanism.
   - Seed status is observable: `GET /health` returns `demoSeedStatus` (`pending` → `ok` / `error: <reason>`).
   - **To disable seeding in a private deployment:** remove the `ensureDemoAccount()` call in `backend/src/server.js`.
6. **Verify** — `GET https://<backend>/health` → `status: UP`, `mongo: connected`, `demoSeedStatus: ok`; then `POST /api/auth/login` with the demo credentials.
7. **Troubleshooting:**
   - *500 "buffering timed out" on API calls* → MongoDB not connected: check `MONGODB_URI` encoding and Atlas network access.
   - *`MISSING_JWT_SECRET`* → set both JWT secrets.
   - *CORS errors in the browser* → `FRONTEND_URL` missing/wrong or trailing slash; redeploy after fixing.
   - *Cold starts* — free Render instances sleep; the first request after ~15 min idle takes 30–60 s. Keep-alive pings to `/health` (e.g. UptimeRobot) avoid this.
   - *Failed builds* — Render uses the `backend/` root directory; a lockfile/engine mismatch usually means the Node version isn't 20.

---

## C. Frontend on Vercel

1. **Import the repository** — Vercel → *Add New Project* → pick the GitHub repo.
2. **Configure:**

   | Setting | Value |
   |---------|-------|
   | Root Directory | `frontend` |
   | Framework Preset | **Vite** |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. **Environment variables** — none are *required*: `frontend/src/config/env.js` falls back to the deployed Render API in production builds. For your own backend URLs, set at build time:

   | Variable | Example |
   |----------|---------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_BASE_URL` | `https://your-backend.onrender.com` |
   | `VITE_SHORT_URL_BASE` | `https://your-backend.onrender.com/r/` |

   > `VITE_*` values are baked in at **build time** — changing them requires a redeploy.

4. **Deploy**, then verify: landing page loads, `/login` → demo login → dashboard loads data.

---

## D. CORS Configuration

CORS is **whitelist-based** (no wildcards). `backend/src/utils/corsOrigins.js` builds the allowed list from:

- `FRONTEND_URL` — primary origin, also used for email links and redirect fallbacks
- `CLIENT_URL` — additional origins; **comma-separated lists are supported** in both vars

Handled origins for this deployment:

| Origin | Source |
|--------|--------|
| `https://katomaran-eight.vercel.app` | production |
| Vercel preview URLs (`https://<project>-git-*.vercel.app`) | add to `CLIENT_URL` if you need previews to call the API |
| `http://localhost:5173`, `http://localhost:3000` | local development |

Rules to keep in mind:

- **No trailing slashes** on origin values (`https://app.vercel.app`, not `https://app.vercel.app/`).
- Authentication uses cookies (`SameSite=None; Secure` in production), so the frontend origin **must** be whitelisted or login silently fails.
- Never replace the whitelist with `cors()`'s default allow-all in production — the app is deployed with credentials.

---

## E. SPA Routing (React Router on Vercel)

`frontend/vercel.json` ships the correct configuration — direct navigation and page refreshes on deep routes (e.g. `/dashboard/links`) must not 404:

```json
"routes": [
  { "handle": "filesystem" },
  { "src": "/assets/.*", "status": 404 },
  { "src": "/(.*)", "dest": "/index.html" }
]
```

- `filesystem` serves real static files first (hashed JS/CSS, `sw.js`, icons).
- Everything else falls back to `index.html`, where React Router takes over.
- If you deploy elsewhere (e.g. Nginx/Netlify), replicate this as a **catch-all rewrite to `index.html`**.

---

## F. PWA & Service Worker

The frontend is a PWA built with `vite-plugin-pwa` (Workbox `generateSW`):

- **Precache** — all hashed build assets are precached at install time (~1.3 MB / ~70 entries on the current build). Because assets are content-hashed, a new deploy produces new URLs and the SW updates automatically.
- **Cache headers** (from `frontend/vercel.json`):
  - `/assets/*` → `public, max-age=31536000, immutable` (hashed filenames make this safe)
  - `/index.html`, `/sw.js`, `/registerSW.js` → `public, max-age=0, must-revalidate` — **required** so browsers pick up new service workers instead of stale chunks
- **Stale-chunk prevention** — never increase caching on `index.html` or `sw.js`; if users report a stale UI after a deploy, a hard refresh (`Ctrl+Shift+R`) force-checks the SW, and the versioned asset names guarantee consistency.
- **What is NOT cached** — API responses (including auth responses and private user data) are never cached by the service worker; only static build assets are. Navigations fall back to the cached app shell for offline use.

---

## G. Post-Deployment Verification Checklist

Test every item against the live deployment — don't assume. (This exact list was executed on the reference deployment; results in [TESTING_REPORT.md](TESTING_REPORT.md).)

- [ ] **Health** — `/health` returns `status: UP`, `mongo: connected`, `demoSeedStatus: ok`
- [ ] **Landing page** loads, navigation works
- [ ] **Signup** — new account created, redirected to dashboard
- [ ] **Login** — existing account, session survives refresh
- [ ] **Demo login** — `🚀 Try Demo Account` → dashboard with seeded data, no console errors
- [ ] **Dashboard** — stats cards, recent links, charts populated
- [ ] **Create link** — short link generated, visible in My Links
- [ ] **Short URL redirect** — open `https://<backend>/r/{code}` → reaches destination, click counted
- [ ] **Expired link** — redirects to the expired page instead of the destination
- [ ] **QR generation** — QR rendered, downloadable
- [ ] **Analytics** — daily chart, device/country breakdowns, realtime feed
- [ ] **AI chat** — asks a question about your links, responds from real data (needs `GEMINI_API_KEY`)
- [ ] **Notifications** — created on link actions, unread badge counts
- [ ] **Trash** — delete a link → appears in Trash → restore works
- [ ] **Logout** — session cleared, protected routes redirect to login
- [ ] **Page refresh on deep route** (e.g. `/dashboard/analytics`) — no 404
- [ ] **Direct route access** — open `/dashboard/links` in a fresh tab — works (SPA rewrite)
- [ ] **Mobile responsiveness** — layout intact at ~390px width
