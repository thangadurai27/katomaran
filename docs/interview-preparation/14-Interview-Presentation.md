# Chapter 14 — Interview Presentation Scripts

## Full presentation skeleton (use for both lengths)

1. Hook + problem → 2. Solution demo → 3. Architecture → 4. Feature highlights → 5. AI integration → 6. Database → 7. Challenges → 8. Security → 9. Future → 10. Close.

---

## 5-Minute Script

**[0:00–0:30] Hook**
> "Every marketer asks the same three questions after sharing a link: *Who clicked? Which campaign worked? What should I do next?* Traditional shorteners answer none of them. I built SnapLink AI to answer all three."

**[0:30–1:30] Solution demo (words if no screen)**
> "You paste a URL, get a short link, and the dashboard shows every click — device, browser, country, referrer — updating live via Socket.io. There's an AI assistant that answers questions about *your own* traffic. Anyone can try it instantly: the login page has a Try Demo Account button with realistic seeded data."

**[1:30–3:00] Architecture**
> "React 19 SPA on Vercel, Express 5 API on Render, MongoDB Atlas. The interesting path is the redirect: `/r/:shortCode` resolves by short code *or* custom alias, enforces nine rule types — scheduling, expiry, active state, bcrypt password, geo allow/block, device rules, one-time, deep links — records a Visit document with device and geo data, and 301s to the destination. Analytics are recorded asynchronously so the redirect is never delayed. Auth is a JWT pair: 15-minute access token plus a 7-day refresh token in an httpOnly cookie, with single-flight refresh on the frontend. Gemini runs server-side only and receives the results of real MongoDB aggregations — structured JSON prompts, with fallbacks so AI failure never breaks the product."

**[3:00–4:00] Challenges (the credibility segment)**
> "The best bug I fixed: demo seeding silently never ran in production because my DB-connection waiter hung forever on readyState 2 — neither 'connected' nor 'disconnected'. I made boot-time seeding observable on the health endpoint, which surfaced a second bug (a missing import) that had been silently swallowed. Now `/health` shows `demoSeedStatus`. That taught me: invisible background jobs must be observable."

**[4:00–4:40] Security + deployment**
> "bcrypt, separate JWT secrets, strict CORS whitelist with credentials, five rate-limit classes, ownership scoping returning 404 for foreign data, secret-salted IP hashing for unique visitors. Deployed on Vercel + Render + Atlas; pushes deploy automatically; verified with a checklist including live redirect tests."

**[4:40–5:00] Close**
> "Version 2 priorities: an automated test suite, email delivery, and team invite acceptance. The demo is live at katomaran-eight.vercel.app — one click, no signup."

---

## 10-Minute Script (adds depth to beats 3–5)

Reuse the 5-minute script, then expand:

**Architecture (add 2 min):** walk the request lifecycle: helmet → CORS whitelist → compression → body parser → cookies → general limiter (200/15min) → requireDb → route → `protect` (JWT verify + user load) → controller → envelope response `{success, message, data, timestamp}` → central error handler. Then the **database tour**: 8 models — User (bcrypt hook, lockout fields), Link (unique shortCode + sparse-unique alias, cached stats, embedded QR), Visit (per-click doc, hashed IP), Campaign, Team (embedded members), Notification, ActivityLog (strict action enum). Explain the denormalization decision: counters on parents, aggregations only for charts.

**AI integration (add 2 min):** show one prompt structure (role → real aggregates → constraints → JSON schema). Explain the split rule: *"anything that must be correct or fast is code; anything that must be articulate is AI."* Cover fallbacks: missing/invalid key → instructive message; quota → wait message; unknown model → auto-retry with `gemini-2.5-flash`; per-endpoint canned JSON. Rate limit: 10/min/user.

**Q&A prep (remaining time):** steer to your strongest stories: the seeding incident (Chapter 10), single-flight refresh, hot-path redirect design, demo account protection (live-verified 403s).

---

## One-page section summaries (memorize)

**Problem statement:** "URL shorteners tell you *how many*, not *who, where, and what to do next*. Campaigns, audiences and advice live in separate tools."

**Proposed solution:** "One platform: short links with real controls, per-click analytics streamed live, and an AI layer that reads your actual data."

**Tech stack (30 s):** React 19 + Vite + Tailwind + Zustand + TanStack Query + Recharts + Socket.io client + PWA; Node 20 + Express 5 + Mongoose 9 + Socket.io + JWT + bcrypt + rate limiting; MongoDB Atlas; Gemini `gemini-2.5-flash`; Vercel + Render + Atlas.

**Architecture (30 s):** SPA ↔ REST/WebSocket ↔ API ↔ Mongo; public redirect engine bypasses `/api`; AI server-side only; demo seeded at boot.

**Important features (pick 5):** redirect engine with 9 rule types · unique-click tracking via secret-salted IP hashes · AI insights grounded in real aggregations · QR codes persisted per link · one-click demo account with server-side guards.

**Challenges (pick 2):** the seeding-observability incident; the single-flight refresh race.

**Future enhancements:** test suite + CI, transactional email, team invite acceptance, SSRF hardening, analytics rollups, AI streaming/memory, admin UI, custom domains.

**Conclusion (20 s):** "I didn't just build a shortener — I built, deployed, debugged and documented a small production system. The demo is live; try the demo button."

---

## Delivery tips

- Lead every architecture answer with a one-line summary, then detail on request.
- Use file/function names as proof: `handleRedirect`, `protect`, `demoSeed.js`, `lib/api.js`.
- When unsure about a product decision, say the trade-off — never bluff an unimplemented feature.
- Always end feature answers with the honest limitation + your fix plan.
