# Chapter 8 — Security

This chapter separates **implemented** (with file proof) from **not implemented** — interviewers respect the honesty and will probe the gaps.

## 1. Password hashing ✅

- `User.model.js` pre-save hook hashes with `bcryptjs`; cost from `BCRYPT_ROUNDS` (default 10).
- `comparePassword()` method for login; link-protection passwords hashed the same way (`redirect.controller.js` uses `bcrypt.compare`).
- Fields `select: false` — hashed passwords never leave the DB in normal queries.
- Why bcrypt: adaptive cost factor, built-in salt, deliberately slow (~100 ms) to defeat brute force. (Alternatives: argon2 — stronger memory-hardness, scrypt.)

## 2. JWT security ✅ (with honest trade-offs)

- **Two tokens, two secrets** (`utils/jwt.utils.js`): access 15 min (`JWT_SECRET`), refresh 7 days (`JWT_REFRESH_SECRET`). Payload is `{ id }` only — no PII.
- Boot fails fast without both secrets (`validateJwtEnv` in `auth.controller.js` → `MISSING_JWT_SECRET`).
- **Trade-off:** `protect` does a DB read per request (`User.findById`) — slightly slower than a pure stateless JWT, but enables instant revocation for deleted/banned users (`isActive`/`isBanned` checks in `auth.middleware.js`).

## 3. Refresh token security ✅

- httpOnly cookie → JavaScript cannot read it (XSS can't steal it); `SameSite=None; Secure` in production (cross-site Vercel↔Render), `lax` in dev.
- Rotation on refresh (new pair each time); old refresh tokens invalidated by re-setting `User.refreshToken`.
- Frontend only refreshes on genuine 401s and never logs out on transient network/429 errors (`lib/api.js`).
- **Gap:** no per-device session list or reuse-detection (stolen refresh token before rotation works until rotated). Improvement: store token family + detect reuse.

## 4. Protected routes ✅

- All 16 route files verified: every data router starts with `router.use(protect)`.
- Admin: `requireAdmin` = `requireRole('admin','superadmin')`.
- Ownership: every query scoped `{ user: req.user._id }` → foreign resources 404.

## 5. CORS configuration ✅

- Strict whitelist (`utils/corsOrigins.js`): production origin, one preview URL, localhost dev ports, env-supplied origins, **plus regex for Vercel preview deployments**.
- `credentials: true`; **no wildcard** (invalid with credentials anyway).
- Unknown browser origins rejected → their API calls fail in preflight.

## 6. XSS & injection prevention ✅ / partial

- React escapes rendered strings by default (no `dangerouslySetInnerHTML` in the codebase) → stored XSS via titles is mitigated.
- MongoDB injection: Mongoose casts types; queries built from known fields; passwords are hashed so injection targets are limited. **Gap:** no explicit sanitize middleware (e.g. `express-mongo-sanitize`) — a known improvement item.
- `helmet` sets baseline headers (CSP defaults, no-sniff, etc.).

## 7. Rate limiting ✅

| Limiter | Window | Max | Scope |
|---|---|---|---|
| general | 15 min | 200 | `/api/*` |
| auth | 15 min | 10 | login/signup/password flows |
| AI | 1 min | 10 | `/api/ai/*` |
| link creation | 1 min | 30 | `POST /api/links` |
| redirect | 1 min | 100 | `GET /r/:shortCode` |

All return `429` in the standard envelope.

## 8. URL validation ✅

- `isValidUrl()` (`utils/helpers.js`) — `new URL(url)` parse test before any link is stored; invalid → 400.
- **Gap:** no SSRF filtering (users can shorten `http://localhost/...` or internal IPs; the AI *summarize* endpoint actually fetches user URLs server-side — a real SSRF surface to acknowledge and fix with a private-IP blocklist).

## 9. Malicious URL detection 🟡

- AI-based check endpoint (`/api/ai/check-url`) with JSON verdict (spamScore, threatType, recommendation).
- **Honest limitations:** it's model opinion + keyword fallback, not a real-time threat feed; nothing blocks a malicious short link from redirecting (only creation-time warnings). Improvement: Google Safe Browsing API + redirect-time block page.

## 10. User data isolation ✅

- Ownership scoping everywhere; `requireDb` prevents cross-DB confusion; unique-click privacy via **secret-salted SHA-256 IP hashing** (`hashIP`) — deterministic dedup without storing usable IPs.
- Bots flagged (`detectBot`) to keep analytics clean.

## 11. Demo account protection ✅ (verified live)

- `isDemo` flag; change-password → **403**; delete-account → **403**; forgot-password → generic response, reset endpoint → 403.
- Lockout protection deliberately bypassed for the public account + **cleared on every boot** (`demoSeed.js`) — otherwise strangers could lock everyone out with wrong passwords.
- Data isolation is the normal ownership scoping — demo can only ever see its own seeded data.

## 12. Environment variable security ✅

- `.env` gitignored (root `.gitignore` includes `.env`, `.env.local`, `.env.*.local`); `.env.example` files contain placeholders only.
- Render/Vercel store secrets; docs never contain real values.

## 13. Cookie/session details ✅

- `setAuthCookies`: `secure: NODE_ENV === 'production'`, `sameSite: 'none'` (prod) / `'lax'` (dev), maxAge 15 min / 7 days; logout clears them.
- Cookie name collision care: access token accepted from cookie as fallback for `protect`.

## 14. Security summary table

| Control | Status | Proof |
|---|---|---|
| bcrypt password hashing | ✅ | `User.model.js` |
| JWT pair, separate secrets | ✅ | `jwt.utils.js` |
| httpOnly refresh cookie | ✅ | `auth.controller.js → setAuthCookies` |
| Route protection | ✅ | all 16 route files |
| Ownership isolation | ✅ | controllers (`user: req.user._id`) |
| Rate limiting | ✅ | `rateLimiter.js` (5 limiters) |
| CORS whitelist | ✅ | `corsOrigins.js` |
| Helmet headers | ✅ | `server.js` |
| URL validation | ✅ | `isValidUrl` |
| IP privacy (hash) | ✅ | `helpers.js → hashIP` |
| Demo account hardening | ✅ | `demoSeed.js` + live 403 tests |
| Malicious URL blocking | 🟡 | AI check only, no hard block |
| SSRF protection | ❌ | summarize endpoint fetches user URLs |
| Mongo sanitize middleware | ❌ | not installed |
| Refresh-token reuse detection | ❌ | single token field |
| Automated security tests | ❌ | none |

**Memorize the one-liner:** *"Security posture: strong fundamentals (bcrypt, JWT pair, CORS whitelist, layered rate limiting, ownership scoping, secret-salted IP hashing); acknowledged gaps: no SSRF filter on the URL summarizer, no explicit Mongo sanitize, no refresh-token reuse detection."*
