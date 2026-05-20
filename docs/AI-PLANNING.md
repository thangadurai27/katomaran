# AI Planning Document — SnapLink AI (Katomaran)

## 1. Problem statement

Marketers and creators need more than a short URL: they need **trust** (spam checks), **insight** (analytics), and **guidance** (when/where to post). Manual analysis does not scale.

## 2. Goals

| Goal | How AI helps |
|------|----------------|
| Safer links | Scan destination URLs for phishing/malware patterns before shortening |
| Smarter slugs | Suggest memorable, brand-friendly short codes |
| Actionable analytics | Summarize traffic, devices, and trends in plain language |
| Campaign support | Recommend UTM tags, channels, and posting windows |
| In-app assistant | Chat interface for link performance questions |

## 3. AI stack

- **Provider:** Google Gemini via `@google/generative-ai`
- **Default model:** `gemini-2.5-flash` (configurable with `GEMINI_MODEL`)
- **Fallbacks:** Structured JSON fallbacks when API key is missing, quota exceeded, or model unavailable
- **Rate limiting:** Dedicated AI route limiter to protect cost and abuse

## 4. AI features (implemented)

| Feature | Endpoint / area | Behavior |
|---------|-----------------|----------|
| AI chat | `POST /api/ai/chat` | Conversational help for link strategy |
| Slug suggestions | Link creation flow | JSON list of slug ideas from URL/title |
| Spam / safety scan | Link creation | `isSafe`, score, threat type, recommendation |
| Analytics insights | Dashboard AI page | Summary, insights, recommendations, best posting time |
| Performance prediction | Link detail / AI | Predicted clicks, channels, viral potential |
| URL summarize | Bulk / import helpers | Title, summary, tags, audience |
| Campaign ideas | Campaigns module | UTM suggestions, schedule, platforms |

## 5. Prompt design principles

1. **Structured output** — Prefer JSON-shaped responses parsed server-side.
2. **Graceful degradation** — Never block core shortening if AI fails; return fallback copy.
3. **Context limits** — Send only necessary stats (aggregates, not raw PII dumps).
4. **Retry policy** — On model `404`, retry once with `gemini-2.5-flash`.
5. **Clear errors** — Distinguish missing key, invalid key, and quota in user-facing messages.

## 6. Non-AI scope (intentional)

- Authentication, JWT refresh, and sessions are **not** AI-driven.
- Redirect routing (`/r/:code`) uses deterministic DB lookups for speed.
- Click tracking uses geo/device parsers (geoip-lite, ua-parser), not LLM inference.

## 7. Future improvements

- RAG over user’s own link history for personalized chat
- Fine-tuned safety classifier for enterprise tenants
- A/B title suggestions with measured CTR feedback loop
- Multilingual insights for global campaigns

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| API cost / quota | Rate limits + flash model + fallbacks |
| Hallucinated metrics | Ground prompts with real analytics JSON from MongoDB |
| Unsafe URL bypass | Combine AI scan with blocklists and user reports |
| Key leakage | Keys only in server `.env`; never in frontend bundle |
