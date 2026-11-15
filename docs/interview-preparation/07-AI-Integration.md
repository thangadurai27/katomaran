# Chapter 7 — AI Integration (Google Gemini)

## 1. Background concepts (say these simply)

- **LLM (Large Language Model):** a neural network trained on huge text corpora that predicts likely continuations of text. You give it a *prompt*; it returns generated text.
- **Google Gemini:** Google's LLM family, accessed via the `@google/generative-ai` SDK. Models range from `flash` (fast, cheap) to `pro` (deeper reasoning).
- **`gemini-2.5-flash`:** the project's default model (`GEMINI_MODEL` env var in `backend/src/configs/gemini.js`) — chosen for its speed and free-tier quota, which fits interactive dashboard features.

## 2. Where AI is integrated (files)

| File | Role |
|---|---|
| `backend/src/configs/gemini.js` | SDK init, `generateContent(prompt)`, retry, fallbacks |
| `backend/src/controllers/ai.controller.js` | 7 AI endpoints |
| `backend/src/controllers/link.controller.js` | uses `generateContent` during link creation (AI scoring/category) |
| `backend/src/utils/demoSeed.js` | seeds `aiEngagementScore`/`aiCategory` values so the UI has data |
| Frontend | `pages/dashboard/AIInsightsPage.jsx` (chat + insights UI) |

## 3. How the API is called (actual code path)

```js
// configs/gemini.js
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL }); // gemini-2.5-flash
const result = await model.generateContent(prompt);
const response = await result.response;
return response.text();
```

Server-side only — `GEMINI_API_KEY` lives in Render env vars and never reaches the browser. Frontend calls our API (`/api/ai/*`), our API calls Gemini.

## 4. Prompt engineering (actual prompts, summarized)

All prompts follow one pattern: **role → data → task → constraints → JSON schema**.

Example (`getAnalyticsInsights`):
- Role: "You are an expert digital marketing analyst."
- **Data:** real aggregates computed first in MongoDB — total 30-day clicks, top-5 countries, device mix, top-3 browsers, last-7-day daily pattern. *The model receives numbers, not raw documents.*
- Task + schema: "Respond with valid JSON only (no markdown): `{ summary, keyInsights[], recommendations[], bestPostingTime, audienceProfile, growthOpportunity, riskFactors[], performanceScore }`".

Other prompts: slugs (5 items, 4–12 chars, lowercase+hyphens), safety check (`isSafe, spamScore 0-100, threatType, confidence, reasons[], recommendation: allow|warn|block`), performance prediction (`engagementScore, predictedClicks{week1,week2,week4}, conversionPotential, viralPotential, bestChannels[]`), URL summarization (fetches the page text with axios, strips `<script>/<style>/tags`, truncates to 3000 chars, then summarizes), chat (persona system-context, ≤200 words), campaign suggestions (title, tags, UTM, schedule, CTA, budget).

**Why JSON-only prompts?** The frontend needs structured objects to render cards; strict schemas make parsing deterministic.

## 5. Response processing

```js
const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
const parsed = JSON.parse(cleaned);
```

LLMs often wrap JSON in markdown code fences even when told not to — the regex strips both variants. `getAnalyticsInsights` goes further: a parse failure returns **502 with the raw text** instead of fabricating an insight.

## 6. Token considerations

- Prompts are compact: aggregates (numbers) instead of raw visit documents — a 30-day insight prompt is a few hundred tokens, not thousands. **This is a cost + latency decision.**
- Chat responses are capped (~200 words) in the prompt.
- No conversation history is sent (chat is stateless) — keeps tokens flat per request.

## 7. Error handling & fallbacks (`configs/gemini.js`)

| Failure | Detection | Response |
|---|---|---|
| Key missing | `!apiKey` at init | `fallbackResponse(prompt,'missing_key')` → message: add GEMINI_API_KEY (AI Studio link) |
| Invalid key | message contains `API_KEY_INVALID` | instructive message |
| Quota/429 | `429` or `quota` | "wait or enable billing" message |
| Unknown model | message contains `404` and model ≠ `gemini-2.5-flash` | **automatic single retry** with `gemini-2.5-flash` |
| Any other error | catch-all | generic "temporarily unavailable" message |

Plus **per-endpoint canned JSON fallbacks** (matched by keyword in the prompt): static slug list, safe-URL result, generic insights, sample predictions — so the UI renders something instead of crashing. Be honest in interviews: fallbacks keep UX alive but are *not* real AI output (the insights fallback is explicitly labeled "generated via fallback").

## 8. Rate limiting for AI

`aiLimiter` (`middlewares/rateLimiter.js`): **10 requests/minute/user** — LLM calls are slow and quota-limited, so they get their own stricter limiter than the general 200/15min.

## 9. Data privacy

- Only **aggregated, non-identifying** analytics leave the system (counts, country names, device names) — never raw IPs, hashed IPs, tokens, or personal fields.
- Demo account insight prompts contain seeded public data only.
- The API key is server-side env-only.

## 10. AI tasks vs normal backend logic (clear split — interviewers love this)

| Task | AI or logic? | Why |
|---|---|---|
| Short-code generation | **Logic** (`nanoid`) | must be instant, collision-safe, free |
| Uniqueness/alias validation | **Logic** (DB index) | correctness |
| Redirect rule enforcement | **Logic** | deterministic, latency-critical |
| Visit recording, dedup | **Logic** (hashIP) | exactness |
| Click analytics math | **Logic** (Mongo aggregation) | exact numbers |
| Interpreting analytics, advice, prediction | **AI** | language/reasoning task |
| Slug creativity, summarization, safety heuristics, chat | **AI** | generation/understanding tasks |
| `aiEngagementScore` on creation | AI-generated but **seeded/fallback-available** | nice-to-have, never blocking |

Rule of thumb we followed: **anything that must be correct or fast is code; anything that must be articulate is AI.**

## 11. Weaknesses to admit (and how you'd fix them)

- Chat has no memory (add a `messages` collection or windowed context).
- Safety check is heuristic AI, not a threat-intel API (add Google Safe Browsing).
- No streaming (Gemini `generateContentStream`) — responses arrive all at once.
- No response caching — identical prompts re-bill (cache by prompt hash with TTL).
