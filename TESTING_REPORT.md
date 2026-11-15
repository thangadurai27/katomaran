# SnapLink AI — Testing Report

All results below come from **actual executed tests** against this repository and the live production deployment (frontend `katomaran-eight.vercel.app`, backend `katomaran-y789.onrender.com`). Anything that was **not** tested is explicitly listed as such — nothing is claimed without evidence.

**Last updated:** 2026-11-15 · Backend version marker: `1.1.0` (exposed by `GET /health`)

---

## 1. Build & Startup

| Test | Method | Result |
|------|--------|--------|
| Frontend production build | `npm run build` (Vite) | ✅ **Pass** — completes with PWA `generateSW` precache (~70 entries, ~1.3 MB), outputs `dist/` + `sw.js` |
| Backend module syntax | `node --check` on every modified module (`server.js`, `db.js`, `demoSeed.js`, auth/user controllers, `User.model.js`, `auth.helpers.js`) | ✅ **Pass** |
| Backend boot + DB connect | Render deploy logs + `/health` polling | ✅ **Pass** — `mongo: connected` |
| Boot-time demo seeding | `/health` → `demoSeedStatus` | ✅ **Pass** — `ok`; earlier failure (`Notification is not defined`) was caught by this probe and fixed |
| Health endpoint | `GET /health` | ✅ **Pass** — returns `status`, `service`, `mongo`, `demoSeed`, `demoSeedStatus`, `timestamp`, `version` |
| Backend automated tests | — | ⚠️ **Not tested** — the backend has no test script or test suite (`backend/package.json` defines only `start` and `dev`) |

---

## 2. Authentication

| Test | Method | Result |
|------|--------|--------|
| Demo login issues real JWT | `POST /api/auth/login` with demo credentials | ✅ **Pass** — `message: "Login successful!"`, `accessToken` returned (171 chars), `isDemo: true`, `plan: free`, refresh cookie set |
| Demo login via UI | Playwright: fresh browser → `/login` → click **🚀 Try Demo Account** | ✅ **Pass** — navigates to `/dashboard/overview`, toast shown, header shows **Demo** badge and "Demo User" |
| Manual login flow | Browser session with real user credentials (previous deploy cycle) | ✅ **Pass** |
| Signup flow | Browser session (previous deploy cycle) | ✅ **Pass** |
| Token refresh | `POST /api/auth/refresh-token` | ⚠️ **Not directly tested** this cycle — mechanism verified in code (httpOnly cookie + separate `JWT_REFRESH_SECRET`) |
| Email verification / password reset emails | — | ⚠️ **Not tested** — no SMTP credentials in the live environment; without `EMAIL_*` vars the backend skips sending and logs links instead |
| Brute-force lockout | Live test during development | ✅ **Observed** — repeated failed logins returned `423 Locked`; for the demo account this is intentionally bypassed (public credentials) and auto-unlocked on boot |

---

## 3. Demo Account & Data Isolation

| Test | Method | Result |
|------|--------|--------|
| Demo data seeded | API calls with demo JWT | ✅ **Pass** — 6 links total (5 seeded samples + 1 pre-existing owner link preserved), 3 campaigns, 6 QR codes, 6 notifications |
| Sample link details | `GET /api/links` | ✅ **Pass** — e.g. "Product Launch — SnapLink AI" 324 clicks, "Summer Sale" 187 clicks, "Blog: 10 Link Tracking Tips" 52 clicks **and expired** |
| Analytics from seeded visits | `GET /api/analytics/overview?days=7` | ✅ **Pass** — 533 total / 325 unique clicks, 3 device groups, 8 daily buckets |
| QR codes present on links | `GET /api/links` → `qrCode.url` field | ✅ **Pass** — all 6 links have real QR data-URLs |
| **Demo cannot change password** | `PUT /api/users/change-password` with demo JWT | ✅ **Pass** — `403` "The demo account password cannot be changed." |
| **Demo cannot delete account** | `DELETE /api/users/account` with demo JWT | ✅ **Pass** — `403` "The demo account is shared and cannot be deleted." |
| **Demo cannot read foreign data** | `GET /api/links/<nonexistent-id>` with demo JWT | ✅ **Pass** — `404` (ownership scoping) |
| **Demo password reset blocked** | `POST /api/auth/forgot-password` for demo email | ✅ **Pass** — generic response ("If an account exists…"), no reset email path taken; reset endpoint additionally rejects demo users with `403` |
| Demo data reset mechanism | Render restart | ✅ **Verified by design + observed** — seeding is idempotent (only missing items created); deleted demo data re-appears on next boot |
| Demo cannot exceed its own data | — | ✅ **Pass by architecture** — every list/write query is scoped to `req.user._id` |

---

## 4. Links, Redirect & Tracking

| Test | Method | Result |
|------|--------|--------|
| Create link (API) | Development testing | ✅ **Pass** — nanoid short code generated, `shortUrl` rendered from `SHORT_URL_BASE` |
| Create link (UI, demo account) | Playwright: create-link form → My Links | ✅ **Pass** — new link visible in the list |
| Redirect engine (production) | `GET /r/:shortCode` on expired demo link | ✅ **Pass** — redirected to the `/expired` page instead of the destination (expiry enforcement confirmed live) |
| Redirect rule checks | Code review of `redirect.controller.js` | ✅ **Verified in source** — inactive, scheduled, password (bcrypt + `x-link-password` header/query `p`), geo allowed/blocked lists, mobile device restriction, one-time deactivation |
| Visit recording | `Visits` collection + link stats | ✅ **Verified live** — seeded visits appear in analytics; redirect increments `stats.totalClicks`/`uniqueClicks` asynchronously |
| Unique-click deduplication | Hashed-IP check in redirect controller | ✅ **Verified in source** (not independently measured with repeated clicks this cycle) |
| Real-time events | Socket.io `link:created` emit on creation | ✅ **Verified in source** |
| Trash semantics | Code review + UI test (demo session) | ✅ **Pass** — delete sets `isTrashed: true, isActive: false`; list filters `?trashed=true`; restore clears it and fires a "Link restored" notification |

---

## 5. Analytics, AI & Other Features

| Test | Method | Result |
|------|--------|--------|
| Analytics overview + per-link | API (`/api/analytics/overview`) and dashboard UI | ✅ **Pass** — totals, device/country/browser/referrer breakdowns, daily series |
| Realtime analytics | `/api/analytics/realtime` via dashboard | ✅ **Pass** — loads without errors in the final sweep |
| AI endpoints | `/api/ai/*` (7 endpoints, AI rate-limited) | ✅ **Endpoints verified in source + AI insights page loads with demo data**; individual Gemini response quality **not exhaustively tested** |
| QR generation endpoints | `POST /api/qr/generate`, `/generate-svg` | ✅ **Verified in source**; seeded QR codes verified live via API |
| Campaigns | `GET /api/campaigns` with demo JWT | ✅ **Pass** — 3 seeded campaigns with UTM params and cached stats |
| Notifications | `GET /api/notifications` | ✅ **Pass** — 6 items, unread count returned |
| Bulk / export / teams / activity | Route files reviewed; dashboard pages load in browser sweep | ✅ **Pages load with zero errors**; full functional deep-dive ⚠️ **not exhaustively tested** |
| Admin routes | Source review (`requireAdmin` middleware) | ⚠️ **Not tested** — no admin user exercised |

---

## 6. Frontend E2E (Playwright, production deployment)

Fresh browser sessions (headless Chromium, 1440×900) against the deployed site:

| Sweep | Pages | Console errors |
|-------|-------|----------------|
| Full demo tour | landing, login (demo section + button visible), dashboard, links, analytics, QR, campaigns, notifications | **0** |
| Post-redeploy sweep | analytics, AI insights, overview | **0** |
| Create-link flow | create-link → My Links shows the new link | **0** |

Notes:

- One intermediate sweep recorded 5 CORS errors on `/api/analytics/*` — this occurred **during an active Render redeploy window** (mid-deploy downtime), not a configuration issue; the follow-up sweep after the deploy settled showed **0 errors**.
- CORS for regular traffic: frontend origin (`katomaran-eight.vercel.app`) is whitelisted via `FRONTEND_URL`/`CLIENT_URL`; no wildcard CORS.

---

## 7. Security Verification Summary

| Control | Evidence |
|---------|----------|
| Password hashing | bcrypt via `User.model.js` pre-save hook; `password` field `select: false` |
| JWT architecture | Two secrets required at boot (`MISSING_JWT_SECRET` fail-fast verified); access 15m / refresh 7d defaults; httpOnly refresh cookie (`SameSite=None; Secure` in production) |
| Route protection | All 16 route files reviewed — every data router is behind `protect`; admin additionally `requireAdmin` |
| Rate limiting | Global on `/api/*` + dedicated `authLimiter` and `aiLimiter` (verified in route files) |
| CORS | Strict whitelist from `FRONTEND_URL`/`CLIENT_URL` — no unrestricted CORS |
| Input validation | URL validation before link creation; express-validator on the backend, Zod on frontend forms |
| Secrets hygiene | No `.env` files committed (`.gitignore`); all docs use placeholders only |
| Demo account hardening | Credential change/delete blocked (403 verified), lockout cleared on boot, generic forgot-password response, data isolated by ownership scoping |

---

## 8. Explicitly Not Tested / Known Gaps

- ❗ No automated backend test suite exists (`npm test` is not defined) — all verification was manual/API/browser-based
- Email sending (verification, password reset, team invites) — no SMTP configured in production
- Refresh-token rotation under real expiry conditions
- Admin endpoints with an admin user
- Load/performance testing
- Cross-browser testing beyond Chromium
- Accessibility audit

---

## 9. Environment

| Item | Value |
|------|-------|
| Node | 20.x |
| Frontend build tool | Vite (React 19) |
| Backend | Express 5, Mongoose 9, MongoDB Atlas (free tier) |
| Deployment | Vercel (frontend) · Render (backend) |
| E2E tooling | Playwright (headless Chromium, fresh contexts) |
