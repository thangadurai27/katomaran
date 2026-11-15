# Chapter 12 — Real-Time Scenario Questions

Answered in two layers: **what actually happens today** (implementation truth) and **possible future improvement** (what you'd say if pushed).

---

## 1. What happens when a user pastes a long URL?

**Today:** `CreateLinkPage.jsx` collects the URL (and optional alias/expiry/password/UTM/campaign) → `POST /api/links` (Bearer token, 30/min limiter) → `createLink()` in `link.controller.js` validates with `isValidUrl` → checks alias collisions → `link.save()` (pre-save hook generates `nanoid(7)` if no custom alias) → QR data-URL generated → user stats incremented → `ActivityLog` + notification created → `link:created` socket event → `201` returns the link with `shortUrl`. The list UI updates instantly.

**Future:** server-side preview fetch for OG metadata; async AI scoring (already partially there).

## 2. How does the backend generate a unique short code?

**Today:** `nanoid(7)` in the `Link` pre-save hook (`Link.model.js`). Nanoid uses a cryptographic PRNG over a 62-character URL-safe alphabet → ~3.5 trillion combinations; at this project's scale collisions are astronomically unlikely, and the **unique index** on `shortCode` is the guarantee (a collision would throw and fail the save).

**Future:** collision-retry loop with a new code on `E11000`; reserved-word blocklist.

## 3. How do you prevent duplicate short URLs?

**Today:** two unique indexes: `shortCode` (always present) and `customAlias` (sparse — only enforced when set). Database-level enforcement, not application-level checks alone.

**Future:** a "claim check" API the UI can call before submit (`GET /api/links/alias-available?alias=...`).

## 4. What happens when two users create the same custom alias?

**Today:** the second `save()` violates the sparse-unique index → Mongo `E11000` → the controller returns **409** ("alias already taken") and the user picks another. First-come-first-served; no per-user namespaces (aliases are global).

**Future:** per-user namespaces (`/r/@user/alias`) or premium reserved aliases.

## 5. How do you track clicks?

**Today:** every successful `GET /r/:shortCode` creates a `Visit` document (`redirect.controller.js`): device/browser/OS from `parseUserAgent` (ua-parser-js), country/city from `getGeoData` (geoip-lite), referrer, UTM query params, bot flag, timestamp. Then `$inc` on `Link.stats.totalClicks` and the user's cached counters. All *after* the redirect decision, inside a `.then()` so the 301 is never delayed.

**Future:** event queue (BullMQ) for ingestion at high volume.

## 6. How do you identify unique visitors?

**Today:** `hashIP(ip)` = SHA-256(ip + JWT_SECRET) — deterministic per visitor, irreversible without the server secret. Before inserting, `Visit.findOne({ipHash, link})` decides `isUnique`; first click counts, repeats don't.

**Future:** privacy-friendlier fingerprints (daily-rotated salt), or accept lower accuracy.

## 7. How do you handle expired URLs?

**Today:** redirect checks `link.expiresAt < new Date()` → visitor is sent to the frontend `/expired` page (not the destination). Verified live in production with the expired demo link. Dashboard filters/counts expired links.

**Future:** auto-archive job + email/notification on expiry (the notification type `link_expired` already exists).

## 8. What happens if Gemini API is unavailable?

**Today:** `generateContent` catches the error → `fallbackResponse(prompt, reason)`: helpful config/quota messages, or canned JSON per endpoint (static slugs, "safe" verdict, generic insights). AI rate limiter still applies. **No core feature depends on AI** — link creation, redirects and analytics work without it.

**Future:** circuit breaker with health-based skving, response caching.

## 9. How do you handle 10,000 users simultaneously?

**Today:** a single Render instance; fine for a demo, not for that load. What already helps: async visit recording (redirects don't block), cached stat counters (dashboard reads are cheap), rate limiting, and stateless JWTs (any instance can serve any request).

**Future:** horizontal scaling behind a load balancer + Redis (Socket.io adapter, shared rate-limit store), read replicas/rollups for analytics, CDN/edge redirect service.

## 10. How would you scale the application?

Order of attack: (1) **Redirect hot path** → edge/KV cache of code→URL, async queue for visit ingestion. (2) **Database** → indexes already exist; add `{user, clickedAt}` for Visit aggregations, rollups, time-series collections, read replicas. (3) **App tier** → multiple Render instances + Redis adapter for Socket.io + Redis-backed rate limiting. (4) **AI** → response caching + streaming. (5) **Observability** → metrics before more load.

## 11. How would you reduce database queries?

Concrete wins from the actual code: (a) `protect` does a `User.findById` per request → short-TTL user cache; (b) dashboards already read denormalized `stats` instead of counting Visits — extend that (pre-aggregate daily rollups instead of grouping raw visits); (c) `getAnalyticsOverview` runs ~6 aggregations → combine into fewer pipelines or a materialized view; (d) `lean()` where possible (partially used).

## 12. How do you prevent unauthorized access to another user's links?

**Today:** every query includes `user: req.user._id` (create/read/update/delete/list/analytics/QR). A foreign link ID returns **404**, not 403 — no existence leak. Admin routes additionally require `requireAdmin`. Tested live: demo JWT + foreign/nonexistent ID → 404.

**Future:** DB-level row security isn't a Mongo feature — keep the pattern + add integration tests covering cross-tenant access.

## 13. How do you handle API failures (frontend)?

**Today:** Axios interceptor classifies errors: 401 → single-flight refresh + retry; auth endpoints never refresh (bad credentials shown as toast); refresh genuinely rejected → session cleared + `snaplink:auth-expired`; network/429/5xx → error toast with server `message`, no logout. TanStack Query retries/refetches page data.

**Future:** offline detection banner, retry queues for mutations.

## 14. How do you protect the public demo account?

**Today (all verified live):** credential change → **403**; account deletion → **403**; forgot/reset password → blocked (generic response / 403); brute-force lockout bypassed for demo and cleared every boot (a public password invites guessing; lockout would let strangers lock everyone out); data isolated by normal ownership scoping; seeding is idempotent so trashed demo data is restored on restart; lockout bypass means the demo is always reachable.

**Future:** per-IP limits on demo login, CAPTCHA, nightly full data reset.

## 15. What would you improve in version 2?

Prioritized list you can defend:
1. **Test suite + CI** (biggest gap — no automated tests today).
2. **Email system** (SMTP transactional service for verification/reset/invites).
3. **Team invite acceptance UI** (records exist; flow incomplete).
4. **SSRF filter + explicit Mongo sanitization** (security hardening).
5. **Analytics rollups + Visit indexes/TTL** (scale).
6. **AI upgrades**: streaming chat, conversation memory, response caching, native JSON mode.
7. **Admin dashboard UI** (API exists).
8. **Custom domains + edge redirects** (product + performance).
9. **2FA + session management UI.**
10. **Observability**: Sentry, APM, structured request IDs.
