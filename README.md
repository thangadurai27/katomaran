<div align="center">

<img src="docs/assets/banner.svg" alt="SnapLink AI — Shorten Smarter. Track Everything. Grow Faster." width="100%" />

# SnapLink AI

**Shorten Smarter. Track Everything. Grow Faster.**

A full-stack URL shortener with real-time click analytics, QR codes, campaign management and **Google Gemini**-powered insights — built as a production-style SaaS on React, Node.js and MongoDB.

[![Live Demo](https://img.shields.io/badge/Live_Demo-katomaran--eight.vercel.app-8B5CF6?style=flat-square&logo=vercel)](https://katomaran-eight.vercel.app)
[![API](https://img.shields.io/badge/API-katomaran--y789.onrender.com-5B21B6?style=flat-square)](https://katomaran-y789.onrender.com/health)
[![GitHub](https://img.shields.io/badge/GitHub-thangadurai27%2Fkatomaran-181717?style=flat-square&logo=github)](https://github.com/thangadurai27/katomaran)

<br>

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square)

</div>

---

## 📑 Table of Contents

- [About](#-about-snaplink-ai)
- [Live Demo & Demo Account](#-live-demo--demo-account)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🚀 About SnapLink AI

SnapLink AI is a link-management platform that turns long URLs into short, trackable links — then tells you everything about who clicks them.

**Why it was built:** Most URL shorteners stop at "make it short." Teams also need to know *which* campaigns drive traffic, *who* clicks (device, country, referrer), and *what to do next*. SnapLink AI combines the shortener, the analytics and an AI advisor in one dashboard.

**Problems it solves:**

- **Branded, controlled links** — custom aliases, expiry dates, password protection, one-time links, geo/device restrictions and scheduled links.
- **No more guessing** — every redirect records device, browser, OS, country, referrer and unique-click data, streamed live to the dashboard.
- **Analysis paralysis** — Gemini AI reads your real analytics and answers questions in plain English ("Which campaign performs best?"), predicts link performance, suggests slugs and flags unsafe URLs.
- **Team & campaign workflows** — bulk import from CSV, UTM campaign grouping, QR codes for print/social, and team spaces.

**Who can use it:** marketers tracking campaigns, creators sharing links, developers distributing releases — anyone who wants click data without wiring up an analytics stack.

---

## 🎯 Live Demo & Demo Account

Try the full application **without registering**:

> **Live app:** [https://katomaran-eight.vercel.app](https://katomaran-eight.vercel.app)
> **API health:** [https://katomaran-y789.onrender.com/health](https://katomaran-y789.onrender.com/health)

On the [login page](https://katomaran-eight.vercel.app/login), click **🚀 Try Demo Account** — or sign in manually:

| Field | Value |
|-------|-------|
| Email | `demo@gmail.com` |
| Password | `demo123` |

**What the demo includes:**

- Real JWT authentication — the demo logs in through the same `/api/auth/login` endpoint as any user
- 5 sample short links (one expired) with real click statistics and scannable QR codes
- ~870 visit records: daily click charts, device mix, countries, referrers, browsers
- 3 UTM campaigns, notifications and activity logs
- Full access to dashboard, link creation, analytics, AI chat, QR center, bulk shortener, campaigns, teams, trash and settings

**Demo safety:** the account is shared, so changing its password, deleting the account and reading other users' data are blocked server-side (403/404). Demo data re-seeds automatically on every backend boot if deleted. All data belongs only to the demo account.

---

## ✨ Features

| | Feature | Description |
|---|---------|-------------|
| 🔗 | **Smart URL Shortening** | Auto-generated 7-character short codes via nanoid, with optional custom aliases, titles, tags and categories. |
| ✏️ | **Custom Aliases** | Pick your own `/r/my-alias` path — uniqueness is enforced in the database. |
| 🔐 | **Link Protection** | Password-protected links (bcrypt-checked at redirect), one-time links that deactivate after the first click, and scheduled activation. |
| ⏳ | **Expiry & Geo/Device Rules** | Links can expire on a date, restrict allowed/blocked countries, or block mobile devices — all enforced by the redirect engine. |
| 📊 | **Real-Time Analytics** | Every redirect logs device, browser, OS, country (geoip-lite), referrer and unique-click data; Socket.io pushes live events to the dashboard. |
| 👥 | **Unique Click Tracking** | Hashed-IP deduplication separates total clicks from unique visitors. |
| 📱 | **Device Analytics** | Mobile / desktop / tablet breakdowns plus browser and OS stats. |
| 🌍 | **Geographic Analytics** | Country-level click distribution on per-link and dashboard views. |
| 🤖 | **Gemini AI Insights** | Google Gemini (gemini-2.5-flash) generates engagement scores, performance forecasts, campaign suggestions and URL summaries from your real data. |
| 💬 | **AI Chat Assistant** | Ask questions about your links and analytics in natural language; the assistant reads your live stats. |
| 🛡️ | **URL Safety Checks** | AI-powered spam/phishing checks on destination URLs before you share them. |
| 📦 | **Bulk Shortening** | Create many links at once, or import a CSV of URLs. |
| 🎯 | **Campaign Management** | Group links into UTM campaigns with color coding and per-campaign click stats. |
| 👔 | **Team Collaboration** | Create teams, invite members by email and manage member lists. |
| 🔔 | **Notifications** | In-app notification center with unread counts, Socket.io live delivery and read-all support. |
| 🗑️ | **Trash & Recovery** | Deleting a link moves it to trash (soft delete); restore it any time from the Trash page. |
| 📥 | **Data Export** | Export your links and analytics as CSV. |
| 🧑‍💼 | **Profile & Settings** | Profile details, avatar upload, password change, preferences, account deletion. |
| 📲 | **Progressive Web App** | Installable PWA with service-worker precaching and offline asset caching. |
| 🔑 | **Authentication** | Signup, login, JWT access + refresh tokens (httpOnly cookies), email verification, password reset, brute-force lockout. |
| 🧪 | **Demo Account** | One-click exploration for visitors — no registration, real backend, seeded realistic data. |

> ⚠️ **Known limitations (documented honestly):** email verification/password-reset emails require SMTP env vars — without them the flow is logged instead of sent; team invites create invitation records but there is no email/acceptance UI yet; the social/public bio-page feature was removed from the frontend UI (its backend routes remain as legacy); admin routes exist but there is no admin dashboard in the frontend.

---

## 📸 Screenshots

All screenshots are real captures of the deployed application (demo account).

| | | |
|:---:|:---:|:---:|
| **Landing Page** | **Sign Up** | **Sign In (with Demo Login)** |
| ![Landing page](Screenshot/landing.png) | ![Sign up](Screenshot/signup.png) | ![Login with demo section](Screenshot/login.png) |
| **Dashboard (Demo)** | **Create Link** | **My Links** |
| ![Dashboard overview](Screenshot/dashboard-overview.png) | ![Create link](Screenshot/create-link.png) | ![My links](Screenshot/my-links.png) |
| **Analytics** | **AI Insights** | **QR Center** |
| ![Analytics](Screenshot/analytics-overview.png) | ![AI insights](Screenshot/ai-insights.png) | ![QR center](Screenshot/qr-center.png) |
| **Campaigns** | **Team** | **Bulk Shortener** |
| ![Campaigns](Screenshot/campaigns.png) | ![Team](Screenshot/team.png) | ![Bulk shortener](Screenshot/bulk-shortener.png) |
| **Notifications** | **Activity Logs** | **Trash** |
| ![Notifications](Screenshot/notifications.png) | ![Activity logs](Screenshot/activity-logs.png) | ![Trash](Screenshot/trash.png) |
| **Profile** | **Settings** | |
| ![Profile](Screenshot/profile.png) | ![Settings](Screenshot/settings.png) | |

<details>
<summary><strong>More captures</strong> (click to expand)</summary>

| | |
|:---:|:---:|
| **Demo Login Dashboard** | **Link Created** |
| ![Demo login dashboard](Screenshot/demo-login-dashboard.png) | ![Link created](Screenshot/link-created.png) |
| **Detailed Analytics** | **Dashboard Details** |
| ![Analytics detailed](Screenshot/analytics-detailed.png) | ![Dashboard details](Screenshot/dashboard-details.png) |

</details>

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U[👤 User / Browser<br/>PWA + Service Worker]
    FE[⚛️ React Frontend<br/>Vercel<br/>Vite + Tailwind + Zustand<br/>TanStack Query + Recharts]
    BE[🟣 Express Backend<br/>Render<br/>REST API + JWT auth<br/>Socket.io + rate limiting]
    DB[(🍃 MongoDB Atlas<br/>Users · Links · Visits<br/>Campaigns · Teams · QR<br/>Notifications · Activity)]
    AI[✨ Google Gemini<br/>gemini-2.5-flash]

    U -->|HTTPS| FE
    FE -->|/api/* + Bearer JWT| BE
    FE <-- Socket.io live events --> BE
    BE -->|Mongoose ODM| DB
    BE -->|generateContent| AI
```

**Key flows (matching the source code):**

1. **Authentication** — `POST /api/auth/login` verifies the bcrypt hash, issues a short-lived JWT access token and sets a httpOnly refresh-token cookie; `POST /api/auth/refresh-token` rotates tokens.
2. **Link creation** — `POST /api/links` validates the URL, generates a nanoid short code (or uses the custom alias), attaches UTM/campaign/expiry rules, records a QR data-URL and notifies the user via Socket.io.
3. **Redirect** — `GET /r/:shortCode` looks up by short code *or* custom alias, enforces scheduling/expiry/active/password/geo/device rules, records a `Visit` (device, geo, referrer, unique via hashed IP) asynchronously, increments link stats and 301-redirects to the destination.
4. **AI** — `POST /api/ai/*` endpoints feed your real link data to Gemini for insights, chat, slug suggestions, performance predictions and safety checks.

Read the deep dive in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🧰 Tech Stack

**Frontend** (`frontend/`)

| Technology | Purpose | Verified in |
|------------|---------|-------------|
| React 19 + Vite | SPA framework & build tool | `package.json` |
| React Router 7 | Client-side routing (SPA rewrites on Vercel) | `vercel.json` |
| Tailwind CSS | Styling system | config + source |
| Zustand | Global state (auth store, UI store) | `src/store/` |
| TanStack Query 5 | Server-state caching | `package.json` |
| Recharts | Analytics charts | dashboard components |
| socket.io-client | Real-time click events | `src/sockets/` |
| Framer Motion | Animations | auth/dashboard UI |
| react-hook-form + Zod | Form validation | auth forms |
| react-hot-toast | Notifications | global |
| PWA (vite-plugin-pwa) | Service worker + precache | `vite.config.js` |

**Backend** (`backend/`)

| Technology | Purpose |
|------------|---------|
| Node.js 20 + Express 5 | REST API server |
| MongoDB + Mongoose | Data layer (18+ models) |
| jsonwebtoken | Access + refresh JWTs |
| bcryptjs | Password & link-password hashing |
| Socket.io | Real-time events |
| express-rate-limit | Auth/general/AI rate limiting |
| Helmet · CORS · Morgan · Winston | Security & logging |
| @google/generative-ai | Gemini integration |
| qrcode · geoip-lite · nanoid | QR codes · geo stats · short codes |
| multer · csv-parser · csv-writer · archiver | Uploads, bulk import, exports |

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

---

## ⚙️ Installation

### Step 1 — Prerequisites

- **Node.js 20.x** (backend `engines` field)
- **npm 9+**
- A **MongoDB Atlas** free cluster (or local MongoDB)
- *(Optional)* a **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey) for AI features

### Step 2 — Clone the repository

```bash
git clone https://github.com/thangadurai27/katomaran.git
cd katomaran
```

### Step 3 — Backend installation

```bash
cd backend
npm install
```

### Step 4 — Backend environment setup

```bash
cp .env.example .env    # Windows PowerShell: Copy-Item .env.example .env
```

Edit `backend/.env` — at minimum set `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`. See the [table below](#-environment-variables).

### Step 5 — Frontend installation

```bash
cd ../frontend
npm install
```

### Step 6 — Frontend environment setup *(optional)*

```bash
cp .env.example .env
```

Nothing to fill for the default setup: dev builds talk to `http://localhost:5000`, production builds fall back to the deployed Render API (see `frontend/src/config/env.js`).

### Step 7 — Run the backend

```bash
cd backend
npm run dev        # nodemon, http://localhost:5000
```

On boot the server connects to MongoDB and auto-seeds the demo account (`demo@gmail.com` / `demo123`) — check `/health` for `demoSeedStatus: ok`.

### Step 8 — Run the frontend

```bash
cd frontend
npm run dev        # Vite dev server (default port 5173)
```

### Step 9 — Production build

```bash
cd frontend
npm run build      # outputs dist/ + service worker
npm run preview    # optional: serve the build locally
```

Backend "build" is simply `npm start` (Render runs `node src/server.js`). There are no backend test scripts — see [TESTING_REPORT.md](TESTING_REPORT.md) for how quality was actually verified.

---

## 🔑 Environment Variables

### Backend (`backend/.env`) — full reference in [`DEPLOY.md`](DEPLOY.md)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port (Render injects it automatically) |
| `NODE_ENV` | No | `development` | `production` switches secure cookies + log level |
| `MONGODB_URI` | **Yes** | — | Atlas connection string (URL-encode `@` → `%40`) |
| `MONGODB_DB_NAME` | No | — | Optional DB-name override |
| `JWT_SECRET` | **Yes** | — | Access-token signing secret (boots fail without it) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh-token signing secret (boots fail without it) |
| `JWT_EXPIRE` | No | `15m` | Access-token lifetime |
| `JWT_REFRESH_EXPIRE` | No | `7d` | Refresh-token lifetime |
| `FRONTEND_URL` | **Yes (prod)** | — | Primary allowed origin + email link base (no trailing slash) |
| `CLIENT_URL` | No | — | Additional allowed origin (comma-separated lists are supported) |
| `SHORT_URL_BASE` | Recommended | — | Must end with `/r/`; used for `shortUrl` fields and QR targets |
| `GEMINI_API_KEY` | No | — | [Google AI Studio key](https://aistudio.google.com/apikey); AI endpoints degrade gracefully without it |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Gemini model id |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | No | — | SMTP for verification/reset emails; unset = emails skipped and links logged |
| `BCRYPT_ROUNDS` | No | `10` | bcrypt cost factor |

### Frontend (`frontend/.env`) — build-time via Vite

| Variable | Required | Default (from `src/config/env.js`) |
|----------|----------|-------------------------------------|
| `VITE_API_URL` | No | prod: `https://katomaran-y789.onrender.com/api` · dev: `http://localhost:5000/api` |
| `VITE_BASE_URL` | No | prod: `https://katomaran-y789.onrender.com` · dev: `http://localhost:5000` |
| `VITE_SHORT_URL_BASE` | No | prod: `...onrender.com/r/` · dev: `http://localhost:5000/r/` |

> 🔒 Never commit real `.env` files — `.gitignore` excludes them. The values above are placeholders only.

---

## 📡 API Documentation

Complete endpoint reference with request/response examples lives in **[`docs/API.md`](docs/API.md)**. Summary:

| Group | Base path | Auth | Highlights |
|-------|-----------|------|------------|
| Auth | `/api/auth` | public (+ refresh/me) | signup, login, logout, refresh-token, verify-email, forgot/reset-password, me |
| Users | `/api/users` | JWT | profile, change-password, avatar upload, delete-account |
| Links | `/api/links` | JWT | CRUD, stats overview, bulk ops, archive toggle, trash via `?trashed=true` |
| Redirect | `/r/:shortCode` | public | 301 redirect + visit tracking + rule enforcement |
| Analytics | `/api/analytics` | JWT | overview, per-link, realtime visits |
| AI | `/api/ai` | JWT + AI rate limit | insights, chat, slug ideas, safety check, predictions, summaries |
| QR | `/api/qr` | JWT | PNG data-URL & SVG generation, list |
| Campaigns | `/api/campaigns` | JWT | CRUD with cached stats |
| Teams | `/api/teams` | JWT | create, invite, remove members |
| Notifications | `/api/notifications` | JWT | list, mark read/read-all, delete |
| Activity | `/api/activity` | JWT | paginated audit log |
| Bulk | `/api/bulk` | JWT | CSV import, bulk create |
| Export | `/api/export` | JWT | CSV export of links & analytics |
| Bio (legacy) | `/api/bio` | mixed | backend-only; removed from frontend UI |
| Admin | `/api/admin` | JWT + admin | platform stats, ban/unban, user list |
| Stats | `/api/stats/:shortCode` | public | public per-link click counters |

All data routes sit behind the `protect` middleware (verified across all 16 route files). Global rate limiting applies to `/api/*`, with stricter limits on auth and AI endpoints.

---

## 🚢 Deployment

The full from-scratch guide is in **[`DEPLOY.md`](DEPLOY.md)**: MongoDB Atlas setup, Render backend (incl. demo-account seeding), Vercel frontend, CORS configuration, SPA rewrites, PWA caching and a post-deploy verification checklist.

**Quick facts:**

- **Frontend** — Vercel, root directory `frontend/`, framework *Vite*, build `npm run build`, output `dist/`. `frontend/vercel.json` handles SPA rewrites and cache headers (immutable hashed assets, `must-revalidate` for `index.html`/`sw.js`).
- **Backend** — Render Web Service, root directory `backend/`, build `npm install`, start `npm start`, Node 20. Health check at `/health`.
- **Database** — MongoDB Atlas free cluster; `0.0.0.0/0` network access for Render.
- **CORS** — origins must be whitelisted via `FRONTEND_URL`/`CLIENT_URL`; requests from unknown origins are rejected (no wildcard CORS).

---

## 🧪 Testing

See **[`TESTING_REPORT.md`](TESTING_REPORT.md)** for the full record of what was tested, passed, and *not* tested. Highlights, all executed against the production deployment:

- Frontend production build (`npm run build`) — passes with PWA precache
- Backend syntax checks on all modified modules — pass
- End-to-end browser tests (Playwright, fresh sessions): landing → signup/login → demo login → all 13 dashboard pages, **zero console errors**
- API tests: demo login issues valid JWT; demo safety guards return 403 (password change, account delete) and 404 (foreign link); forgot-password returns a generic response
- Redirect engine verified live: expired link redirects to the `/expired` page, visits recorded with device/geo/unique data

---

## 🔒 Security

- **Password hashing** — bcrypt (cost 10 by default, tunable via `BCRYPT_ROUNDS`); passwords are never returned by the API (`select: false`)
- **JWT handling** — separate access/refresh secrets; access token in memory, refresh token in an httpOnly `SameSite=None; Secure` cookie in production; logout revokes cookies
- **Authorization & data isolation** — every query is scoped by `user: req.user._id`; foreign resources 404; admin routes additionally require `requireAdmin`
- **Input validation** — express-validator, Zod on the frontend, URL validation before any link is created
- **Rate limiting** — global limiter on `/api/*` plus dedicated auth and AI limiters
- **CORS** — strict origin whitelist built from `FRONTEND_URL`/`CLIENT_URL`; no wildcard
- **Headers & hardening** — Helmet, payload size limits, Mongo error surface minimized (`bufferCommands: false`, fail-fast DB errors)
- **Secrets** — all credentials live in environment variables, excluded from git; demo credentials are intentionally public and scoped to a dedicated account that cannot change its own credentials

---

## 🔮 Future Improvements

- Team invite acceptance flow with email invitations
- Custom domains for short links
- A/B testing and link rotation
- Retargeting pixels (Facebook, Google)
- Admin dashboard in the frontend (routes already exist server-side)
- Bio pages re-introduced as a polished public profile feature
- Automated test suite (unit + integration) in CI
- Demo data self-service reset button

---

## 📄 License

Released under the **MIT License**. See the [package.json license field](backend/package.json) — `license: "MIT"`.

---

<div align="center">

**[Live App](https://katomaran-eight.vercel.app)** · **[API Health](https://katomaran-y789.onrender.com/health)** · **[API Docs](docs/API.md)** · **[Deploy Guide](DEPLOY.md)** · **[Testing Report](TESTING_REPORT.md)** · **[Interview Prep](docs/interview-preparation/README.md)**

Built with React · Node.js · MongoDB · Gemini AI

</div>
