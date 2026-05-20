# Katomaran (SnapLink AI)

URL shortener with analytics, dashboards, and Gemini-powered AI insights.

## Stack

- **Frontend:** React 19, Vite, Tailwind — deploy on [Vercel](https://vercel.com)
- **Backend:** Node.js, Express, MongoDB, Socket.io — deploy on [Render](https://render.com)

## Quick start

See [DEPLOY.md](./DEPLOY.md) for production deployment.

```bash
cd backend && cp .env.example .env && npm install && npm run dev
cd frontend && cp .env.example .env && npm install && npm run dev
```

- API: `http://localhost:5000`
- App: `http://localhost:5173`

**Production:** [katomaran-eight.vercel.app](https://katomaran-eight.vercel.app) → API [katomaran-y789.onrender.com](https://katomaran-y789.onrender.com)

## Repository layout

```
backend/     # Express API
frontend/    # Vite React app
```

Environment templates: `backend/.env.example`, `frontend/.env.example`.
