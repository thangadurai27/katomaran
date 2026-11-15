# SnapLink AI — API Reference

Base URL: `https://katomaran-y789.onrender.com/api` (local: `http://localhost:5000/api`)

Every endpoint below is verified against `backend/src/routes/*.js` (16 route files). All routes are mounted with a global rate limiter and `requireDb` (fast failure when MongoDB is down); per-route auth is noted.

**Response envelope** (all JSON endpoints):

```json
{ "success": true, "message": "Short link created successfully!", "data": { } }
```

Errors use the same shape with `"success": false` and an appropriate HTTP status.

**Authentication:** protected routes accept `Authorization: Bearer <accessToken>`. A refresh token is set as an httpOnly cookie by login/signup and used by `POST /api/auth/refresh-token`.

---

## Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | public · rate-limited | Create account (name, email, password ≥ 8). Sends verification email when SMTP configured; returns token pair + user. |
| POST | `/login` | public · rate-limited | Email + password → JWT access token, httpOnly refresh cookie, user object. Demo account: `demo@gmail.com` / `demo123`. |
| POST | `/logout` | JWT | Clears the refresh cookie. |
| POST | `/refresh-token` | public (cookie) | Rotates the token pair. |
| GET | `/verify-email/:token` | public | Marks the account verified. |
| POST | `/forgot-password` | public · rate-limited | Always returns a generic response (no user enumeration). Demo account: response only, no email. |
| POST | `/reset-password/:token` | public · rate-limited | Sets a new password (blocked with `403` for the demo account). |
| GET | `/me` | JWT | Current user (`toPublicUser` shape, includes `isDemo`). |

**Login response example:**

```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "_id": "…", "name": "Demo User", "email": "demo@gmail.com",
      "username": "demo", "role": "user", "plan": "free",
      "isDemo": true, "isEmailVerified": true, "createdAt": "…"
    }
  }
}
```

**Errors:** `401` invalid credentials · `423` account locked · `400` validation · `429` rate limit · `500` `MISSING_JWT_SECRET` when server env is broken.

---

## Users & Profile — `/api/users`

| Method | Endpoint | Auth | Body / notes |
|--------|----------|------|--------------|
| GET | `/profile` | JWT | Current profile. |
| PUT | `/profile` | JWT | Whitelisted fields: `name`, `username`, `bio`, `website`, `location`, `company`, `timezone`, `preferences`. |
| PUT | `/change-password` | JWT | `{currentPassword, newPassword}`. **Demo: `403`.** |
| POST | `/avatar` | JWT | `multipart/form-data` field `avatar` (multer upload). |
| DELETE | `/account` | JWT | `{password}` confirm. **Demo: `403`.** |
| GET | `/` | JWT + admin | All users (admin). |

---

## Links — `/api/links`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | JWT | List links. Query: `page`, `limit`, `search`, `status` (`active`/`expired`/…), `trashed=true` for Trash view, `campaign`, `tag`. |
| POST | `/` | JWT · link rate-limited | Create. Body: `originalUrl` (required, validated), `customAlias`, `title`, `description`, `expiresAt`, `password` + `isPasswordProtected`, `isOneTime`, `utmParams {source, medium, campaign, term, content}`, `campaignId`, `tags`, `deepLink {android, ios}`, `geoRestrictions {allowed[], blocked[]}`, `scheduledAt`. Returns the full link incl. `shortUrl` and QR data-URL; notifies + emits `link:created`. |
| GET | `/:id` | JWT | Single link (ownership-enforced → `404` otherwise). |
| PUT | `/:id` | JWT | Update allowed fields: `title`, `description`, `originalUrl`, `tags`, `expiresAt`, `isActive`, `isTrashed` (set `false` = restore from Trash), `utmParams`, `deepLink`, `geoRestrictions`, `isFavorited`, `isPinned`. |
| DELETE | `/:id` | JWT | Soft delete → `isTrashed: true, isActive: false` (Trash). |
| PATCH | `/:id/archive` | JWT | Toggle archive. |
| POST | `/bulk` | JWT | `{action: "trash"\|"restore"\|…, linkIds[]}` for bulk operations. |
| GET | `/stats/overview` | JWT | Dashboard aggregate: totals (links, active, expired), recent links. |

**Create response (trimmed):**

```json
{
  "success": true,
  "message": "Short link created successfully!",
  "data": {
    "link": {
      "_id": "…", "shortCode": "jAp--L-", "originalUrl": "https://example.com",
      "shortUrl": "https://katomaran-y789.onrender.com/r/jAp--L-",
      "qrCode": { "url": "data:image/png;base64,…", "generatedAt": "…" },
      "stats": { "totalClicks": 0, "uniqueClicks": 0 },
      "isActive": true, "isTrashed": false, "createdAt": "…"
    }
  }
}
```

---

## Redirect — public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/r/:shortCode` | public · rate-limited | Resolves by `shortCode` **or** `customAlias`; enforces scheduled/expiry/active/password/geo/device rules; records a `Visit` and bumps link stats; `301` to destination (+UTM params, deep-link overrides). Password-protected links accept `?p=<password>` or header `x-link-password`. |

**Redirect failures:** visitor is sent to a frontend page — `/404?code=…`, `/scheduled`, `/expired`, `/inactive`, `/protected/:code`, `/geo-blocked`, `/device-blocked`.

---

## Analytics — `/api/analytics`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/overview` | JWT | Dashboard-wide stats for `?days=N`: total/unique clicks, country, device, browser, OS, referrer breakdowns, daily series. |
| GET | `/link/:linkId` | JWT | Per-link analytics incl. hourly pattern and top referrers (ownership-enforced). |
| GET | `/realtime` | JWT | Recent visits feed for the realtime panel. |

---

## AI — `/api/ai` (JWT + dedicated AI rate limit)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/chat` | `{message}` | Chat assistant answering from your real link data. |
| POST | `/analytics-insights` | `{linkId?, days?}` | Natural-language insights over analytics. |
| POST | `/generate-slug` | `{originalUrl, title?}` | Smart alias ideas. |
| POST | `/check-url` | `{url}` | Spam/phishing safety verdict. |
| POST | `/predict-performance` | `{linkId}` | Predicted future clicks. |
| POST | `/summarize-url` | `{url}` | Destination page summary. |
| POST | `/campaign-suggestions` | `{context?}` | Campaign naming/structuring suggestions. |

All require `GEMINI_API_KEY` at the server; otherwise a graceful "AI not configured" error is returned.

---

## QR Codes — `/api/qr`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List the user's generated QR codes. |
| POST | `/generate` | `{url, linkId?, options {width, margin, dark, light, errorCorrectionLevel}}` → PNG data-URL; saved onto the link's `qrCode` subdoc. |
| POST | `/generate-svg` | Same input → raw SVG string. |

---

## Campaigns — `/api/campaigns`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List (paginated), with cached `stats {totalLinks, totalClicks, uniqueClicks}`. |
| POST | `/` | `{name, description?, status?, startDate?, endDate?, tags?, color?, utmSource?, utmMedium?, utmCampaign?}`. |
| GET / PUT / DELETE | `/:id` | Read / update / delete (ownership-enforced). |

---

## Teams — `/api/teams`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Team aggregate for the current user. |
| GET | `/` · `/:id` | List / detail. |
| POST | `/` | `{name, description?}` — creator becomes owner. |
| POST | `/:id/invite` | `{email, role?}` → creates invitation record (email delivery requires SMTP; no acceptance UI yet). |
| DELETE | `/:id/members/:memberId` | Remove member (owner). |

---

## Notifications — `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Paginated list + `unreadCount`. |
| PATCH | `/:id/read` | Mark one read. |
| PATCH | `/read-all` | Mark all read. |
| DELETE | `/:id` | Delete one. |

## Activity — `/api/activity`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Paginated audit log for the current user (`action`, `description`, `metadata`, timestamps). |

---

## Bulk — `/api/bulk`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/import` | `multipart/form-data` `file` (CSV with URL column) → creates links in bulk. |
| POST | `/create` | `{urls[]}` → bulk-create short links. |

## Export — `/api/export`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/links` | CSV download of the user's links. |
| GET | `/analytics` | CSV download of visit records. |

---

## Public Stats — `/api/stats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/:shortCode` | public | Public click counters for a short code. |

---

## Bio Pages — `/api/bio` (legacy, backend-only)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET / PUT | `/me` | JWT |
| GET | `/:username` | public |
| POST | `/:username/click/:linkIndex` | public |

> The bio-page feature was removed from the frontend UI; these routes remain for backward compatibility and are not documented as a user-facing feature.

## Admin — `/api/admin` (JWT + `requireAdmin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform totals (users, links, visits). |
| GET | `/users` | Paginated user list. |
| PATCH | `/users/:id/ban` · `/users/:id/unban` | Moderation. |
| DELETE | `/links/:id` | Remove any link. |

---

## Health — outside `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | `{status: "UP", service, mongo, demoSeed, demoSeedStatus, timestamp, version}` — used by Render health checks and uptime monitors. |
