# SnapLink AI — Feature Inventory

Status legend: **✅ Fully implemented** (verified in source + deployed) · **🟡 Partial** (works with limitations) · **🧪 Legacy/Backend-only** (code exists, removed from UI).

Every claim below was verified against the source code and/or the live deployment (`katomaran-eight.vercel.app` / `katomaran-y789.onrender.com`). See [`../TESTING_REPORT.md`](../TESTING_REPORT.md) for the test evidence.

---

## Core Link Management

| Status | Feature | Verification |
|--------|---------|--------------|
| ✅ | **Smart URL shortening** — nanoid-7 codes, unique index | `Link.model.js` pre-save hook; live redirects |
| ✅ | **Custom aliases** — user-chosen paths, DB-enforced uniqueness | `customAlias` sparse-unique index; redirect resolves alias or code |
| ✅ | **Titles, tags, categories, favorites, pinning** | Link model + My Links UI |
| ✅ | **Expiry** — links expire on a set date | Enforced live: expired demo link redirects to `/expired` |
| ✅ | **Scheduled links** — activate at a future time | Redirect checks `scheduledAt` |
| ✅ | **Password protection** — bcrypt check at redirect via `?p=` or `x-link-password` | `redirect.controller.js` lines 42–52 |
| ✅ | **One-time links** — deactivate after first visit | Redirect deactivates after recording the visit |
| ✅ | **Geo restrictions** — allowed/blocked country lists | Enforced in redirect flow using geoip country codes |
| ✅ | **Device restrictions** — e.g. block mobile | Enforced from parsed user agent |
| ✅ | **Deep links** — Android/iOS app intents per device | Redirect picks `deepLink.android` / `deepLink.ios` |
| ✅ | **UTM forwarding** — campaign params appended to destination | Redirect builds final URL from `utmParams` |
| ✅ | **Archive / trash / restore** — soft-delete lifecycle with a Trash page | `isTrashed` flag + `?trashed=true` listing; restore fires a notification |
| ✅ | **Bulk operations** — multi-select trash/restore | `POST /api/links/bulk` |

## Analytics & Tracking

| Status | Feature | Verification |
|--------|---------|--------------|
| ✅ | **Per-redirect visit records** — device, browser, OS, country/city, referrer, bot flag | `Visit.model.js` + redirect controller |
| ✅ | **Unique-click tracking** — hashed-IP dedup | `ipHash` + `isUnique` |
| ✅ | **Dashboard analytics** — totals, daily series, device/country/browser/referrer breakdowns | Verified live with demo data (533 clicks / 7 days) |
| ✅ | **Per-link analytics** — incl. hourly pattern, top referrers | `/api/analytics/link/:id` |
| ✅ | **Real-time updates** — Socket.io live feed + events | `socketManager`, `link:created` emit |
| ✅ | **Realtime panel** — recent-visits endpoint | `/api/analytics/realtime` loads error-free |

## AI (Google Gemini)

| Status | Feature | Verification |
|--------|---------|--------------|
| ✅ | **AI chat assistant** — answers questions using your real data | `/api/ai/chat`; AI Insights page loads with demo data |
| ✅ | **Analytics insights, performance prediction, URL summaries, slug suggestions, safety checks, campaign suggestions** | 7 endpoints in `ai.routes.js` |
| 🟡 | **Depth of AI quality** — endpoints verified; response quality not exhaustively evaluated | see TESTING_REPORT §5 |
| 🟡 | **Graceful degradation** — works only when `GEMINI_API_KEY` is set; otherwise returns a clear "not configured" error | `configs/gemini.js` |

## Productivity & Teams

| Status | Feature | Verification |
|--------|---------|--------------|
| ✅ | **Campaigns** — group links with UTM defaults, colors, cached stats | 3 seeded campaigns verified live |
| ✅ | **Bulk shortener + CSV import** | `/api/bulk/create`, `/api/bulk/import` (multer + csv-parser) |
| ✅ | **CSV export** — links and analytics | `/api/export/*` (csv-writer) |
| ✅ | **Teams** — create, list, invite by email, remove members | `team.routes.js`; invite acceptance UI 🟡 not built |
| ✅ | **Notifications** — list, unread badge, mark read/read-all, delete, live push | Verified live: 6 seeded, unreadCount returned |
| ✅ | **Activity logs** — audit trail of user actions | `/api/activity`, Activity Logs page |
| ✅ | **QR codes** — PNG/SVG generation, saved per-link, real scannable targets | All 6 demo links have QR data-URLs; QR Center page |

## Platform

| Status | Feature | Verification |
|--------|---------|--------------|
| ✅ | **Auth** — signup/login/logout, JWT access + refresh (httpOnly cookie), email verification, forgot/reset password, lockout | `auth.controller.js`; lockout observed (423) |
| 🟡 | **Verification/reset emails** — require SMTP env vars; skipped + logged without them | `email.utils.js` has-config gate |
| ✅ | **Profile & settings** — profile fields, avatar upload, password change, preferences, account deletion | `/api/users/*` |
| ✅ | **PWA** — installable, service worker precache, offline shell, correct cache headers | `vite.config.js` + `frontend/vercel.json`; build emits `sw.js` |
| ✅ | **Demo account** — one-click login with seeded realistic data, server-side safety | see below |
| 🧪 | **Bio pages** — backend routes remain, removed from frontend UI | `bio.routes.js`; no UI |
| 🧪 | **Admin API** — stats, ban/unban, user list, link deletion; no admin UI | `admin.routes.js` (`requireAdmin`) |

---

## Public Demo Access

The login page includes an **“Explore SnapLink AI”** section with a **🚀 Try Demo Account** button.

- **Credentials:** `demo@gmail.com` / `demo123` (also displayed on the login form)
- **Real authentication:** the button calls the same `POST /api/auth/login` endpoint; a genuine JWT is issued and stored through the existing auth store. No frontend-only shortcut.
- **Toast on entry:** “Welcome to SnapLink AI Demo!” then redirect to `/dashboard/overview`.
- **Seeded data (re-created idempotently on every backend boot if deleted):**
  - 5 sample short links (one intentionally expired) with real short codes, QR codes and titles
  - ~870 visit records spread over 14 days → populated daily charts, device mix, countries, referrers, browsers
  - 3 UTM campaigns (Spring Product Launch, Summer Sale 2026, Content Marketing)
  - Notifications and activity-log entries
  - The owner's pre-existing links on the demo account are preserved, never wiped
- **Demo user permissions:** everything a normal user can do except destructive account actions:

  | Action | Demo result |
  |--------|-------------|
  | Dashboard, links, create/edit links, analytics, AI, QR, bulk, campaigns, teams, activity, notifications, trash, profile fields, settings | ✅ Allowed |
  | Change demo password | ❌ `403` |
  | Delete the demo account | ❌ `403` |
  | Reset demo password via forgot-password | ❌ blocked (generic response; reset endpoint `403`) |
  | Access another user's data | ❌ `404` (ownership scoping) |
- **Identification:** "Demo" badge + "Demo Account" label in the dashboard header; `isDemo: true` on the user object.
- **Reset:** restart/redeploy the Render service — seeding restores only what's missing.
- **Isolation:** all demo data belongs to the demo user; no other account is affected, and demo activity can't touch real users' links.

---

## What Is *Not* Implemented (honesty section)

- Team invite acceptance flow / invitation emails (records only)
- Custom domains
- A/B testing, link rotation, retargeting pixels
- Admin dashboard UI (API only)
- Bio pages UI (removed)
- Automated test suites / CI pipeline
- Public API keys / developer API program
