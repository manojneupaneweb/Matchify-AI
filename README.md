# Matchify AI

[![CI](https://github.com/manojneupaneweb/Matchify-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/manojneupaneweb/Matchify-AI/actions/workflows/ci.yml)

I built this to see how well a resume lines up with one job description. You upload a PDF, paste the JD, and get a score, the skills that matched, the ones that did not, and a few rewrite ideas. Reports are saved to your account.

![Home page](docs/images/home.png)

![Pipeline](docs/images/architecture.svg)

## The problem

Job seekers often cannot tell if a resume fits a posting, which keywords an ATS might want, or why an application dies before a person reads it. Comparing resumes to job descriptions by hand also takes time. Matchify checks a resume against one job description, lists matching and missing skills, and suggests edits.

## What it does

- PDF plus a pasted job description. The UI shows Parsing, Extracting, Matching, Scoring, Suggesting while the request runs.
- The score is calculated in `lib/scoring.ts`, not by the model. Weights are 50% must-have skills, 20% nice-to-have, 20% keywords, 10% experience.
- Matched and missing skills, keyword counts, and before/after bullet suggestions.
- A second score after keywords from the suggestions show up in a rewritten summary.
- History at `/dashboard/analyses`, 10 reports per page.
- Google, GitHub, and email/password login.
- Admin pages if your user `role` is `admin`, or if your email matches `ADMIN_EMAIL`.
- A job-description expander and a cover-letter draft. Those two are one Gemini call each, with the same Zod check and model fallback as the analyzer.
- Delete saved analyses, or delete the whole account.

## Architecture

```mermaid
flowchart LR
  resume[Resume PDF] --> agent[Agent]
  jd[Job description] --> agent
  agent --> tools[extract_keywords and rewrite_bullet]
  tools --> agent
  agent --> score[Score in code]
  score --> critique[Critique]
  critique --> store[MongoDB]
  store --> dash[Dashboard]
```

The agent lives in `lib/agent/`. It can call `extract_keywords` and `rewrite_bullet`. Those tools run in our code. The model chooses when to call them. After the skills are out, `lib/scoring.ts` computes the number. A critique step can run a second time if it marks its own review as not ok. Bad JSON is sent back up to twice. The browser reads progress as server-sent events. `proxy.ts` sends unsigned visitors to login and blocks non-admins from `/admin`.

If the same resume text and job description were analyzed in the last hour, the model is skipped and the cached draft is reused. The comparison with your previous score still happens after that.

More detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Design decisions

I did not let the model pick the score. One JSON blob used to invent it. The weights are 50% must-have, 20% nice-to-have, 20% keywords, 10% experience. Tests cover an empty resume, a full match, a miss, duplicates, and a few synonyms (`JS` / `JavaScript`).

Function calling is only for the two tools. I did not give the model a tool that returns a score, because it would just make up a number again.

Resume and JD text are untrusted. I wrap them in `BEGIN UNTRUSTED` / `END UNTRUSTED` and tell the model to ignore instructions inside. If the text contains those markers I break them up so it cannot close the block early.

Primary model is `gemini-2.5-flash`. On timeout, 429, or 5xx I try `gemini-2.0-flash`. The cache is a MongoDB collection with a one-hour TTL, so another server process can reuse it. The client only sees `{ error: { code, message } }`.

## Stack

Next.js 16, React 19, TypeScript, Tailwind 4, MongoDB, NextAuth, Gemini (`gemini-2.5-flash`, then `gemini-2.0-flash`), Zod, Vitest, Playwright.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

You need `GEMINI_API_KEY`, `MONGODB_URI`, `NEXTAUTH_SECRET`, and `JWT_SECRET`. The rest is in `.env.example`.

Admin: set `ADMIN_EMAIL`, or set `role: "admin"` on the user in Mongo.

Docker:

```bash
export GEMINI_API_KEY=... NEXTAUTH_SECRET=... JWT_SECRET=...
docker compose up --build
```

That starts the app and MongoDB 7 on port 3000.

## Testing

```bash
npm test
npm run test:coverage
npm run test:e2e
npm run lint
npm run typecheck
npm run eval
```

`npm test` never calls Gemini. It uses a fake `fetch`. Coverage has to stay at 80% lines on `lib/` (`authOptions.ts` is excluded).

`npm run eval` uses the real API, so it is not in CI. I have not pasted results yet. The cases in `eval-data/` are made up.

Playwright sets an `e2e_user` cookie when `E2E_AUTH_BYPASS=1` and stubs `/api/analyze`. The dev server still wants `MONGODB_URI`.

## Known limitations

- No OCR. A scanned PDF comes back as "could not read this".
- PDF only, at most 5 MB and 10 pages. The old "DOCX" label was wrong, so I removed it.
- "Senior" just means the extracted years are at least 5. That is a guess.
- The synonym list is short. Most tools are matched by the exact normalized name.
- Cover letters and generated JDs do not run the critique loop or the score.
- MongoDB deletes cached analyses about an hour after they are written. The TTL job is not instant.
- Rate limits are stored in MongoDB (or Upstash if those env vars are set), per user and per IP. The window matches `RATE_LIMIT_WINDOW_MS`.
- `noImplicitAny` is still off. `lib/` is stricter than the pages.
- The analysis holds the HTTP connection open. `maxDuration` is 60 seconds. There is no job queue.
- `POST /api/stats` still bumps a public counter. I would not trust that number.
- No license file yet.

## Layout

`app/` pages and routes, `components/` UI, `lib/agent/` the tool loop, `lib/scoring.ts` the score, `lib/services/` save, session, and the shorter Gemini writes, `tests/`, `e2e/`, `eval-data/`, `scripts/eval.ts`.
