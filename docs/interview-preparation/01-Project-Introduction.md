# Chapter 1 — Project Introduction

## What is SnapLink AI?

SnapLink AI is a **full-stack URL shortener and link analytics platform**. Users paste a long URL, get a short link (`https://katomaran-y789.onrender.com/r/{shortCode}`), and every click on that link is recorded — device, browser, OS, country, city, referrer — and shown in a real-time dashboard. On top of that analytics sits **Google Gemini AI**, which answers questions about your traffic in plain English, predicts link performance, suggests memorable slugs, and checks destination URLs for spam/phishing.

- **Live app:** https://katomaran-eight.vercel.app
- **API:** https://katomaran-y789.onrender.com (health: `/health`)
- **Repo:** https://github.com/thangadurai27/katomaran (monorepo: `frontend/` + `backend/`)
- **Demo:** login page → "🚀 Try Demo Account" (`demo@gmail.com` / `demo123`)

## What problem does it solve?

Traditional shorteners (bit.ly, tinyurl) stop at "make it short." Three problems remain unsolved for most users:

1. **"Who is clicking, and from where?"** — you get a click count, not an audience picture.
2. **"Which campaign actually works?"** — clicks aren't connected to UTM campaigns or teams.
3. **"What should I do next?"** — no tool turns the data into advice.

SnapLink AI solves all three in one place: a redirect engine that logs rich per-click context, a dashboard that aggregates it in real time (Socket.io), and an AI layer that explains and advises.

## Why was this project built?

It was built as an end-to-end demonstration of production-style full-stack engineering: real authentication with refresh tokens, real traffic (public redirect endpoint), real-time events, an external AI service, and cloud deployment (Vercel + Render + Atlas) — not a toy CRUD app.

## Target users

| User | What they get |
|------|---------------|
| Digital marketers | UTM campaigns, geo/device analytics, AI recommendations |
| Content creators | Short links + QR codes + referrer tracking |
| Developers | Bulk import, custom aliases, CSV export, self-hostable stack |
| Small teams | Team spaces with roles, shared analytics |
| First-time visitors | Zero-friction demo account with seeded realistic data |

## Problems with traditional URL shorteners (and how SnapLink AI answers)

| Traditional shortener | SnapLink AI |
|---|---|
| Click counter only | Per-visit records: device, browser, OS, country, city, referrer, unique flag (`backend/src/models/Visit.model.js`) |
| No real-time view | Socket.io pushes `link:created` and live click events (`backend/src/sockets/socketManager.js`) |
| No intelligence | Gemini insights, chat assistant, predictions (`backend/src/controllers/ai.controller.js`) |
| Weak link controls | Password, expiry, scheduling, one-time, geo/device restrictions, deep links (`Link.model.js`) |
| Poor first-visit UX | Public demo account with real seeded data (`backend/src/utils/demoSeed.js`) |

## What makes this project unique?

1. **AI that reads your real data** — the analytics-insights endpoint runs MongoDB aggregations first (`getAnalyticsInsights` in `ai.controller.js`), then feeds the *actual* aggregates to Gemini. It never invents numbers.
2. **A redirect engine, not just a redirect** — one endpoint (`redirect.controller.js → handleRedirect`) enforces scheduling, expiry, active-state, password (bcrypt), geo allow/block lists, device rules, one-time deactivation, deep links and UTM forwarding.
3. **Honest demo mode** — a real JWT-issued login with seeded visits, guarded server-side (password change/delete → 403).
4. **Production hygiene** — rate limiting per route class, strict CORS whitelist, Helmet, bcrypt everywhere, hashed IPs for unique-click privacy.

## Real-world use cases

- A launch campaign: create a campaign ("Spring Product Launch"), generate links with UTM params, watch clicks arrive live, ask the AI assistant "which channel drove the most clicks?"
- Print/physical media: generate QR codes pointing to short links; scans are tracked like any visit.
- A dev team: bulk-import 50 documentation URLs, tag them, export as CSV.
- Sharing gated content: password-protected or one-time links.

## Project objectives

1. Build a production-shaped SaaS: auth, multi-tenant data isolation, rate limiting, deployment.
2. Integrate an LLM (Gemini) meaningfully — data-in, data-out, with fallbacks.
3. Demonstrate real-time engineering (Socket.io rooms per user).
4. Keep security fundamentals right (bcrypt, JWT pair, CORS whitelist, rate limits).
5. Make it instantly explorable (demo account).

## Project scope

**In scope / done:** auth + refresh, link CRUD with advanced options, redirect engine, visit tracking, analytics APIs, AI endpoints, QR, campaigns, bulk, teams, notifications, activity logs, trash, exports, PWA, demo account, deployment.

**Out of scope / honest gaps:** email delivery requires SMTP env vars (skipped if unset), team invite acceptance UI, custom domains, admin dashboard UI (API exists), bio pages removed from UI (backend routes remain).

---

## 🎤 Your prepared answers

### 30-second introduction

> "SnapLink AI is a full-stack URL shortener with an analytics brain. Users shorten links, and every click is captured — device, browser, country, referrer — streamed live to a React dashboard via Socket.io. I integrated Google Gemini so users can ask questions about their own traffic and get insights, predictions and safety checks. It's built with React, Vite, Node.js, Express, MongoDB and Gemini, deployed on Vercel and Render, and anyone can try it instantly with a demo account that has realistic seeded data."

### 1-minute explanation

Add to the above: auth (JWT access + refresh in httpOnly cookies), the redirect engine's rule checks (expiry, password, geo, device), data isolation (every query scoped by `user`), rate limiting per route class, and the demo account story (backend seeds data idempotently on boot; guards return 403 for destructive actions). Mention the live URLs.

### 3-minute detailed explanation

Structure it in 4 beats:

1. **Problem (30 s):** shorteners give you a number, not an audience; campaigns aren't connected; no advice.
2. **Architecture (60 s):** React 19 SPA (Vercel) → Express 5 API (Render) → MongoDB Atlas. Socket.io for real-time. Redirect requests hit the backend directly at `/r/:shortCode` — look up by shortCode *or* custom alias, enforce rules, log a `Visit` document asynchronously, increment cached stats on the `Link`, 301 to the destination. Gemini is called server-side only (key never leaves the backend).
3. **Features (60 s):** pick 5 you can defend — real-time analytics, unique-click tracking via SHA-256 hashed IPs, AI insights from real aggregations, QR codes, campaigns/UTM, demo account.
4. **Engineering rigor (30 s):** rate limiters (general 200/15min, auth 10/15min, AI 10/min), strict CORS whitelist with Vercel-preview regex, Helmet, ownership checks returning 404, idempotent demo seeding with `/health` observability, and a real production bug you fixed (the `connectDB` waiter hang — see Chapter 10).

### Resume-ready description

> **SnapLink AI — Full-Stack URL Shortener & Analytics Platform** *(React 19, Vite, Node.js 20, Express 5, MongoDB, Socket.io, Google Gemini, Vercel, Render)*
> Built and deployed a production-style SaaS that shortens URLs and tracks every click (device, geo, referrer, unique visits via hashed IPs) in a real-time dashboard.
> - Implemented JWT authentication with access/refresh token rotation, httpOnly cookies and single-flight refresh on the frontend (Axios interceptors, Zustand store).
> - Engineered a redirect engine (`/r/:shortCode`) enforcing expiry, password, geo/device restrictions and one-time links while logging visits asynchronously.
> - Integrated Google Gemini (gemini-2.5-flash) for AI insights, a chat assistant, performance prediction and URL safety checks — prompts fed by live MongoDB aggregation results, with graceful fallbacks.
> - Added an idempotently-seeded public demo account with server-side protections (403 on credential changes), observable via `/health`.
> - Secured the API with per-route rate limiting, strict CORS whitelisting, Helmet and bcrypt; deployed on Vercel + Render + MongoDB Atlas.

### Interview-ready self-explanation (memorize the skeleton)

> "I built SnapLink AI to prove I can ship a complete product, not just screens. The hardest and most interesting parts were: (1) the redirect hot path, which must be fast but still record rich analytics — I solved it by recording visits asynchronously so the user's 301 is never blocked; (2) authentication, where I implemented a real refresh-token flow including single-flight refresh in the Axios interceptor so parallel 401s share one refresh call; (3) the AI layer, where I feed Gemini the *results of real MongoDB aggregations* so insights are grounded in actual data; and (4) the demo account, where I learned a painful lesson about a startup-ordering bug that silently skipped boot-time seeding — I made seeding observable through `/health` afterwards. The project is deployed and you can try it right now with the demo button."
