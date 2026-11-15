# Chapter 10 — Challenges & Solutions (Real War Stories)

All of these come from this repository's actual history, code comments, and documentation (`TESTING_REPORT.md`, `DEPLOY.md`). Nothing is invented — these are the stories to tell in interviews, in STAR format (Situation, Task, Action, Result).

---

## Challenge 1 — The silently skipped demo seeding (the best story)

**Problem:** After adding a boot-time demo account seeder (`backend/src/utils/demoSeed.js`) called from `server.js` after `connectDB()`, the demo login kept failing in production with `401`, then `423 Locked` — while the code looked correct and all syntax checks passed.

**Root cause (two bugs stacked):**
1. `configs/db.js` — the "already connecting" waiter promise polled `mongoose.connection.readyState` but handled only states `1` (resolve) and `0|3` (retry). **State `2` (connecting) matched neither branch**, so the promise hung forever, the `.then()` callback never fired, and seeding silently never ran.
2. When seeding finally ran, it crashed with `Notification is not defined` (missing import) — swallowed by its own try/catch, so it *still* failed silently.

**Debugging process (this is what interviewers want to hear):**
- Added `demoSeedStatus` to `/health` — made the invisible observable: it reported `pending` forever, then `error: Notification is not defined`.
- That turned a guessing game into a 2-minute fix; then the waiter bug surfaced because the status stayed `pending` even with no error.

**Solution:**
- Rewrote the waiter to always reschedule until connected (`db.js`).
- Imported `Notification`.
- Made seeding **defensive and self-healing**: unlock the account *before* checking credentials, wrap `comparePassword` in try/catch, reclaim drifted credentials, force demo flags + name on every boot.

**Files:** `backend/src/configs/db.js`, `backend/src/utils/demoSeed.js`, `backend/src/server.js`.

**Lessons learned:** (1) "It works locally but not in prod" → make boot-time side effects observable; (2) never let background init fail silently; (3) understand readyState codes (`0 disconnected, 2 connecting, 1 connected, 3 disconnecting`); (4) idempotent seeders are restart-safe by design.

---

## Challenge 2 — Pre-existing `demo@gmail.com` with unknown password

**Problem:** The demo email already existed in the database (an old personal test account "durai") — demo login returned `401`, and repeated public attempts returned `423 Locked` (brute-force lockout on a *publicly advertised* account).

**Root cause:** The seeder only created the user if absent; it neither verified the password nor bypassed lockout for a public account.

**Solution (all in `demoSeed.js` + `auth.controller.js`):**
- Reclaim: if `comparePassword('demo123')` fails, reset the password (bcrypt-hashed via the model hook), set name "Demo User", `isDemo: true`.
- Lockout bypass for demo users at login (`user.isLocked && !user.isDemo`) + boot-time `$unset lockUntil, loginAttempts: 0` — strangers cannot lock everyone out of a public demo.
- Owner's old links preserved, not deleted.

**Lesson:** public credentials are a *product decision* with security implications — guard the account, not just the endpoint.

---

## Challenge 3 — CORS failures between Vercel and Render

**Problem:** API calls from the deployed frontend failed with "No 'Access-Control-Allow-Origin' header" (observed in Playwright sweeps).

**Root causes seen over time:** missing/incorrect `FRONTEND_URL` on Render; trailing-slash origin mismatch; **an active Render redeploy downtime window** (requests died mid-deploy and looked like CORS).

**Solution:** whitelist built in `utils/corsOrigins.js` (constants + `FRONTEND_URL`/`CLIENT_URL` + slash stripping + Vercel-preview regex + localhost); `credentials: true`; httpOnly cookies with `SameSite=None; Secure` for the cross-site case. For deploy-window "CORS" noise: verify after the deploy settles (follow-up sweep: 0 errors).

**Lesson:** distinguish *configuration* CORS errors from *downtime* masquerading as CORS — check whether the failing request is during a deploy.

---

## Challenge 4 — Stale service worker / old chunks after deploys

**Problem:** users (and testing) could load a cached `index.html` referencing purged hashed chunks → blank/404 assets after a new deploy.

**Root cause:** SW + browser caching of the app shell; Workbox config was also precaching `index.html`, causing "non-precached-url" navigation errors.

**Solution (`vite.config.js` + `frontend/vercel.json`):** exclude `index.html` from precache (code comment documents it); `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`; cache headers — hashed `/assets/*` immutable, `index.html`/`sw.js`/`registerSW.js` `must-revalidate`; `lazyWithRetry` (`lib/lazyWithRetry.js`) retries lazy chunks on failure.

**Lesson:** caching strategy = *immutable content + mutable shell*, never the reverse.

---

## Challenge 5 — MongoDB "buffering timed out" (500s on auth)

**Problem:** signup/login returning 500s with `buffering timed out` when Atlas wasn't reachable.

**Root cause:** bad `MONGODB_URI` (unencoded `@` in password, wrong host) and Mongoose buffering commands while disconnected.

**Solution:** `configs/db.js` — `mongoose.set('bufferCommands', false)`; `validateMongoUri` fails fast with *human* hints ("%40", correct SRV host); retries with capped attempts; `requireDb` middleware returns clean errors for `/api/*` while disconnected.

**Lesson:** fail fast with actionable messages beats mysterious 10-second timeouts.

---

## Challenge 6 — Single-flight refresh (race condition)

**Problem:** multiple parallel API calls expiring simultaneously would each fire a refresh → cookie rotation races, intermittent logouts.

**Root cause:** naive per-request refresh in the Axios interceptor.

**Solution (`frontend/src/lib/api.js`):** memoize one `refreshPromise`; all queued 401s await it; the original request retries once (`_retry` flag); session destruction only when refresh is genuinely rejected (401/403), not on network/429. Auth endpoints are excluded from the flow (`AUTH_ENDPOINTS` regex) so a bad password isn't mistaken for an expired session.

**Lesson:** token refresh is a concurrency problem, not just an auth problem.

---

## Challenge 7 — Public redirect must not block on analytics

**Problem:** recording rich per-click analytics (UA parsing, geo lookup, visit insert, stat updates) could slow the visitor's 301.

**Solution (`redirect.controller.js`):** everything after the rule checks happens inside `Visit.create(...).then(...)` — asynchronous, non-blocking; the redirect returns after a single Mongo read. Expensive side effects (notification, socket emit) similarly deferred.

**Lesson:** separate the *latency-critical path* (lookup + 301) from the *eventual-consistency path* (analytics).

---

## Quick-reference table

| # | Challenge | Files | Skill it proves |
|---|---|---|---|
| 1 | Seed skipped silently | `db.js`, `demoSeed.js`, `server.js` | debugging, observability, event-loop states |
| 2 | Demo account reclaim/lockout | `demoSeed.js`, `auth.controller.js` | security thinking |
| 3 | CORS prod/preview/cookies | `corsOrigins.js` | web platform internals |
| 4 | SW stale cache | `vite.config.js`, `vercel.json` | caching + PWA |
| 5 | Buffering timeouts | `db.js`, `requireDb.js` | fail-fast design |
| 6 | Refresh races | `lib/api.js` | concurrency |
| 7 | Redirect hot path | `redirect.controller.js` | performance trade-offs |
