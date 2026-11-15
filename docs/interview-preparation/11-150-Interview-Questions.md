# Chapter 11 — 150 Interview Questions & Answers

Format per question: **Simple** (one-liner) → **Deep** (technical) → **In SnapLink** (project application) → **Follow-up** (what interviewers ask next). Revise by covering the answers.

---

## A. Project Architecture (20)

**A1. Walk me through the high-level architecture of SnapLink AI.**
- Simple: React SPA → Express API → MongoDB, with Socket.io for real-time and Gemini for AI.
- Deep: Three tiers — Vercel static hosting (hashed assets + SPA rewrites), a single Render Node process serving REST + the `/r/:shortCode` redirect engine + Socket.io, and Atlas for storage. Cross-cutting: JWT auth, rate limiters, CORS whitelist, boot-time demo seeding.
- In SnapLink: assembled in `backend/src/server.js`; frontend entry `App.jsx`.
- Follow-up: "Why one backend process for REST and redirects?" → same instance shares the connection pool and keeps deployment simple; redirects are cheap.

**A2. Why separate the redirect endpoint from the `/api` namespace?**
- Simple: Different audiences — visitors vs logged-in users.
- Deep: `/r/:code` is public, latency-critical, rate-limited differently (100/min), and must never pass auth/DB-required middleware meant for API consumers.
- In SnapLink: `redirect.routes.js` mounts at app root; API mounts under `/api` with `generalLimiter` + `requireDb`.
- Follow-up: "How would you scale redirects separately?" → split into a dedicated redirect service/edge worker.

**A3. Why is the frontend on Vercel and backend on Render?**
- Simple: Static SPA → CDN; Node server needs a persistent process.
- Deep: Vercel's edge serves immutable assets optimally; Render provides a long-running Node process for Express + Socket.io (WebSockets need a server, not a static host).
- In SnapLink: `frontend/vercel.json`, Render Web Service rooted at `backend/`.
- Follow-up: "Could you host both on Render?" → yes, serve `dist/` via Express static; trade CDN edge performance.

**A4. How do the frontend and backend communicate?**
- Simple: HTTPS REST with Bearer tokens + WebSockets for live events.
- Deep: Axios instance (`frontend/src/lib/api.js`) with interceptors; Socket.io client joins room `user:<id>`.
- In SnapLink: REST for all CRUD; sockets for `link:created` and live notifications.
- Follow-up: "Why not websockets for everything?" → REST is cacheable, simpler, request-scoped.

**A5. Explain your data flow for a single click.**
- Simple: Visitor → `/r/:code` → lookup → rules → record Visit → 301.
- Deep: `handleRedirect` resolves by shortCode or alias, checks scheduled/expiry/active/password/geo/device, then `Visit.create(...).then(...)` increments stats asynchronously, then 301.
- In SnapLink: `backend/src/controllers/redirect.controller.js`.
- Follow-up: "What if Visit creation fails?" → `.catch(() => {})` — click still redirects; stats eventually consistent.

**A6. Why did you choose MongoDB over PostgreSQL?**
- Simple: Flexible documents fit heterogeneous click data.
- Deep: Visit docs have optional geo/device/UTM fields; embedding stats caches avoids joins; aggregation pipeline covers analytics.
- In SnapLink: `Visit.model.js`, aggregation in `analytics.controller.js`.
- Follow-up: "Where would SQL be better?" → strong relational reporting, transactions across entities.

**A7. What is denormalization in your project?**
- Simple: Copying counters onto parent documents for fast reads.
- Deep: `Link.stats.totalClicks/uniqueClicks`, `User.stats`, `Campaign.stats` — incremented with `$inc` instead of aggregating Visits every load.
- In SnapLink: everywhere stats are displayed.
- Follow-up: "How do you fix drift?" → periodic reconciliation aggregation.

**A8. How is state managed on the frontend?**
- Simple: Zustand for client state, TanStack Query for server state.
- Deep: `authStore.js` (persisted session, auth actions), `uiStore.js`; Query handles caching/refetching of API data.
- Follow-up: "Why not Redux?" → less boilerplate; persist middleware built in.

**A9. How does the demo account fit into the architecture?**
- Simple: A real user seeded at boot with guards.
- Deep: `demoSeed.js` runs after DB connect (idempotent), `/health` exposes `demoSeedStatus`; `isDemo` flag drives 403s on destructive actions and lockout bypass.
- Follow-up: "How do you stop demo abuse?" → ownership scoping + rate limiters + blocked credential changes.

**A10. How would you add a new feature end-to-end?**
- Simple: Model → controller → route → frontend page.
- Deep: Follow the existing pattern: schema in `models/`, functions in `controllers/`, thin route with `protect` (+ limiter if heavy), envelope responses, page in `pages/dashboard/` using the api client.
- Follow-up: "What about migrations?" → schema-less; write backfill scripts.

**A11. What happens when the DB is down?**
- Simple: API fails fast with clean errors; redirects fail as 404-page redirect.
- Deep: `requireDb` middleware checks `readyState !== 1`; `bufferCommands: false` prevents queuing; connection retries capped.
- In SnapLink: `configs/db.js`, `middlewares/requireDb.js`.
- Follow-up: "Why not queue writes?" → silent data loss risk; explicit failure is safer.

**A12. Explain your error-handling strategy across layers.**
- Simple: Envelope responses + central error handler + asyncHandler.
- Deep: Controllers return `error(res,msg,code)` early; uncaught async errors hit `errorHandler` via `asyncHandler`; frontend maps response messages to toasts.
- Follow-up: "How do you avoid leaking internals?" → production hides stack traces.

**A13. Why is Gemini called from the backend, not the browser?**
- Simple: Key secrecy and control.
- Deep: API key in server env; backend also injects real aggregates and validates/parses output; user never talks to Google directly.
- Follow-up: "Rate limits?" → `aiLimiter` 10/min/user.

**A14. How do you keep real-time updates working across deploys?**
- Simple: Socket.io auto-reconnects.
- Deep: Client reconnects on drop; state refetches on reconnect (TanStack Query invalidation); Render restarts are brief.
- Follow-up: "Sticky sessions?" → single instance today; multi-instance needs Redis adapter.

**A15. Describe the request middleware chain in order.**
- Simple: helmet → cors → compression → logging → body parser → cookies → rate limit → requireDb → route → auth → handler → error handler.
- Deep: Order matters — CORS before routes; limiter before auth (cheap rejection); `errorHandler` last.
- In SnapLink: `server.js`.
- Follow-up: "Why is the limiter before auth?" → reject abusive traffic without paying a DB lookup.

**A16. How do you organize the backend codebase?**
- Simple: routes / controllers / models / middlewares / utils / configs / sockets.
- Deep: Routes thin, controllers own logic, utils shared, models own schema + hooks.
- Follow-up: "When would you add services?" → when controllers exceed ~200 lines or logic is reused.

**A17. How does the PWA aspect change your architecture?**
- Simple: Service worker precaches assets; API never cached.
- Deep: Workbox generateSW in `vite.config.js`; `must-revalidate` shell; offline shows cached shell.
- Follow-up: "Why not cache API data?" → private user data + staleness.

**A18. What is the biggest architectural weakness today?**
- Simple: Single instance, no test suite.
- Deep: Vertical scaling only; Socket.io ties sessions to one process; no CI tests before deploy.
- Follow-up: "First fix?" → Redis adapter + CI pipeline.

**A19. How would you make redirects globally fast?**
- Simple: Edge caching/worker at the redirect layer.
- Deep: Move `/r/:code` to a CDN edge function with a KV cache of code→URL; keep analytics ingestion async via queue.
- Follow-up: "Cache invalidation?" → purge on link update.

**A20. Explain multi-tenancy in your data model.**
- Simple: Every document carries a `user` reference; queries always filter by it.
- Deep: No tenant tables; isolation enforced at query construction in controllers + indexes `{user:1,...}`.
- Follow-up: "Enforce at model level?" → middleware/scopes or query-builder wrapper.

## B. React.js (20)

**B1. Why React for this project?**
- Simple: Component reuse, ecosystem, hooks.
- Deep: ~25 dashboard pages share UI kit (`components/ui/*`); TanStack Query and Recharts are React-native.
- In SnapLink: everything under `frontend/src`.
- Follow-up: "Class vs function components?" → all functional.

**B2. What are hooks you used and where?**
- Simple: useState/useEffect/useMemo/useContext/children.
- Deep: `useAuthStore` (Zustand hook), `useMediaQuery`, `useTheme` custom hooks; effects for socket subscriptions and keyboard handlers (`DashboardHeader.jsx` Escape key).
- Follow-up: "Rules of hooks?" → top-level only, stable order.

**B3. Explain your auth store.**
- Simple: Zustand store with persist that holds user + tokens.
- Deep: `create(persist(...))`, `partialize` limits what's stored; `initializeAuth()` verifies session once via `/auth/me` before routes render; listens to `snaplink:auth-expired` events from the Axios layer.
- In SnapLink: `stores/authStore.js`.
- Follow-up: "Why store tokens in localStorage at all?" → access token in memory+storage; refresh stays httpOnly cookie-side; discuss XSS trade-offs.

**B4. How does token refresh work in React?**
- Simple: Axios response interceptor retries after one shared refresh.
- Deep: 401 → memoized `refreshPromise` → retry original; `_retry` flag prevents loops; auth endpoints excluded.
- In SnapLink: `lib/api.js`.
- Follow-up: "Parallel 401s?" → single flight, all wait on one promise.

**B5. How do you protect routes?**
- Simple: Router guard checks `isAuthenticated` after `initializeAuth`.
- Deep: Redirect unauthenticated users to `/login`; avoid flash by waiting for `isInitialized`.
- Follow-up: "Role-based?" → possible via store `user.role` (admin UI absent).

**B6. Why lazy-load routes?**
- Simple: Smaller initial bundle.
- Deep: `lazyWithRetry` wraps `React.lazy` + Suspense and retries failed chunk imports (deploy-caching resilience).
- In SnapLink: `lib/lazyWithRetry.js`.
- Follow-up: "Chunk load errors in prod?" → that retry is the fix.

**B7. What is TanStack Query and why use it with Zustand?**
- Simple: Query caches server data; Zustand holds UI/session.
- Deep: Query handles stale/refetch/invalidation; mixing server data into Zustand causes sync bugs.
- Follow-up: "When to refetch?" → window focus, invalidation after mutations.

**B8. How do you handle forms?**
- Simple: react-hook-form + zod.
- Deep: Uncontrolled inputs with resolver-based validation; errors surfaced inline.
- In SnapLink: `SignupPage.jsx`, `LoginPage.jsx`.
- Follow-up: "Controlled vs uncontrolled?" → RHF minimizes re-renders.

**B9. How do you prevent unnecessary re-renders?**
- Simple: Selectors, memo, stable callbacks.
- Deep: Zustand selector subscriptions; `React.memo`/`useMemo` in chart components.
- Follow-up: "Where did you measure?" → React DevTools profiler.

**B10. Explain the dashboard layout composition.**
- Simple: Layout wrapper + sidebar + header + page outlet.
- Deep: `DashboardLayout.jsx`, `Sidebar` + `SidebarGroup/Item` (config-driven via `config/navigation.js`), `DashboardHeader` (notifications badge, demo badge, user menu).
- Follow-up: "Responsive?" → `useMediaQuery` + MobileBottomNav + BottomSheet.

**B11. How do you show charts responsively?**
- Simple: A ResponsiveChart wrapper.
- Deep: Recharts inside measured containers; `components/ui/ResponsiveChart.jsx`.
- Follow-up: "Chart performance with many points?" → downsample.

**B12. How are toasts and loading handled?**
- Simple: react-hot-toast + loading states in store/pages.
- Deep: Success/error toasts from auth actions; `LoadingScreen`, skeleton/transition components.
- Follow-up: "Global error boundary?" → `ErrorBoundary.jsx`.

**B13. How does the demo button work?**
- Simple: Calls the same login action with demo credentials.
- Deep: `handleDemoLogin` in `LoginPage.jsx` → `authStore.login` → dashboard; toast "Welcome to SnapLink AI Demo!".
- Follow-up: "Why not fake auth?" → real JWT keeps all guards intact.

**B14. How do you handle env config in Vite?**
- Simple: `import.meta.env.VITE_*` with fallbacks.
- Deep: `config/env.js` — prod falls back to deployed API; dev falls back to localhost:5000; values are build-time.
- Follow-up: "Why build-time?" → Vite inlines at compile; runtime config needs a config endpoint.

**B15. How do you connect Socket.io in React?**
- Simple: Client connects with the JWT in `auth.token`.
- Deep: Handshake auth verified server-side; joins `user:<id>`; events update query cache/toasts.
- Follow-up: "Cleanup?" → disconnect on logout/unmount.

**B16. Animations?**
- Simple: Framer Motion for transitions.
- Deep: Page transitions (`PageTransition.jsx`), menu animations in `DashboardHeader` (AnimatePresence).
- Follow-up: "Performance?" → transform/opacity only.

**B17. Theming?**
- Simple: CSS variables toggled by class.
- Deep: `useTheme` + `ThemeToggle`; Tailwind arbitrary values reference `var(--…)` tokens.
- Follow-up: "FOUC?" → pre-hydration script/localStorage.

**B18. Error boundaries?**
- Simple: A class component catching render errors.
- Deep: `components/system/ErrorBoundary.jsx` shows fallback UI.
- Follow-up: "Do they catch event errors?" → no; only render-phase.

**B19. How do you test the frontend today?**
- Simple: Playwright E2E against production; no unit tests.
- Deep: Fresh-context browser sweeps, console-error collection (documented in TESTING_REPORT.md).
- Follow-up: "Add unit tests how?" → Vitest + React Testing Library.

**B20. What React 19 features matter here?**
- Simple: Modern concurrency out of the box.
- Deep: React 19 runtime; the codebase relies on standard hooks; no RSC (plain SPA).
- Follow-up: "Server components?" → not applicable to a Vite SPA.

## C. JavaScript (15)

**C1. var/let/const and where it matters in the codebase?**
- Simple: Block scoping; `const` default.
- Deep: Backend CommonJS modules use `const` for requires; frontend ESM.
- Follow-up: "TDZ?" → temporal dead zone for let/const.

**C2. Explain the event loop with a project example.**
- Simple: Async scheduling; `setImmediate` defers work.
- Deep: `logActivityAsync` uses `setImmediate` so logging runs after the current poll phase.
- Follow-up: "process.nextTick vs setImmediate?" → microtask vs check phase.

**C3. Promises vs async/await in this codebase?**
- Simple: Both; async/await in controllers, promise-chaining for fire-and-forget.
- Deep: `Visit.create(...).then(...)` keeps redirect non-blocking; `Promise.all` parallelizes analytics queries.
- Follow-up: "Error in fire-and-forget?" → `.catch(() => {})` deliberately.

**C4. What is closure? Project example?**
- Simple: Function retaining its scope.
- Deep: `createLimiter(windowMs,max,message)` in `rateLimiter.js` closes over config; `asyncHandler` closes over `fn`.
- Follow-up: "Memory implications?" → captured scopes persist.

**C5. `this` and arrow functions — relevance?**
- Simple: Arrow has no own `this`.
- Deep: Controllers are arrow-wrapped; middleware uses lexical scope to avoid `this` bugs.
- Follow-up: "Call/bind?" → rarely needed with arrows.

**C6. Destructuring/rest/spread examples from the project?**
- Simple: `const { email, password } = req.body`.
- Deep: Spread merges visitor data: `...geoData, ...uaData` into Visit docs (`redirect.controller.js`).
- Follow-up: "Order matters?" → later spread wins.

**C7. How does JSON.parse/cleanup work for AI responses?**
- Simple: Strip code fences, then parse.
- Deep: `result.replace(/```json\n?|\n?```/g,'')` then `JSON.parse` with try/catch.
- Follow-up: "What if model returns prose?" → 502/fallback, never fabricated.

**C8. Explain optional chaining/nullish in project usage.**
- Simple: `req.headers.authorization?.startsWith('Bearer ')`.
- Deep: Defensive access everywhere in middleware/utils.
- Follow-up: "Old browser support?" → transpiled by Vite/esbuild.

**C9. Module systems: CJS vs ESM in this repo?**
- Simple: Backend CJS, frontend ESM.
- Deep: `backend/package.json` `"type":"commonjs"`; frontend `"type":"module"` (Vite).
- Follow-up: "Mixing?" → requires/build interop.

**C10. Event-driven programming examples?**
- Simple: Socket events + window CustomEvents.
- Deep: `snaplink:tokens` / `snaplink:auth-expired` window events decouple Axios layer from store (avoids circular import).
- Follow-up: "Alternative?" → event emitter module or context.

**C11. What is a race condition? Real example fixed?**
- Simple: Parallel refresh calls.
- Deep: Single-flight `refreshPromise` in `lib/api.js`.
- Follow-up: "Other races?" → double-submit guarded by `isLoading`.

**C12. Debounce/throttle in the project?**
- Simple: Search inputs debounce (UX-level), rate limiters server-side.
- Deep: Client-side avoids spamming search; server `generalLimiter` is the backstop.
- Follow-up: "Implement debounce?" → closure + timer reset.

**C13. Regex usage examples?**
- Simple: Email regex, bot patterns, auth-endpoint matcher.
- Deep: `detectBot` (`/bot|crawler|spider|…/i`), `AUTH_ENDPOINTS` regex in `lib/api.js`, CORS preview regex.
- Follow-up: "ReDoS risk?" → simple patterns, bounded input.

**C14. Memory leaks in SPAs — where to watch?**
- Simple: Listeners/intervals/timers.
- Deep: Socket handlers and window listeners must be removed on unmount/logout.
- Follow-up: "How to detect?" → DevTools heap snapshots.

**C15. Explain nanoid and why not UUID.**
- Simple: Short, URL-safe, random IDs.
- Deep: nanoid(7) ≈ 3.5T combinations; UUIDs are 36 chars — bad for shared short links.
- Follow-up: "Collision handling?" → unique index + retry/regenerate.

## D. Node.js & Express (20)

**D1. What is Node.js good for? Why here?**
- Simple: I/O-heavy APIs in one language across the stack.
- Deep: Non-blocking I/O fits redirect/analytics workloads; JS everywhere.
- Follow-up: "CPU-heavy tasks?" → worker threads/queue.

**D2. Explain Express middleware with the actual chain.**
- Simple: Functions with (req,res,next).
- Deep: helmet → cors → compression → morgan → json → cookieParser → limiters → requireDb → routes → errorHandler.
- In SnapLink: `server.js`.
- Follow-up: "Custom middleware you wrote?" → requireDb, auth.middleware.

**D3. Express 4 vs 5 — anything that bit you?**
- Simple: v5 with improved promise handling; we still wrap with asyncHandler.
- Deep: Consistent `asyncHandler` pattern regardless of version behavior.
- Follow-up: "Breaking changes?" → path syntax/regex changes; minor here.

**D4. How does `protect` work line by line?**
- Simple: Extract token → verify → load user → attach to req.
- Deep: Header first, cookie fallback; `select('-password -refreshToken')`; blocked if inactive/banned; typed error mapping (JsonWebTokenError/TokenExpiredError).
- In SnapLink: `middlewares/auth.middleware.js`.
- Follow-up: "DB hit per request?" → yes; trade-off is instant revocation.

**D5. Why two JWT secrets?**
- Simple: Compartmentalization.
- Deep: Compromised access secret can't mint 7-day refresh tokens.
- Follow-up: "Different algorithms?" → both HS256; could rotate keys with kid headers.

**D6. How do cookies work cross-site here?**
- Simple: SameSite=None + Secure in production.
- Deep: Vercel (site) → Render (API) is cross-site; `credentials: true` in Axios and CORS.
- Follow-up: "Why not same-site?" → third-party cookie rules; alternative is Bearer-only.

**D7. Explain rate limiter configuration.**
- Simple: Window+max per limiter class; 429 envelope.
- Deep: express-rate-limit, `standardHeaders`, custom handler; five classes (general/auth/AI/create/redirect).
- Follow-up: "Distributed limiting?" → Redis store.

**D8. What does requireDb do and why?**
- Simple: Blocks /api/* when Mongo is disconnected.
- Deep: readyState check; pairs with `bufferCommands:false`; prevents 10s buffering timeouts.
- Follow-up: "What about /r/?" → redirect needs DB too; fails to 404 page.

**D9. How is file upload handled?**
- Simple: Multer.
- Deep: `configs/multer.js` — avatar images (form-data), CSV import (`bulk.routes.js` uses its own multer+csv-parser pipeline).
- Follow-up: "Storage?" → local disk today; S3 at scale.

**D10. Explain compression and when it helps/hurts.**
- Simple: gzip responses.
- Deep: compression middleware; helps JSON; skip for already-compressed (images).
- Follow-up: "Level trade-off?" → CPU vs size.

**D11. What is morgan/winston split?**
- Simple: HTTP access logs vs app logs.
- Deep: morgan dev-only in `server.js`; Winston logger levels differ by NODE_ENV.
- Follow-up: "Correlation IDs?" → improvement item.

**D12. How do you serve the frontend in development?**
- Simple: Vite proxies /api and /r to localhost:5000.
- Deep: `vite.config.js` proxy — avoids CORS in dev entirely.
- Follow-up: "Why proxy instead of CORS in dev?" → simpler cookie behavior.

**D13. How would you structure validation with express-validator?**
- Simple: Chain rules on routes.
- Deep: Available as a dependency; today validation is inline in controllers + zod on the client.
- Follow-up: "Where should validation live?" → route/controller boundary; single source ideally.

**D14. Explain error propagation from async handlers.**
- Simple: asyncHandler → next(err) → errorHandler.
- Deep: `Promise.resolve(fn(...)).catch(next)`; `errorHandler` formats envelope, hides stacks in prod.
- Follow-up: "Unhandled rejections?" → process-level handler should log+exit.

**D15. What is helmet doing?**
- Simple: Security headers.
- Deep: CSP, HSTS-ish defaults, no-sniff, frameguard; configured at app level.
- Follow-up: "CSP with inline scripts?" → needs nonce/hash tuning.

**D16. How does Socket.io authenticate connections?**
- Simple: JWT in handshake.
- Deep: `io.use` middleware verifies token, loads user, joins `user:<id>` room.
- Follow-up: "Token expiry mid-connection?" → connection persists until disconnect; reconnect re-verifies.

**D17. How do you emit events from controllers?**
- Simple: `io` from app or helper.
- Deep: `req.app.get('io')` in `link.controller.js`; `emitToUser` helper exists in `socketManager.js`.
- Follow-up: "Testability?" → inject an emitter interface.

**D18. How is the redirect limiter different from API limits?**
- Simple: 100/min vs 200/15min.
- Deep: Redirects are public; tighter per-minute window to absorb abuse without hurting normal visitors.
- Follow-up: "Keyed by?" → IP (default req.ip).

**D19. What Node perf issues exist today?**
- Simple: per-request user lookup; aggregation-heavy endpoints.
- Deep: Could cache user objects briefly; pre-aggregate analytics.
- Follow-up: "Measure first?" → APM/EventLoop latency metrics.

**D20. How would you add graceful shutdown?**
- Simple: Close server + sockets + DB on SIGTERM.
- Deep: `server.close()`, `io.close()`, `mongoose.connection.close()`; Render sends SIGTERM on deploys.
- Follow-up: "Drain time?" → finish in-flight requests, stop accepting new.

## E. MongoDB & Mongoose (15)

**E1. Explain your schemas' design process.**
- Simple: Access patterns first.
- Deep: Lists (user+createdAt index), redirect lookup (shortCode unique), analytics (Visit docs + caches).
- Follow-up: "Normalize vs embed?" → embed small bounded arrays (team members), reference the rest.

**E2. What indexes exist and why?**
- Simple: Uniqueness + query patterns.
- Deep: Link: shortCode unique, customAlias sparse-unique, `{user,createdAt}`, campaign, expiresAt, stats.totalClicks; Notification `{user,isRead}`; Visit.shortCode.
- Follow-up: "Index cost?" → write amplification + storage.

**E3. Sparse vs partial vs normal unique index?**
- Simple: Sparse skips docs missing the field.
- Deep: `customAlias` — most links have none; a normal unique index would reject the second null.
- Follow-up: "Partial alternative?" → partialFilterExpression.

**E4. What is `select: false` and where used?**
- Simple: Sensitive fields excluded by default.
- Deep: `password`, `refreshToken`, link password; explicitly `.select('+password')` when needed.
- Follow-up: "Accidental leak vector?" → toObject transformations; be careful with lean().

**E5. Explain pre-save hooks in the project.**
- Simple: Hash passwords, generate shortCode.
- Deep: `User.model.js` bcrypt hook (BCRYPT_ROUNDS); `Link.model.js` nanoid(7).
- Follow-up: "Hook vs service?" → hooks guarantee invariants on any save path.

**E6. What Mongoose instance methods exist?**
- Simple: `comparePassword`, `incLoginAttempts`.
- Deep: Document methods on userSchema; `isLocked` virtual.
- Follow-up: "Statics?" → could add `Link.findActiveByUser` statics.

**E7. Explain an aggregation pipeline you wrote.**
- Simple: match → group → sort.
- Deep: Daily clicks with `$dateToString` formatting; multi-pipeline `Promise.all` in `getAnalyticsOverview`.
- Follow-up: "Performance?" → needs index on `{user, clickedAt}` — improvement item.

**E8. How does $inc work and why use it?**
- Simple: Atomic counter update.
- Deep: `$inc stats.totalClicks` — no read-modify-write race.
- Follow-up: "Conditional increment?" → filter by isUnique result computed in app.

**E9. How do you paginate?**
- Simple: skip/limit with caps.
- Deep: `getPaginationOptions` (limit ≤ 100) + `buildPaginationMeta` (total, hasNextPage…).
- Follow-up: "Skip cost at scale?" → cursor-based (range) pagination.

**E10. How is uniqueness enforced for aliases?**
- Simple: Sparse unique index.
- Deep: Duplicate → E11000; controllers return 409 with friendly message.
- Follow-up: "Case sensitivity?" → lowercase:true on field.

**E11. Why store hashed tokens (verification/reset) instead of plaintext?**
- Simple: DB leak ≠ usable tokens.
- Deep: `generateToken` + `hashToken` (SHA-256); lookup by hash.
- Follow-up: "Why not bcrypt for these?" → high-entropy tokens don't need slow hashing.

**E12. Explain Mixed type usage.**
- Simple: Free-form metadata.
- Deep: `Notification.data`, `ActivityLog.metadata` — flexible payloads.
- Follow-up: "Downside?" → no validation/indexing depth.

**E13. What is bufferCommands:false?**
- Simple: Fail instead of queue when disconnected.
- Deep: Prevents "buffering timed out" 500s; with `requireDb` users get clean errors.
- Follow-up: "When would buffering help?" → short reconnects where queueing is acceptable.

**E14. How do you model the lockout mechanism?**
- Simple: loginAttempts + lockUntil fields.
- Deep: `incLoginAttempts` increments and sets 2h lock at threshold; virtual `isLocked`; demo bypassed.
- Follow-up: "Distributed?" → central store (Redis) per-IP+account.

**E15. Time-series data: how would you evolve Visit storage?**
- Simple: Rollups + TTL.
- Deep: Daily aggregation collections; TTL indexes for raw visits; keep counters cached.
- Follow-up: "Mongo time-series collections?" → good fit for per-click events.

## F. REST API & Authentication (15)

**F1. What makes your API RESTful?**
- Simple: Resource URLs, HTTP verbs, status codes, JSON.
- Deep: `/api/links`, `/api/links/:id`, GET/POST/PUT/DELETE/PATCH; consistent envelope; one public redirect exception.
- Follow-up: "HATEOAS?" → not implemented; fine for app-driven APIs.

**F2. Explain your response envelope.**
- Simple: `{success, message, data, timestamp}` (+pagination).
- Deep: `utils/apiResponse.js` — uniform contract for frontend error handling.
- Follow-up: "Problems?" → non-standard; some prefer plain resources + HTTP semantics.

**F3. Walk through signup → subsequent authenticated request.**
- Simple: Create → tokens → Bearer on every call.
- Deep: `signup` returns pair + cookies; `protect` verifies on next call; frontend stores access token, interceptor attaches it.
- Follow-up: "Email verification gate?" → soft (token flow exists; UI allows login before verify).

**F4. Access vs refresh token — why two?**
- Simple: Short-lived credential + long-lived renewer.
- Deep: Limits stolen-access-token window to minutes; refresh kept httpOnly.
- Follow-up: "Revoke refresh?" → overwrite `User.refreshToken` on rotate/logout.

**F5. What does 401 vs 403 vs 404 mean in your API?**
- Simple: No/unauth vs forbidden vs not-found.
- Deep: 401 no/invalid token; 403 suspended/demo-guard/roles; 404 foreign resources (deliberately not 403).
- Follow-up: "Why 404 instead of 403?" → don't leak existence.

**F6. How do you prevent user enumeration?**
- Simple: Generic messages everywhere.
- Deep: Login/forgot always return the same shape ("Invalid email or password", "If an account exists…").
- Follow-up: "Timing attacks?" → bcrypt compare still runs; could add constant-time email lookup.

**F7. Explain the refresh endpoint flow.**
- Simple: Cookie/body refresh → new pair.
- Deep: `verifyRefreshToken` (separate secret) → new access+refresh, rotation persisted.
- Follow-up: "Frontend single-flight?" → memoized promise in the interceptor.

**F8. What is rate limiting's role in auth?**
- Simple: Slow down brute force.
- Deep: `authLimiter` 10/15min + account lockout 2h + generic errors.
- Follow-up: "Bypass via IP rotation?" → combine with lockout + CAPTCHA.

**F9. How are uploads validated?**
- Simple: Multer limits + type expectations.
- Deep: Avatar via `POST /api/users/avatar`; CSV via bulk import; size caps in `configs/multer.js`.
- Follow-up: "Virus scanning?" → out of scope today.

**F10. Design a new endpoint live (e.g. link tags filter).**
- Simple: Extend query params.
- Deep: `getLinks` already supports `tag`/`campaign` filters; pattern: validate → scope by user → paginate → envelope.
- Follow-up: "Backwards compatibility?" → additive params only.

**F11. Why PATCH for archive and PUT for update?**
- Simple: Partial vs full-ish updates.
- Deep: `PATCH /:id/archive` toggles one field; `PUT /:id` applies whitelisted fields.
- Follow-up: "Strict PUT semantics?" → we treat PUT as partial-update; acknowledge the purist view.

**F12. How does the demo login use the same endpoint safely?**
- Simple: Same `/auth/login`, guarded account.
- Deep: `isDemo` blocks credential changes; lockout bypassed; data isolated by user scoping.
- Follow-up: "Abuse vector?" → noisy neighbors; rate limits + idempotent seed mitigate.

**F13. What status code for exhausted AI quota?**
- Simple: 429 via aiLimiter; Gemini-side quota → fallback message.
- Deep: Two layers: our limiter (429) and upstream quota (fallback response text).
- Follow-up: "Retry-After?" → could add from limiter config.

**F14. How would you version this API?**
- Simple: `/api/v1`.
- Deep: Add version prefix; keep envelope; deprecate old paths gradually.
- Follow-up: "Versioning granularity?" → URL vs header.

**F15. Idempotency: which endpoints need it?**
- Simple: POST /links (double-click).
- Deep: Client disables submit while loading; server could accept an Idempotency-Key header.
- Follow-up: "Bulk import retries?" → per-row dedup on originalUrl+alias.

## G. AI & Gemini (15)

**G1. Which Gemini model and why?**
- Simple: `gemini-2.5-flash`.
- Deep: Fast, cheap, good instruction-following for JSON tasks; default overridable by `GEMINI_MODEL`; auto-retry on unknown-model 404s.
- Follow-up: "When upgrade to pro?" → complex reasoning; costs/latency rise.

**G2. How do you guarantee structured outputs?**
- Simple: Prompt asks for JSON-only + fence-stripping + JSON.parse.
- Deep: Strict schema in prompt; parse-failure handling (502 or fallback).
- Follow-up: "Native JSON mode?" → Gemini API responseMimeType option — improvement item.

**G3. What data do you send to the model?**
- Simple: Aggregates only.
- Deep: Counts and dimension summaries from MongoDB (`getAnalyticsInsights`) — no raw IPs/PII.
- Follow-up: "Token cost?" → hundreds, not thousands, per call.

**G4. Explain the fallback system.**
- Simple: Helpful message or canned JSON per endpoint.
- Deep: `fallbackResponse(prompt, reason)` in `gemini.js`; triggered on missing/invalid key, quota, generic errors.
- Follow-up: "Risk?" → fallback insights could be mistaken for real AI — labeled as fallback.

**G5. How does the chat assistant work?**
- Simple: System persona + user question → single response.
- Deep: Stateless; no conversation memory; ≤200 words.
- Follow-up: "Add memory?" → store messages, windowed context, or summarize history.

**G6. How does AI spam detection work?**
- Simple: Prompt returns isSafe/spamScore/threatType/recommendation.
- Deep: Heuristic model opinion + safe fallback; no real-time threat feed.
- Follow-up: "Harden it?" → Safe Browsing API + domain reputation.

**G7. Where is AI used in link creation itself?**
- Simple: Engagement scoring/category via Gemini, with seeded fallbacks.
- Deep: `link.controller.js` uses `generateContent`; `demoSeed.js` provides AI fields for demo data.
- Follow-up: "Blocking?" → never; AI failure can't block creation.

**G8. Prompt injection risk?**
- Simple: User text goes into prompts.
- Deep: Chat/insight prompts embed user content; sandboxed by "analytics assistant" persona; no tool/exec follow-through.
- Follow-up: "Mitigations?" → delimiter user content, output schema validation, don't act on instructions.

**G9. Latency/UX for AI endpoints?**
- Simple: Seconds, not ms.
- Deep: UI shows loading states; aiLimiter prevents queue pileup; timeout via axios (8 s) on page fetch in summarize.
- Follow-up: "Streaming?" → generateContentStream + SSE.

**G10. Cost control?**
- Simple: Free tier + tight rate limit + small prompts.
- Deep: 10 req/min/user, aggregate-based prompts, no caching yet.
- Follow-up: "Add caching?" → prompt-hash cache with TTL.

**G11. How do you evaluate AI quality?**
- Simple: Manually today; automated eval as TODO.
- Deep: Schema adherence is machine-checkable; content quality needs golden datasets.
- Follow-up: "Build an eval?" → sample prompts + expected fields + rubric scoring.

**G12. Why server-side SDK, not REST?**
- Simple: Official SDK handles request shape/auth.
- Deep: `@google/generative-ai` with `getGenerativeModel({model})` → `generateContent`.
- Follow-up: "Version pinning?" → package version in package.json (^0.24).

**G13. What if Gemini returns harmful/wrong content?**
- Simple: We only render generic marketing/analytics text; schema checks on structured outputs.
- Deep: No autonomous actions; recommendations are advisory.
- Follow-up: "Content filtering?" → Gemini safety settings; log-and-review.

**G14. Alternative LLMs and migration cost?**
- Simple: Low — one wrapper function.
- Deep: All calls go through `generateContent`; swapping to OpenAI is a provider adapter.
- Follow-up: "What breaks?" → response quirks/fences; keep the cleaner.

**G15. Explain a real fallback path end-to-end.**
- Simple: Missing key → user still gets AI-page content.
- Deep: `generateContent` → `fallbackResponse('missing_key')` → config message or canned JSON → frontend renders without crash.
- Follow-up: "Alerting?" → log error + `/health` could expose AI status (improvement).

## H. Deployment & DevOps (10)

**H1. Describe the full deploy pipeline.**
- Simple: git push → Vercel builds frontend, Render redeploys backend.
- Deep: No CI gate — mention as improvement; verify via `/health` (`demoSeedStatus`, `version`).
- Follow-up: "Add CI?" → GitHub Actions: lint+build+tests before deploy.

**H2. How does Vercel serve the SPA?**
- Simple: Static + rewrites.
- Deep: filesystem handler → assets 404 fallback → `/(.*)` to index.html; immutable assets vs must-revalidate shell.
- Follow-up: "Preview deploys?" → allowed via CORS regex.

**H3. What is a cold start and your mitigation?**
- Simple: Render free tier sleeps; first hit is slow.
- Deep: ~30–60 s; uptime pings warm it; health path configured.
- Follow-up: "Cost of fix?" → paid always-on or keep-alive cron.

**H4. How do you manage secrets?**
- Simple: Platform env vars; .env gitignored.
- Deep: `.env.example` placeholders; docs never contain real values; rotate JWT secrets invalidates tokens.
- Follow-up: "Secret rotation?" → dual-key window strategy.

**H5. What does /health expose and why?**
- Simple: status, mongo, seed status, version.
- Deep: Born from a silent-failure incident (seeding); enables uptime checks and deploy verification.
- Follow-up: "Too much info?" → no secrets leaked; safe.

**H6. How do logs flow?**
- Simple: morgan (dev HTTP) + Winston (app), Render log console.
- Deep: production level warn+; boot sequence logs verify DB + seed.
- Follow-up: "Centralized logging?" → Drain to Logtail/Datadog.

**H7. Explain Atlas network access choice.**
- Simple: 0.0.0.0/0 because Render IPs are dynamic.
- Deep: Trade-off documented; alternative is VPC peering/static egress on paid tiers.
- Follow-up: "Compensating controls?" → strong creds, TLS, least-privilege DB user.

**H8. How do you roll back a bad deploy?**
- Simple: Redeploy previous commit on Render/Vercel.
- Deep: Immutable build artifacts make rollback reliable; DB changes are additive (schema-less).
- Follow-up: "Bad data migration?" → write compensating script.

**H9. How does the PWA update itself?**
- Simple: autoUpdate registration.
- Deep: skipWaiting + clientsClaim + cleanupOutdatedCaches; must-revalidate sw.js.
- Follow-up: "User mid-session update?" → claim can take over; heavy pages refetch.

**H10. What monitoring would you add first?**
- Simple: Uptime + error tracking.
- Deep: Sentry (FE+BE), `/health` external checks, APM for event-loop lag.
- Follow-up: "Alert routing?" → Slack/email thresholds.

## I. Security (10)

**I1. How are passwords stored?**
- Simple: bcrypt, salted, cost 10.
- Deep: Pre-save hook; `select:false`; `comparePassword`.
- Follow-up: "Why bcrypt over SHA?" → adaptive cost; SHA is too fast.

**I2. How are sessions secured?**
- Simple: Short JWT + httpOnly refresh cookie.
- Deep: SameSite=None/Secure prod; rotation; logout clears.
- Follow-up: "CSRF?" → SameSite + no state-changing GETs; could add CSRF tokens.

**I3. How is data isolated between users?**
- Simple: user scoping in every query.
- Deep: Foreign IDs → 404; admin routes behind requireAdmin.
- Follow-up: "Prove it?" → foreign-link 404 tested live (demo JWT).

**I4. How do you protect a publicly advertised account?**
- Simple: isDemo guards + lockout bypass + boot unlock.
- Deep: Credential changes 403; seeding reclaims drifted credentials; generic forgot-password response.
- Follow-up: "Could demo be abused for spam links?" → createLinkLimiter 30/min + monitor.

**I5. Explain your CORS stance.**
- Simple: Whitelist, credentials true, no wildcard.
- Deep: `corsOrigins.js` with env + preview regex; non-browser requests allowed (no Origin header).
- Follow-up: "Why not allow all in dev?" → parity with prod behavior.

**I6. How do you handle injection risks?**
- Simple: Mongoose typing + React escaping.
- Deep: No raw query concatenation; missing `express-mongo-sanitize` acknowledged.
- Follow-up: "Add it?" → middleware strip `$`/`.` keys.

**I7. Rate limiting details?**
- Simple: 5 limiters, 429 envelope.
- Deep: General/auth/AI/create/redirect; standard headers.
- Follow-up: "Keyed by IP behind proxy?" → trust proxy config matters.

**I8. IP privacy approach?**
- Simple: SHA-256(ip+secret) for dedup.
- Deep: Deterministic per-link uniqueness; raw ip also stored today — improvement: drop raw.
- Follow-up: "GDPR?" → shorten retention/TTL.

**I9. What's missing in security?**
- Simple: SSRF filter, sanitize middleware, reuse detection, 2FA.
- Deep: Summarize endpoint fetches user URLs (SSRF surface); single refresh token field.
- Follow-up: "Prioritize?" → SSRF blocklist first.

**I10. How do you keep secrets out of the repo?**
- Simple: .gitignore + example files.
- Deep: Verified .env files ignored; demo creds are public by design and sandboxed.
- Follow-up: "Committed a secret once?" → rotate + history scrub.

## J. Real-Time Scenarios & Debugging (10)

**J1. Prod API returns 500 "buffering timed out".**
- Simple: DB not connected.
- Deep: Check /health mongo, Render logs, Atlas network access, URI encoding (`validateMongoUri` exists to catch this).
- Follow-up: "Prevent?" → fail-fast + health alerts.

**J2. Users report login "randomly" logging out.**
- Simple: Refresh race or cookie SameSite issue.
- Deep: Our single-flight refresh + only-401-destroys-session rule addresses this; check cookie flags in prod.
- Follow-up: "Reproduce?" → parallel requests with expired access token.

**J3. After a deploy, some users see a blank page.**
- Simple: Stale SW/chunks.
- Deep: must-revalidate shell + SW skipWaiting; lazyWithRetry re-fetches chunks.
- Follow-up: "Immediate fix for a user?" → hard refresh.

**J4. Analytics page shows CORS errors only sometimes.**
- Simple: Deploy window, not config.
- Deep: Requests dying mid-redeploy look like missing CORS headers; verify after settle.
- Follow-up: "Eliminate?" → health-gated deploys/zero-downtime.

**J5. A short link redirects to /expired unexpectedly.**
- Simple: expiry rule — by design.
- Deep: `handleRedirect` checks `expiresAt < now` → FRONTEND_URL/expired; verify link doc.
- Follow-up: "TZ bugs?" → store UTC Date; compare server time.

**J6. Demo login returns 423.**
- Simple: Lockout on public account.
- Deep: By design bypassed + boot-unlocked; if seen, deploy hasn't finished or seed status error — check `/health.demoSeedStatus`.
- Follow-up: "Root-cause story?" → Chapter 10 Challenge 1/2.

**J7. Socket events not arriving.**
- Simple: Auth/token or reconnect.
- Deep: Handshake needs JWT; check room join; Render restart drops sockets → client auto-reconnects.
- Follow-up: "Debug?" → socket logs (`Socket connected: …`).

**J8. AI endpoint returns 502 "could not be parsed".**
- Simple: Model returned non-JSON.
- Deep: Fence-strip failed → we surface raw text instead of fabricating; retry improves odds.
- Follow-up: "Harden?" → responseMimeType JSON / retry with corrected prompt.

**J9. Duplicate aliases reported.**
- Simple: Can't happen; unique index.
- Deep: If seen, check lowercase normalization + actual error (E11000) handling path.
- Follow-up: "Friendly error?" → 409 with message.

**J10. Clicks spike but dashboard flat.**
- Simple: Cached counters vs eventual writes.
- Deep: `$inc` is async post-redirect; lag is seconds; bots flagged `isBot`.
- Follow-up: "Reconcile?" → recount aggregation for the link.
