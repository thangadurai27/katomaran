# Chapter 15 — Mock Interview Guide (Interactive)

This chapter is a **practice protocol**. Work through it with a friend — or with an AI assistant (paste a question, answer out loud or in text, get scored).

## How a mock session works

1. The interviewer asks **one question at a time** (question bank below, or from `11-150-Interview-Questions.md`).
2. You answer **without notes**.
3. Your answer is scored against five criteria:

| Criterion | What good looks like | Weight |
|---|---|---|
| Technical accuracy | Correct concepts, no invented features | 35% |
| Concept clarity | Structured: simple answer first, depth on request | 20% |
| Project-specific knowledge | Real file/function names, real trade-offs | 25% |
| Communication | Concise, no filler, no dead ends | 10% |
| Confidence | Owns gaps honestly, doesn't apologize excessively | 10% |

4. Score out of 10 → mistakes corrected → an improved "interview-ready" answer shown → next question.
5. Sessions are 30–45 min: 1 warm-up + 2 core + 1 scenario + 1 griller.

---

## Session plan (7 rounds × 5 difficulty tiers)

### Round plan A — Full Stack warm-up
1. "Tell me about SnapLink AI in 60 seconds." *(use Chapter 1's 1-min pitch)*
2. "Draw/describe the architecture." *(Chapter 3 diagram 1)*
3. "What happens exactly when a visitor opens one of your short links?" *(redirect sequence)*
4. "How do you know a click is unique?" *(hashIP + Visit lookup)*
5. Griller: "Your `protect` middleware hits the DB on every request. Defend or fix it."

### Round plan B — Backend focus
1. "Explain your JWT design."
2. "Walk me through your middleware chain in order."
3. "How does your refresh-token flow avoid race conditions?" *(single-flight)*
4. "How does rate limiting work across your endpoints?"
5. Griller: "You have a `423 Locked` bug report on the demo account — walk me through your debugging." *(Chapter 10 story)*

### Round plan C — Data & AI focus
1. "Explain your MongoDB schema design decisions."
2. "Show me an aggregation pipeline you wrote."
3. "Why denormalize stats, and what's the risk?"
4. "How exactly does Gemini get called, and what happens when it fails?"
5. Griller: "How do you stop the AI from hallucinating analytics?"

### Round plan D — Frontend focus
1. "Why Zustand *and* TanStack Query? Draw the boundary."
2. "Walk me through a 401 hitting five parallel requests."
3. "How is the auth session initialized on page load?"
4. "How do you prevent stale JS chunks after deploys?"
5. Griller: "Where could your frontend leak security issues?"

### Round plan E — Security & DevOps griller
1. "Audit your own project: top 3 vulnerabilities."
2. "Why is SameSite=None safe *in your case*?"
3. "What's an SSRF risk in your code?" *(summarize endpoint)*
4. "Your Render instance is asleep — what does the user see, and what do you do?"
5. Griller: "Design a zero-downtime deploy for this app."

---

## Sample evaluation (so you know what "good" looks like)

**Question:** "How do you track clicks?"

**Weak answer (3/10):** "We save every click in the database." *(vague, no mechanism)*

**Average answer (6/10):** "Every redirect creates a Visit document with the user agent and IP, and we increment a counter on the link."

**Strong answer (9/10):** "The redirect handler resolves the link first, then — deliberately *after* the rule checks — we parse the request asynchronously: ua-parser-js gives browser/OS/device, geoip-lite gives country/city, and we SHA-256-hash the IP with a server secret for unique-visit dedup. A `Visit` document is created and the link's cached counters are `$inc`-ed inside the promise's `.then`, so the visitor's 301 is never delayed — the analytics path is eventual-consistency, the redirect path is latency-critical. That's in `backend/src/controllers/redirect.controller.js`, function `handleRedirect`."

---

## Self-scoring rubric card (print this)

```
Score each 0–2:  0 = missed · 1 = partial · 2 = solid
[ ] Accuracy     (no invented features, correct mechanics)
[ ] Clarity      (headline → detail structure)
[ ] Project tie  (file/function/endpoint named)
[ ] Trade-offs   (mentioned a cost/limitation)
[ ] Honesty      (admitted gaps instead of bluffing)
Total /10. Below 7 → repeat the same question tomorrow.
```

## Tracking table

| Date | Round | Question | Score | Weak point | Re-drill date |
|---|---|---|---|---|---|
| | | | | | |

**Rule of thumb:** if you can't name a file, a function, or a live-test result to back an answer, you don't own that answer yet — go back to the referenced chapter and re-read the code snippet.
