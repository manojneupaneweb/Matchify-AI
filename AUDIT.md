# Matchify AI — production audit

Reviewed: `app/`, `components/`, `hooks/`, `lib/`, `models/`, `middleware.js`, and config. No application code was changed in this phase.

Severity: **high** = exploitable or data-loss risk in production, **medium** = correctness, authz, or reliability gap that should ship before a portfolio demo, **low** = hygiene or polish.

## High

1. **Admin API routes do not check a role.** `app/api/admin/*` (users, reports, analyses, analytics, activity, notifications, stats, health) trust the caller. Middleware only guards `/admin` pages, and only by comparing the email to the hardcoded address `randome255@gmail.com`. Anyone who can call the API reads every user (including fields other than password) and every analysis.
2. **Hardcoded admin identity.** `middleware.js` allows a single personal Gmail address. That is not configurable, leaks an operator identity, and does not use `User.role`.
3. **JWT fallback secret.** `lib/auth.js` signs credentials-login tokens with `process.env.JWT_SECRET || 'super-secret-jwt-key-fallback'`. If `JWT_SECRET` is unset, sessions are forgeable.
4. **Session cookie mismatch.** Credentials login sets a cookie named `session` (`app/actions/auth.js`). Middleware looks for `auth_token`, which nothing writes. Password-login users are bounced away from `/dashboard` and `/admin` even after a successful login. Pages then re-implement a second check against `session`, so protection is inconsistent.
5. **Unauthenticated Gemini probe.** `GET /api/test-gemini` calls Google with the server API key and returns the error body. No session check.
6. **Analysis accepts any upload.** `POST /api/analyze` does not check PDF magic bytes, size, or job-description length. `pdf-parse` runs on attacker-controlled bytes. The same pattern is in `POST /api/generate-cover-letter`. JD generation (`/api/generate-jd`) and cover letters are unauthenticated.
7. **Model output and exception text returned to clients.** `/api/analyze` returns `raw` model text on JSON parse failure and `error.message` (which can include upstream API bodies) on failure. `/api/admin/health` returns `error.message`.
8. **Prompt injection.** Resume and job-description text are concatenated into the prompt with no delimiter or instruction to ignore embedded commands. The model is also asked to invent the match score.
9. **No rate limit** on `/api/analyze` or the other Gemini routes. A logged-in user can exhaust the API key.
10. **Startup does not validate env.** `lib/mongodb.js` throws at import if `MONGODB_URI` is missing, but `GEMINI_API_KEY`, `NEXTAUTH_SECRET`, and `JWT_SECRET` are only noticed after a request. `GoogleGenerativeAI` is constructed at module scope with a possibly undefined key and then unused (the route uses `fetch` instead).

## Medium

11. **Single-shot LLM score.** Match percentage, skill bars, and keyword counts all come from the model. They are not reproducible and can be 0–1 or 0–100 (the route patches that after the fact).
12. **No structured-output validation.** JSON is extracted by stripping markdown fences and `JSON.parse`. There is no schema, no retry with the validation error, no timeout, and no backoff on 429/5xx. Model fallback is immediate and logs the key prefix.
13. **Duplicate Gemini client loops** in `analyze`, `generate-jd`, and `generate-cover-letter` (model list, fetch wrapper, fence stripping).
14. **Result reads are mostly scoped by email**, which is good on the dashboard pages, but there is no shared authorization helper. Admin list endpoints are the hole. `Result` has no indexes on `userEmail` / `createdAt`.
15. **Full job description is stored** on every `Result`. Resume files are not stored (good). There is `DELETE /api/user/account`, but no dedicated “delete my analyses” path that keeps the account, and profile updates are not length-limited. `PUT /api/user/profile` uses `upsert: true`, so a session email with no user row creates a document.
16. **Password change** (`app/api/user/password/route.js`) calls `bcrypt.compare(currentPassword, user.password)` only when `user.password` is set, but a missing current password on an account that has a password is not rejected before compare if the client sends `undefined` (bcrypt throws). OAuth users can set a password with no extra factor. Minimum length is 6.
17. **Credentials login** (`app/actions/auth.js`) does not normalize email and will throw inside `bcrypt.compare` when `user.password` is null (OAuth-only accounts), which becomes a generic 500-style error message.
18. **`POST /api/stats` is public** and increments `totalUsers` once per browser via `localStorage`. The homepage counter is forgeable.
19. **Admin user search** interpolates `search` into a MongoDB `$regex` (ReDoS / regex injection).
20. **Logging** uses `console.log` / `console.warn`, including key prefixes and model-list diagnostics, with no request id or token-usage record. `Result` does not store model, latency, or usage.
21. **No security headers** in `next.config.ts` (CSP, frame, referrer, nosniff).
22. **No `/api/health` for orchestrators.** `/api/admin/health` is a detailed DB stats dump and is unauthenticated.
23. **TypeScript is not actually covering the app.** `tsconfig.json` has `strict: true` but `include` omits `*.js` / `*.jsx`. Application code is JavaScript (`middleware.js`, `lib/`, `models/`, `app/`, `components/`). `npm test` does not exist. ESLint is the Next default only. No Prettier, Husky, or CI.
24. **`.gitignore` uses `.env*`**, which also ignores a future `.env.example` unless negated. No `.env.example` is committed. Root files `resume.txt` (a job description, not a resume) and `projectingo.md` (a stack dump) are tracked.
25. **`authOptions` imported from the route module** in `app/api/user/account/route.js`, `profile/route.js`, and `password/route.js`, while other routes import `@/lib/authOptions`. Easy to create circular imports.
26. **PDF text edge cases** (empty extract, scanned PDF, huge text) are not turned into specific errors. A scanned PDF becomes an analysis of an empty string.
27. **Progress UI is fake.** `hooks/useHome.js` animates a timer to 92% and `alert()`s errors. There is no cancel control and no server step stream.
28. **History pagination exists** (`app/dashboard/analyses/page.jsx`) but `searchParams` is not awaited (Next.js 15+ async params). The search box is not wired up.

## Low

29. **NextAuth session callback logs every session email.**
30. **GitHub provider falls back to the strings `missing_github_id` / `missing_github_secret`.**
31. **Charts and copy assume the legacy JSON shape** (`funnyMessage`, `charts.skillsMatch`). A pipeline must keep that shape or update every consumer together.
32. **`components/sections/AnalyzerSection.jsx` says “PDF · DOCX”** but only PDF is implemented.
33. **No tests, no eval set, no Docker, no Dependabot, no coverage gate.**
34. **Marketing copy in README** (“premium”, “gorgeous”, “lightning-fast”, “Next.js 15”) does not match `package.json` (`next` 16.2.4) or measured behavior.
35. **`GoogleGenerativeAI` import is dead** in the analyze route; calls go through raw REST, so SDK retries and `responseSchema` are unused.

## Secrets scan

- No live API keys or connection strings were found in tracked source.
- The JWT fallback string in `lib/auth.js` is a **hardcoded secret** and must be removed.
- Git history was not rewritten. The fallback string and the admin email are in current `main` history; rotating `JWT_SECRET` / `NEXTAUTH_SECRET` after deploy is still required if those were ever weak.

## What later phases will change

High and medium items above are the fix list. Low items are handled when they sit on a file already being edited (dead import, log noise, README accuracy, DOCX label). Existing dashboards, OAuth, credentials login, cover-letter and JD generation, and the current result JSON fields stay.
