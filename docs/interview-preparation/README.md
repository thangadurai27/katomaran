# SnapLink AI — Interview Preparation Guide

A complete, source-code-based interview preparation pack for the **SnapLink AI** project (https://github.com/thangadurai27/katomaran).

> **Everything in this guide is grounded in the actual repository** — real file paths, real function names, real request flows. Where a feature is partial or missing, that is stated openly, because interviewers reward honesty and punish bluffing.

## 📚 Recommended Learning Order

| Order | File | Why read it now | Est. time |
|-------|------|-----------------|-----------|
| 1 | [01-Project-Introduction.md](01-Project-Introduction.md) | Your 30-second / 1-min / 3-min pitches. Memorize these first. | 30 min |
| 2 | [03-System-Architecture.md](03-System-Architecture.md) | The mental map everything else hangs on. | 1 hr |
| 3 | [04-Features-Deep-Dive.md](04-Features-Deep-Dive.md) | Feature-by-feature: what/why/how, with files and endpoints. | 2 hr |
| 4 | [05-Backend-Deep-Dive.md](05-Backend-Deep-Dive.md) | Express lifecycle, JWT, middleware, 5 traced API requests. | 2 hr |
| 5 | [06-Database-Deep-Dive.md](06-Database-Deep-Dive.md) | All 8 Mongoose models, indexes, relationships. | 1.5 hr |
| 6 | [07-AI-Integration.md](07-AI-Integration.md) | Gemini prompts, JSON handling, fallbacks — the AI-engineer angle. | 1 hr |
| 7 | [02-Tech-Stack.md](02-Tech-Stack.md) | "Why did you choose X?" — technology justifications. | 1.5 hr |
| 8 | [08-Security.md](08-Security.md) | What's protected, what's not — be precise. | 1 hr |
| 9 | [09-Deployment-DevOps.md](09-Deployment-DevOps.md) | Vercel/Render/Atlas story + real production incidents. | 1 hr |
| 10 | [10-Challenges-And-Solutions.md](10-Challenges-And-Solutions.md) | STAR-style war stories (the demo-seed bug is gold). | 1 hr |
| 11 | [13-Project-Uniqueness.md](13-Project-Uniqueness.md) | The "why your project?" answer. | 30 min |
| 12 | [14-Interview-Presentation.md](14-Interview-Presentation.md) | 5-min and 10-min presentation scripts. | 1 hr |
| 13 | [12-Real-Time-Scenarios.md](12-Real-Time-Scenarios.md) | "What happens when…" questions. | 1 hr |
| 14 | [11-150-Interview-Questions.md](11-150-Interview-Questions.md) | The drill bank — revise daily, quiz yourself. | 4+ hr (iterate) |
| 15 | [15-Mock-Interview-Guide.md](15-Mock-Interview-Guide.md) | Interactive practice — start when 1–14 feel solid. | ongoing |

## 🧭 How to use this pack

1. **First pass (reading):** chapters 1–10 in order. Skim code files alongside.
2. **Second pass (recall):** cover the answers in chapter 11 and answer aloud.
3. **Daily drill:** 10 random questions from chapter 11 + 2 scenarios from chapter 12.
4. **Mock interviews:** use chapter 15 with a friend (or with an AI assistant) — one question at a time, scored out of 10.

## 🔎 Verification

Every chapter was written by inspecting the repository source: `backend/src/{routes,controllers,models,middlewares,utils,configs,sockets}`, `frontend/src/{pages,components,stores,lib,config}`, both `package.json` files, deployment configs (`frontend/vercel.json`, `backend/package.json`), and the live production deployment. No feature is claimed without a file path or a test to back it.

**Project facts at a glance** (memorize these):

- Frontend: React 19 + Vite + Tailwind + Zustand + TanStack Query + Socket.io-client + PWA (`frontend/`)
- Backend: Node 20 + Express 5 + Mongoose 9 + Socket.io + JWT (`backend/src/server.js`)
- Database: MongoDB Atlas, 8 models (`backend/src/models/`)
- AI: Google Gemini `gemini-2.5-flash` via `@google/generative-ai` (`backend/src/configs/gemini.js`)
- Deployment: Vercel (SPA) + Render (API) + Atlas (DB)
- Live: frontend `katomaran-eight.vercel.app`, API `katomaran-y789.onrender.com`, short links `/r/:shortCode`
- Demo account: `demo@gmail.com` / `demo123` (seeded by `backend/src/utils/demoSeed.js`)
