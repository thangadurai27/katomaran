# Deploy SnapLink AI (Katomaran)

Monorepo: **frontend** → [Vercel](https://vercel.com), **backend** → [Render](https://render.com).

## Your live URLs

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://katomaran-eight.vercel.app |
| **Backend (Render)** | https://katomaran-y789.onrender.com |

**Render must have:** `FRONTEND_URL=https://katomaran-eight.vercel.app` (no trailing slash), then **Redeploy** backend.

Use `.env.example` files locally (copy to `.env` and fill real values). **Never commit `.env` files.**

---

## Fix HTTP 500 on signup/login (`buffering timed out`)

That error means **MongoDB is not connected** on Render.

1. **Render → Environment** → set `MONGODB_URI` to your full Atlas connection string.
2. **MongoDB Atlas → Network Access** → **Allow Access from Anywhere** (`0.0.0.0/0`).
3. URL-encode special characters in the database password (`@` → `%40`, `#` → `%23`).  
   Example: password `Snaplink@123` → `Snaplink%40123` in the URI.
4. If logs show `EBADNAME _mongodb._tcp.123`, the `@` in the password was not encoded.
5. Example URI: `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/katomaran?retryWrites=true&w=majority`
6. Save → **Redeploy** Render → open `/health` → `"mongo": "connected"`.

---

## 1. MongoDB Atlas (required for production)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Database Access → add user (username/password).
3. Network Access → allow `0.0.0.0/0` (or Render’s IPs if you restrict later).
4. Connect → Drivers → copy connection string.
5. Replace `<password>` and set database name, e.g. `katomaran`.

Example:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/katomaran?retryWrites=true&w=majority
```

---

## 2. Backend on Render

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect GitHub repo `thangadurai27/katomaran`.
3. Settings:

| Setting | Value |
|--------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance** | Free (or paid) |

4. **Environment** → add variables (use your real secrets, not `xxxx`):

| Key | Example / notes |
|-----|------------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render sets `PORT` automatically; keep `5000` or leave Render default) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (no trailing slash) |
| `CLIENT_URL` | Same as `FRONTEND_URL` if you prefer that name on Render |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Different long random string |
| `JWT_EXPIRE` | `15m` |
| `JWT_REFRESH_EXPIRE` | `7d` |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `SHORT_URL_BASE` | `https://YOUR-SERVICE.onrender.com/r/` |
| `EMAIL_*` | Optional; only if using password reset email |

5. Deploy → copy service URL, e.g. `https://katomaran-api.onrender.com`.

6. **Health check**: open `https://YOUR-SERVICE.onrender.com/api/health` (if you have a health route) or test login from the frontend after Vercel deploy.

> Free Render services sleep after inactivity; first request may be slow.

---

## 3. Frontend on Vercel

1. [Vercel](https://vercel.com) → **Add New Project** → import `thangadurai27/katomaran`.
2. Settings:

| Setting | Value |
|--------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

3. **Environment Variables** (Production) — optional if `frontend/.env.production` is committed:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com/api` |
| `VITE_BASE_URL` | `https://YOUR-SERVICE.onrender.com` |
| `VITE_SHORT_URL_BASE` | `https://YOUR-SERVICE.onrender.com/r/` |

> Without these, the app still uses `frontend/.env.production` defaults on build.

4. Deploy → copy URL, e.g. `https://katomaran.vercel.app`.

5. Go back to **Render** → set `FRONTEND_URL` to your Vercel URL → **Redeploy** backend (CORS + cookies).

6. In Vercel, **Redeploy** frontend if you changed env vars (Vite bakes `VITE_*` at build time).

---

## 4. Order of operations

1. Push code to GitHub (this repo).
2. Deploy **backend** on Render (with placeholder `FRONTEND_URL` if needed).
3. Deploy **frontend** on Vercel with Render URLs in `VITE_*`.
4. Update Render `FRONTEND_URL` to Vercel URL → redeploy backend.
5. Test: signup, create link, short URL redirect, AI chat.

---

## 5. Local development

```bash
# Backend
cd backend
cp .env.example .env
# edit .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
# edit .env
npm install
npm run dev
```

---

## 6. Security checklist

- Rotate `GEMINI_API_KEY` if it was ever shared or committed.
- Use strong `JWT_SECRET` / `JWT_REFRESH_SECRET` in production.
- Do not commit `.env` — only `.env.example` with `xxxx` placeholders.
