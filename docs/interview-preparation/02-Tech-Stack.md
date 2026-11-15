# Chapter 2 — Complete Tech Stack

Every technology below is **actually used** in the repository (verified against `frontend/package.json`, `backend/package.json` and the source code).

---

## FRONTEND

### 1. React 19

1. **What:** JavaScript UI library for component-based SPAs.
2. **Why chosen:** component reuse across ~25 dashboard pages, huge ecosystem, hooks model.
3. **Where:** `frontend/src/` — `App.jsx` (router), `pages/` (auth + dashboard pages), `components/` (auth, dashboard, ui, layout).
4. **How it works here:** functional components + hooks everywhere; lazy route loading via `lib/lazyWithRetry.js` (lazy + Suspense + retry on chunk failure); an `ErrorBoundary` wraps the app (`components/system/ErrorBoundary.jsx`).
5. **Alternatives:** Vue, Svelte, Angular. **Why suitable:** strongest ecosystem for dashboards + charts, and matches common job requirements.

### 2. Vite

1. **What:** next-gen build tool/dev server (ES modules, esbuild pre-bundling).
2. **Why chosen:** near-instant dev server, fast HMR, simple config.
3. **Where:** `frontend/vite.config.js`.
4. **How:** dev server on 5173 with a **proxy** for `/api` and `/r` to `http://localhost:5000` (so dev requests avoid CORS); production build outputs `dist/` with content-hashed assets; `@` alias → `src/`.
5. **Alternatives:** Create React App (deprecated), Webpack. **Why suitable:** Vite is the current standard for new React apps; CRA is no longer maintained.

### 3. JavaScript (ES2022, JSX)

1. **What:** the project language (no TypeScript).
2. **Where:** everything; ESLint configured (`frontend/eslint.config.js`, scripts `lint`).
3. **Trade-off to admit in interviews:** TS would add type safety; JS was chosen for velocity. Be ready to say how you'd migrate (add TS config, rename files gradually, type the API layer first).

### 4. Tailwind CSS

1. **What:** utility-first CSS framework.
2. **Where:** all components; design tokens as CSS variables in `frontend/src/index.css` (`--text-primary`, `--bg-surface`, etc.) used via arbitrary values like `text-[var(--text-muted)]`.
3. **How:** utility classes + a small set of semantic component classes (e.g. `btn-primary`); dark/light theming by swapping CSS variables (`hooks/useTheme.js`, `ThemeToggle.jsx`).
4. **Alternatives:** CSS Modules, styled-components, MUI. **Why suitable:** fast consistent styling without a heavy component library; tiny CSS output after PurgeCSS.

### 5. Zustand

1. **What:** minimal state-management library (create a store, hook into components).
2. **Where:** `frontend/src/stores/authStore.js`, `stores/uiStore.js`.
3. **How it works here:** `authStore` is created with `create(persist(...))` — persisted to localStorage under key `snaplink-auth` with `partialize` (user, tokens, isAuthenticated). It holds `login`, `signup`, `logout`, `initializeAuth` actions. `initializeAuth()` verifies the persisted session **once per app load** via `GET /auth/me`.
4. **Why chosen over Redux:** far less boilerplate; Redux Toolkit or Context could work, but Zustand's persist middleware + selector-based subscriptions fit this scale perfectly.

### 6. TanStack Query (React Query) v5

1. **What:** server-state management — caching, refetching, invalidation.
2. **Where:** dashboard data fetching (`package.json` dependency `@tanstack/react-query`).
3. **Division of labor (say this in interviews):** **Zustand = client state (auth session, UI), TanStack Query = server state (links, analytics, campaigns)**. This is a senior-level distinction interviewers love.
4. **Alternatives:** RTK Query, SWR.

### 7. Recharts

1. **What:** React charting library built on SVG + D3.
2. **Where:** analytics/overview charts; wrapped by `components/ui/ResponsiveChart.jsx` for responsive sizing.
3. **Alternatives:** Chart.js, ECharts, D3 directly. **Why suitable:** declarative React API, composes well with Tailwind styling.

### 8. Socket.io Client

1. **What:** WebSocket client with fallbacks, rooms, auto-reconnect.
2. **Where:** connects to the Render backend; user joins room `user:<id>`.
3. **How:** server authenticates the handshake with the JWT (`socketManager.js` → `io.use(...)` verifying the access token), then events like `link:created` update the UI without polling.
4. **Alternatives:** native WebSocket, Pusher, Supabase Realtime.

### 9. PWA (vite-plugin-pwa + Workbox)

1. **What:** installable web app with a service worker.
2. **Where:** `vite.config.js` → `VitePWA({...})`; manifest (name, theme `#7C3AED`, standalone display); `registerType: 'autoUpdate'`.
3. **How:** Workbox `generateSW` precaches hashed build assets (js/css/svg/png/woff2/webmanifest — **explicitly not `index.html`**, with a comment explaining it avoids Workbox "non-precached-url" errors); Google Fonts use a `CacheFirst` runtime rule; **API responses are never cached** (comment in config). `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim` keep updates clean.
4. **Alternatives:** manual service worker, Workbox CLI.

Other frontend dependencies (all verified): `axios` (HTTP), `react-router-dom` v7 (routing), `react-hook-form` + `@hookform/resolvers` + `zod` (form validation), `framer-motion` (animations), `react-hot-toast` (toasts), `date-fns` (dates), `lucide-react` (icons).

---

## BACKEND

### 10. Node.js 20

1. **What:** JS runtime (V8, event loop, non-blocking I/O).
2. **Where:** entire backend; pinned via `engines: { node: "20.x" }` in `backend/package.json`.
3. **How the event loop is used:** async I/O everywhere (Mongoose queries, `qrcode`, Gemini calls); non-critical work is deferred with `setImmediate` (e.g. `logActivityAsync` in `utils/auth.helpers.js`, email queueing in `auth.controller.js`).

### 11. Express 5

1. **What:** minimal HTTP framework (routing, middleware chain).
2. **Where:** `backend/src/server.js` — middleware chain, 17 route mounts, `/health`, Socket.io init.
3. **Note:** Express **5** (not 4) — mention that it has a built-in promise handling improvement, and the codebase still uses its own `asyncHandler` wrapper for consistency.

### 12. REST API

~60 endpoints across 16 route files, grouped under `/api/*`, with a consistent envelope from `utils/apiResponse.js`:

```js
{ success: true, message: "...", data: {...}, timestamp: "ISO" }
{ success: false, message: "...", errors?: [...] }
```

Plus the one **public non-REST route**: `GET /r/:shortCode` (the redirect engine).

### 13. Socket.io (server)

- Shares the Express HTTP server (`initializeSocket(server)`).
- Auth middleware on handshake (JWT) → personal room `user:${userId}`; optional `join:link`/`leave:link` rooms.
- Helpers `emitToUser`, `emitToAll` (`sockets/socketManager.js`).

### 14. JWT Authentication (`jsonwebtoken`)

- **Two tokens, two secrets:** access (default `15m`, `JWT_SECRET`) + refresh (default `7d`, `JWT_REFRESH_SECRET`) — `utils/jwt.utils.js`.
- Access token: `Authorization: Bearer` header (also accepted from cookie). Refresh token: httpOnly cookie `refreshToken` (`SameSite=None; Secure` in production, `lax` in dev) **and** stored on the user document (`refreshToken` field, `select: false`).
- `middlewares/auth.middleware.js`: `protect` (required), `optionalAuth`, `requireRole`, `requireAdmin`.

### 15. Middleware chain (order matters — memorize it)

From `server.js`: `helmet` → `cors` (whitelist from `utils/corsOrigins.js`) → `compression` → `morgan` (dev) → `express.json({ limit })` → `cookieParser` → `generalLimiter` on `/api/` → `requireDb` on `/api` → route mounts → `errorHandler` last.

---

## DATABASE

### 16. MongoDB (Atlas)

Document DB — flexible schemas fit the mixed-shape `Visit` documents (geo fields, device fields, UTM fields) and `Mixed` metadata fields.

### 17. Mongoose 9

- ODM: schemas, validation, middleware (pre-save password hashing), `populate`, **Aggregation Pipeline** (used heavily for analytics: `$match`, `$group`, `$sort`, `$dateToString`).
- `mongoose.set('bufferCommands', false)` in `configs/db.js` — commands fail fast instead of hanging when disconnected (this is why a down DB returns a clean error instead of a 10-second timeout).

### 18. Schema & relationships

8 models (`backend/src/models/`): `User`, `Link`, `Visit`, `Campaign`, `Team`, `Notification`, `ActivityLog`, `BioPage` (legacy). Relationships are by `_id` references (`ref: 'User'` etc.) with deliberate **denormalized stats caches** (`Link.stats.totalClicks`, `Campaign.stats`) to avoid counting `Visit` documents on every dashboard load.

---

## AI

### 19. Google Gemini — `gemini-2.5-flash`

1. **What:** Google's LLM family; `flash` = fast, cheap, high-quality tier.
2. **Where:** `backend/src/configs/gemini.js` (SDK: `@google/generative-ai`), consumed by `controllers/ai.controller.js` (7 endpoints) and `link.controller.js` (e.g. AI engagement scoring on link creation).
3. **How:** server-side only; prompts request **JSON-only** responses; responses are cleaned (`replace(/```json\n?|\n?```/g, '')`) then `JSON.parse`d.
4. **Fallbacks (`fallbackResponse` in gemini.js):** missing key → helpful config message; invalid key → instructive message; quota/429 → "wait or enable billing"; unknown model → **one automatic retry with `gemini-2.5-flash`**; per-endpoint canned JSON fallbacks (e.g. static slug list) so the UI never breaks.
5. **Alternatives:** OpenAI GPT-4o-mini, Claude, local models. **Why suitable:** free tier, generous quota for a demo project, fast latency.

---

## DEPLOYMENT

### 20. Vercel (frontend)

- Root dir `frontend/`, framework Vite, build `npm run build`, output `dist/`.
- `frontend/vercel.json`: SPA rewrites (`/(.*) → /index.html` after `filesystem`), cache headers — `assets/*` immutable (1 year), `index.html`/`sw.js`/`registerSW.js` `max-age=0, must-revalidate`.

### 21. Render (backend)

- Web Service, root dir `backend/`, build `npm install`, start `npm start`, Node 20, health check `/health`.
- Free tier **cold starts**: instance sleeps after ~15 min idle; first request takes 30–60 s.

### 22. MongoDB Atlas

- Free M0 cluster; Network Access `0.0.0.0/0` (Render's egress IPs are dynamic); connection string in `MONGODB_URI` with URL-encoded password.

### 23. Environment variables

| Backend | Frontend (build-time) |
|---|---|
| `PORT`, `NODE_ENV`, `MONGODB_URI`, `MONGODB_DB_NAME` | `VITE_API_URL` |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRE`, `JWT_REFRESH_EXPIRE` | `VITE_BASE_URL` |
| `FRONTEND_URL`, `CLIENT_URL`, `SHORT_URL_BASE` | `VITE_SHORT_URL_BASE` |
| `GEMINI_API_KEY`, `GEMINI_MODEL`, `EMAIL_*`, `BCRYPT_ROUNDS` | — |

Frontend fallback logic lives in `frontend/src/config/env.js`: prod builds fall back to the deployed Render API, dev to `localhost:5000` — so no frontend env vars are strictly required.

### 24. Production configuration details worth quoting

- Cookies: `secure: NODE_ENV === 'production'`, `sameSite: 'none'` in production (cross-site Vercel↔Render), `lax` in dev (`auth.controller.js → setAuthCookies`).
- Trust proxy / client IP: `x-forwarded-for` first hop (`helpers.js → getClientIP`).
- Demo seeding runs on boot after DB connect, status exposed on `/health` (`demoSeedStatus`).
