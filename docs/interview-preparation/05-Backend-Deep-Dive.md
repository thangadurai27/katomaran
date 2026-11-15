# Chapter 5 — Backend Deep Dive

## 1. Node.js event loop (and where SnapLink uses it)

Phases: timers → pending callbacks → poll → check (`setImmediate`) → close, with microtasks (promises) between each.

Where the project *deliberately* uses the loop:
- `logActivityAsync` (`utils/auth.helpers.js`): `setImmediate(() => ActivityLog.create(...))` — logging defers to the next check phase so responses never wait on it.
- `queueVerificationEmail` (`auth.controller.js`): emails queued with `setImmediate`.
- Redirect tracking: `Visit.create(...).then(...)` — fire-and-forget promise so the 301 isn't blocked.
- Non-blocking risk acknowledged: a fire-and-forget `.catch(() => {})` swallows errors by design (stats/notify failures shouldn't break a redirect).

## 2. Express request lifecycle (exact order in `server.js`)

```
helmet → cors (whitelist) → compression → morgan (dev) → express.json (limit)
→ cookieParser → (static serving in development) → generalLimiter on /api/
→ requireDb on /api → route mounts → errorHandler (last)
```

- `requireDb` (`middlewares/requireDb.js`): rejects `/api/*` with a clean error when `mongoose.connection.readyState !== 1` — combined with `bufferCommands: false` this turns "10-second buffering timeout" into a fast, clear failure.
- `errorHandler` (`middlewares/errorHandler.js`): central handler; in development includes `err.stack` (`NODE_ENV === 'development'`), production hides it.

## 3. Routes → controllers

16 route files (`backend/src/routes/*.js`). Pattern: thin file, mount middleware, delegate:

```js
// link.routes.js (actual)
router.get('/stats/overview', protect, getDashboardStats);
router.post('/bulk', protect, bulkOperation);
router.get('/', protect, getLinks);
router.post('/', protect, createLinkLimiter, createLink);   // route-specific limiter
router.get('/:id', protect, getLinkById);
router.put('/:id', protect, updateLink);
router.delete('/:id', protect, deleteLink);
router.patch('/:id/archive', protect, toggleArchive);
```

**Route ordering matters** — `/stats/overview` and `/bulk` are registered **before** `/:id`, otherwise "stats" would match `:id`.

## 4. Controllers & utilities

| Concern | File | Key functions |
|---|---|---|
| Auth | `controllers/auth.controller.js` | `signup, login, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe, setAuthCookies, validateJwtEnv` |
| Links | `controllers/link.controller.js` | `createLink, getLinks, getLinkById, updateLink, deleteLink, toggleArchive, bulkOperation, getDashboardStats` |
| Redirect | `controllers/redirect.controller.js` | `handleRedirect` |
| Analytics | `controllers/analytics.controller.js` | `getAnalyticsOverview, getLinkAnalytics, getRealTimeVisits` |
| AI | `controllers/ai.controller.js` | 7 handlers (slug, insights, safety, predict, summarize, chat, campaign suggestions) |
| QR | `controllers/qr.controller.js` | `generateQR, generateQRSVG, getUserQRCodes` |
| Users | `controllers/user.controller.js` | `getProfile, updateProfile, changePassword, uploadAvatar, deleteAccount, getAllUsers` |
| Helpers | `utils/helpers.js` | `getClientIP, parseUserAgent, getGeoData, detectBot, hashIP, hashToken, generateToken, getPaginationOptions, buildPaginationMeta, slugify, isValidUrl` |
| Response | `utils/apiResponse.js` | `success, error, paginated` |
| JWT | `utils/jwt.utils.js` | `generateTokenPair, verifyAccessToken, verifyRefreshToken` |

`asyncHandler` wraps every controller:

```js
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

Rejected promises flow to `errorHandler` — no try/catch noise in controllers.

## 5. Authentication & authorization deep dive

- **Extract token:** header `Bearer` → else cookie `accessToken` (`protect`).
- **Verify + hydrate:** `jwt.verify` then `User.findById(decoded.id).select('-password -refreshToken')` — meaning a deleted user's token dies immediately (stateful JWT trade-off: one DB read per request in exchange for instant revocation).
- **State checks:** suspended/banned → 403.
- **Role authorization:** `requireRole('admin','superadmin')` used by `/api/admin/*` and `GET /api/users`.
- **Ownership authorization (the key pattern):** every data query includes the owner: `Link.findOne({ _id, user: req.user._id })` — a foreign ID returns `404` (not 403, to avoid leaking existence).

## 6. JWT access/refresh details worth defending

- Payload is minimal: `{ id }` only — no PII in tokens.
- Two secrets so a leaked access secret can't mint refresh tokens.
- Refresh token also persisted on the user doc → rotation can invalidate old sessions; logout clears cookies.
- `validateJwtEnv()` fails fast at signup if secrets are missing (`MISSING_JWT_SECRET`).

## 7. bcrypt

- `User.model.js`: pre-save hook hashes `password` and `password` (link protection) with `bcryptjs`, cost `BCRYPT_ROUNDS` (default 10); `comparePassword` method; field `select: false`.
- bcrypt is deliberately slow (~100 ms at cost 10) — brute force resistance; never store plaintext; hashes are salted automatically.

## 8. Input validation

- Inline in controllers (email regex, password length, `isValidUrl` via `new URL()`).
- `express-validator` is a dependency (available for route-level rules); frontend uses zod + react-hook-form.
- Multer config (`configs/multer.js`) constrains avatar/CSV uploads.

## 9. Error handling

- Envelope from `utils/apiResponse.js` (`success/error/paginated` + `timestamp`).
- Async errors → `asyncHandler` → `errorHandler`; expected errors use `error(res, msg, code)` with early return; `err.statusCode`/`err.code` respected.

## 10. Rate limiting (`middlewares/rateLimiter.js`)

| Limiter | Window | Max | Applied to |
|---|---|---|---|
| `generalLimiter` | 15 min | 200 | all `/api/` |
| `authLimiter` | 15 min | 10 | signup, login, forgot/reset password |
| `aiLimiter` | 1 min | 10 | all `/api/ai/*` |
| `createLinkLimiter` | 1 min | 30 | `POST /api/links` |
| `redirectLimiter` | 1 min | 100 | `GET /r/:shortCode` |

All return the standard error envelope with **429**; `standardHeaders: true`.

## 11. CORS (`utils/corsOrigins.js`)

- Allow-list built from constants (`katomaran-eight.vercel.app`, preview URL) **plus** `FRONTEND_URL`/`CLIENT_URL` env vars (trailing slash stripped).
- A **regex allows Vercel preview deployments** matching `katomaran-*-thangadurais-projects-3903bebb.vercel.app`.
- No `origin` header (curl, mobile apps) → allowed (`return true` for non-browser requests).
- `credentials: true` because cookies must cross the Vercel↔Render origin boundary. **No wildcard** — with credentials, `*` is invalid and insecure.

## 12. MongoDB connection (`configs/db.js`)

- `bufferCommands: false` → fail fast.
- `validateMongoUri` catches the classic mistake: unencoded `@` in the Atlas password ("encode it as %40") and wrong hosts.
- Retry logic: up to `MAX_CONNECTION_ATTEMPTS`; `server.js` proceeds even if the first connect fails, and `requireDb` protects requests meanwhile.
- **The waiter bug (know this cold):** the "already connecting" path polled `readyState`; state `2` (connecting) matched *neither* branch (`1` → resolve, `0|3` → retry), so the promise hung forever and the boot callback (demo seeding) never ran. Fixed by always rescheduling the poll. Chapter 10 has the full story.

## 13. Database indexing (see Chapter 6 for the full list)

Hot ones: `Link.shortCode` unique, `Link.customAlias` sparse-unique, `{ user: 1, createdAt: -1 }` on most user-scoped collections, `Visit.shortCode` indexed, `Notification { user: 1, isRead: 1 }`.

## 14. Security protections (quick list — Chapter 8 expands)

Helmet, strict CORS, rate limiting, bcrypt, JWT pair, ownership scoping, IP hashing, bot detection (`detectBot`), fail-fast DB, `express.json` body limit, MCP-style secrets via env only.

---

## 15. Five traced requests (frontend → DB → back)

### ① Login
`LoginPage.jsx → handleDemoLogin/onSubmit → authStore.login → api.post('/auth/login')` → `authLimiter` → `login()` → `User.findOne({email}).select('+password')` → `comparePassword` (bcrypt.compare) → `generateTokenPair` → `User.updateOne` (reset attempts, lastLogin) → `setAuthCookies` (httpOnly) → activity log → `200 {user, accessToken, refreshToken}` → Zustand persists → redirect to dashboard.

### ② Create link
`CreateLinkPage.jsx → api.post('/links')` → Bearer header → `generalLimiter → requireDb → protect` (jwt.verify + user fetch) → `createLinkLimiter` → `createLink()` → `isValidUrl` → alias check → `Link.save` (pre-save: nanoid-7, bcrypt if password) → `qrcode.toDataURL` → `$inc` user stats → `ActivityLog` → notification → `io.emit('link:created')` → `201 {link}` → My Links list invalidates/updates.

### ③ Visitor redirect
`GET /r/8xK2pQ` → `redirectLimiter` → `handleRedirect()` → `Link.findOne({$or:[{shortCode},{customAlias}], isTrashed:false}).select('+password')` → rule checks (scheduled/expiry/active/password/geo/device) → `hashIP(ip)`, `parseUserAgent`, `getGeoData`, `detectBot` → `Visit.create(...).then($inc stats)` async → 301 destination.

### ④ Analytics overview
`AnalyticsPage.jsx → api.get('/analytics/overview?days=30')` → `protect` → `getAnalyticsOverview()` → `Promise.all([...Visit.aggregate pipelines...])` (`$match {user}` → `$group` by day/device/country/browser/os/referer) → totals from cached link stats → `success(res, {totalClicks, uniqueClicks, dailyClicks, deviceStats, ...})` → Recharts renders.

### ⑤ AI insights
`AIInsightsPage.jsx → api.post('/ai/analytics-insights')` → `protect → aiLimiter` → `getAnalyticsInsights()` → 5 parallel Visit queries → prompt string → `generateContent` (`configs/gemini.js`) → Gemini API → strip fences → `JSON.parse` → `200 {insights}` (or fallback JSON if API unavailable; `502` if unparseable).

## 16. Honest backend gaps (interviewers probe here)

- No automated tests, no `services/` layer (controllers are fat in places), no request-ID tracing, refresh-token rotation isn't persisted per-session (single token field), no pagination on some aggregates, `optionalAuth` defined but barely used.
