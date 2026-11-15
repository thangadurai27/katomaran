# Chapter 4 — Feature Deep Dive

Every feature below is traced through: **What → Why → Frontend → Backend → API → Model → Flow → Error handling.** File paths and function names are real.

---

## 4.1 User Registration

- **What/Why:** create an account with name, email, password (≥ 8 chars).
- **Frontend:** `frontend/src/pages/auth/SignupPage.jsx` (react-hook-form + zod validation) → `authStore.signup()` (`stores/authStore.js`).
- **Backend:** `auth.controller.js → signup()`; validations inline (email regex, password length); duplicate check `User.exists({email})` → `409`; username auto-resolved by `resolveUsername()` (`utils/auth.helpers.js`); verification token generated via `generateToken()` + stored hashed (`hashToken()` — SHA-256) with 24 h expiry.
- **API:** `POST /api/auth/signup` (authLimiter: 10/15 min).
- **Model:** `User.model.js` — bcrypt pre-save hook (`comparePassword`, `BCRYPT_ROUNDS` default 10).
- **Response:** `201` `{ user, accessToken, refreshToken }` + httpOnly cookies; verification email queued with `setImmediate` (only sent if SMTP configured).
- **Errors:** 400 validation, 409 duplicate, 429 rate limit.

## 4.2 User Login

- **Frontend:** `LoginPage.jsx` (now includes the Demo section) → `authStore.login()`.
- **Backend:** `auth.controller.js → login()`: `findOne({email}).select('+password')`, lockout check (`user.isLocked`, **skipped for demo accounts**), `comparePassword`, ban check, token pair generation, reset `loginAttempts`, activity log (`login` / `login_failed`).
- **API:** `POST /api/auth/login`.
- **Errors:** 401 invalid credentials (generic — no user enumeration), 423 locked, 403 suspended.

## 4.3 JWT Authentication

- **Access token:** 15 min default (`JWT_EXPIRE`), signed with `JWT_SECRET`, payload `{ id }`.
- **Verification:** `middlewares/auth.middleware.js → protect` — token from `Authorization: Bearer` **or** `req.cookies.accessToken`; `verifyAccessToken()`; loads the user (excluding password/refreshToken); blocks `isActive === false` or `isBanned`.
- **Distinctions:** `optionalAuth` (continues anonymously), `requireRole(...roles)`, `requireAdmin`.
- **Error mapping:** `JsonWebTokenError → 401 "Invalid token."`, `TokenExpiredError → 401 "Token expired. Please refresh."`

## 4.4 Refresh Token Mechanism

- **Token:** 7 days (`JWT_REFRESH_EXPIRE`), signed with a **separate** `JWT_REFRESH_SECRET`.
- **Storage:** httpOnly cookie `refreshToken` (15 min / 7 day maxAge) via `setAuthCookies()` — `secure: true`, `sameSite: 'none'` in production; also persisted on the `User.refreshToken` field (`select: false`).
- **Rotation:** `POST /api/auth/refresh-token` → new pair.
- **Frontend single-flight:** `lib/api.js` response interceptor — 401 (excluding auth endpoints) → memoized `refreshPromise` → retry original request once (`original._retry = true`). Only a rejected refresh (401/403) destroys the session — network errors or 429s don't log you out.

## 4.5 Create Short Links

- **Frontend:** `pages/dashboard/CreateLinkPage.jsx`.
- **Backend:** `link.controller.js → createLink()`. Body supports: `originalUrl` (required, `isValidUrl`), `customAlias`, `title`, `description`, `expiresAt`, `password`+`isPasswordProtected` (bcrypt-hashed), `isOneTime`, `utmParams`, `campaignId`, `tags`, `deepLink {android, ios}`, `geoRestrictions {allowed, blocked}`, `scheduledAt`.
- **Code generation:** `Link.model.js` pre-save hook → `nanoid(7)` if no `shortCode`; alias collision → `customAlias` sparse-unique index (`11000` handled).
- **Side effects (each is a good interview story):** QR data-URL via `qrcode.toDataURL`; `$inc` user stats; `ActivityLog.create`; `createNotification` (`utils/notification.helper.js`); `io.to('user:<id>').emit('link:created')`.
- **API:** `POST /api/links` — `createLinkLimiter` (30/min). **Response:** `201` with full link (incl. `shortUrl` virtual, QR URL).

## 4.6 Custom URL Aliases

- Redirect resolves **either** `shortCode` **or** `customAlias` (`redirect.controller.js`: `$or: [{shortCode}, {customAlias}]`).
- Uniqueness enforced by sparse unique index — two users cannot claim the same alias (409).

## 4.7 Link Expiration

- `expiresAt` on `Link`; enforced **at redirect time**: `link.expiresAt < new Date()` → visitor sent to `${FRONTEND_URL}/expired?code=…` (verified live in production with the expired demo link).
- Dashboard `getLinks` supports `status=expired` filter; `getDashboardStats` counts expired links.

## 4.8 Password-Protected Links

- Creation stores bcrypt hash of the password (`select: false` on the field).
- Redirect: missing password → `/protected/:code` page; provided via `?p=` or `x-link-password` header; `bcrypt.compare`; wrong password → `/protected/:code?error=1`.

## 4.9 QR Code Generation

- **Backend:** `qr.controller.js → generateQR` (PNG data-URL) and `generateQRSVG` (SVG string); options: width, margin, colors, error-correction level; target = `SHORT_URL_BASE + shortCode`.
- On generation for a `linkId`, the QR is persisted to `Link.qrCode.url` + `generatedAt`, and `user.stats.totalQRGenerated` is incremented; a notification is created.
- **API:** `GET /api/qr` (list), `POST /api/qr/generate`, `POST /api/qr/generate-svg`.
- **Frontend:** `pages/dashboard/QRCenterPage.jsx`.

## 4.10 My Links Management

- `getLinks()` — pagination (`getPaginationOptions`: page/limit capped at 100), `search` (regex on title/originalUrl/shortCode), `status` filter, `trashed=true`, campaign/tag filters. Ownership always scoped: `{ user: req.user._id }`.
- `updateLink()` — whitelisted fields only; **restore-from-trash** is a PUT with `isTrashed: false` (fires "Link restored" notification).
- Frontend: `pages/dashboard/MyLinksPage.jsx`, detail: `LinkDetailPage.jsx`.

## 4.11 Click Tracking

- Every successful redirect creates a `Visit` document: link, user, shortCode, ip, ipHash, userAgent, referer, geo (country/countryCode/city/region), device/browser/os (+versions), UTM from query string, `isUnique`, `isBot`, `clickedAt`.
- Parsing: `parseUserAgent` (ua-parser-js), `getGeoData` (geoip-lite) in `utils/helpers.js`.
- Cached counters: `$inc stats.totalClicks`, `stats.lastClickAt` on the Link.

## 4.12 Unique Click Tracking

- `hashIP(ip)` = SHA-256(ip + JWT_SECRET) — deterministic but not reversible; **unique** = no prior Visit with the same ipHash for that link (`Visit.findOne({ipHash, link})`).
- Interview point: hashing with a server secret prevents rainbow-table reversal of IPs while keeping dedup deterministic.

## 4.13 Device Analytics

- Aggregation `$group: { _id: '$device', count }` (`analytics.controller.js → getAnalyticsOverview`); device parsed by ua-parser-js (`mobile | desktop | tablet | bot | unknown`).

## 4.14 Geographic Analytics

- Same pipeline grouped by `countryCode` (+ `$first: '$country'`); geoip-lite offline database — no external API call, no rate limit, works on Render's free tier.

## 4.15 Browser Analytics

- `$group` by `$browser` (+ OS); top-3 browsers in overview, per-link breakdown in `getLinkAnalytics`.

## 4.16 Referrer Tracking

- `referer` header captured per visit; grouped for top-referrer lists; `direct` when absent.

## 4.17 Campaign Management

- **Model:** `Campaign.model.js` — user, optional team, name, status (`draft|active|paused|completed|archived`), date range, tags, color, UTM defaults, **denormalized `stats` cache**, AI fields.
- **API:** `GET/POST /api/campaigns`, `GET/PUT/DELETE /api/campaigns/:id` — all ownership-scoped.
- Links attach via `campaignId` at creation; campaign stats increment when links under it receive visits (seeded in `demoSeed.js` as the reference implementation).

## 4.18 AI Insights

- `ai.controller.js → getAnalyticsInsights`: five parallel queries (`Promise.all`) build a 30-day data summary → prompt with **strict JSON schema** → cleaned + parsed → `{summary, keyInsights, recommendations, bestPostingTime, audienceProfile, growthOpportunity, riskFactors, performanceScore}`.
- Parse failure → `502` with the raw text (honest failure, not fabricated data).

## 4.19 AI Chat Assistant

- `aiChat()` — system prompt defines the assistant persona ("expert in URL management, link analytics, digital marketing, SEO"), user's message appended, response capped at ~200 words. **Stateless** — no conversation memory server-side (limitation to admit).

## 4.20 Spam Detection (AI)

- `checkUrlSafety()` → JSON `{isSafe, spamScore, threatType, confidence, reasons, recommendation: allow|warn|block}`.
- Heuristic fallback exists (`fallbackResponse` returns "safe") — be honest: it's an AI-assisted heuristic, not a malware database like Google Safe Browsing.

## 4.21 AI Slug Suggestions

- `generateSmartSlug()` → 5 slugs, constraints in the prompt (4–12 chars, lowercase/numbers/hyphens). Users still get real uniqueness validation on use.

## 4.22 Bulk URL Shortening

- `bulk.routes.js`: `POST /api/bulk/import` — multer CSV upload → `csv-parser` → create links; `POST /api/bulk/create` — `{urls[]}` array. Both behind `protect`.
- Frontend: `pages/dashboard/BulkShortenerPage.jsx`.

## 4.23 Team Collaboration

- `Team.model.js`: owner, slug (unique), members array `{user, role: owner|admin|editor|viewer, joinedAt, invitedBy}`, invitations array `{email, role, token, expiresAt}`, settings.
- `team.routes.js`: `/stats`, list/create/detail, `POST /:id/invite` (random 32-byte token), `DELETE /:id/members/:memberId`.
- **Partial:** invitation emails need SMTP; there is no acceptance UI — invites create records only. Say this plainly.

## 4.24 Notifications

- `Notification.model.js`: type enum (link_expired, traffic_spike, team_invite, security_alert, system, ai_insight, campaign, report), priority, `isRead`, data payload.
- Created by `createNotification` helper on link/QR/restore events; **API:** list (+`unreadCount`), `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`.
- Frontend: bell icon with unread badge (`DashboardHeader.jsx`), full page `NotificationsPage.jsx`.

## 4.25 Activity Logs

- `ActivityLog.model.js` — strict action enum (link_created…login_failed), metadata (Mixed), ip, severity.
- Written non-blockingly via `logActivityAsync` (`setImmediate` + silent catch) so logging never slows a request.
- **API:** `GET /api/activity` (paginated). Frontend: `ActivityLogsPage.jsx`.

## 4.26 Trash & Link Recovery

- Delete = soft delete (`isTrashed: true, isActive: false`) — data is never hard-deleted by the user.
- Trash view: `GET /api/links?trashed=true`; restore = `PUT /api/links/:id {isTrashed: false}`; bulk restore via `POST /api/links/bulk`. Redirect ignores trashed links (`isTrashed: false` in the lookup).

## 4.27 Demo Login

- **Frontend:** `LoginPage.jsx → handleDemoLogin()` calls `authStore.login({email:'demo@gmail.com', password:'demo123'})` — the *real* login endpoint, real JWT, then toast "Welcome to SnapLink AI Demo!" and navigate to the dashboard. Demo badge ("Demo Account") shown in the header (`DashboardHeader.jsx` checks `user?.isDemo`).
- **Backend:** `utils/demoSeed.js` (boot-time, idempotent — see Chapter 3 diagram). `isDemo` flag on the User model, exposed in `toPublicUser`.
- **Safety (verified live):** change-password → 403; delete-account → 403; forgot/reset password blocked; lockout bypassed + cleared on boot (public account); data isolation via normal ownership scoping.

---

## Feature status summary (be ready to recite)

| Status | Features |
|---|---|
| ✅ Complete | auth (signup/login/refresh/logout), links + advanced options, redirect engine, analytics, QR, campaigns, bulk, notifications, activity, trash, exports, demo account, PWA |
| 🟡 Partial | email delivery (needs SMTP), teams (no invite acceptance UI), AI chat (stateless), admin (API only) |
| 🧪 Legacy | bio pages (backend routes only, UI removed) |
