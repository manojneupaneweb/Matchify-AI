# Security

Notes for myself when I come back to this.

- Sessions come from NextAuth or the credentials cookie named `session`. Admin access requires `User.role === "admin"` or an exact match on `ADMIN_EMAIL`. Page middleware and `/api/admin/*` both check this.
- A user can read a report only when `userEmail` matches the session. `DELETE /api/user/data` deletes that user's analyses. `DELETE /api/user/account` deletes the account and analyses.
- Uploads must start with `%PDF-` and be at most 5 MB. Job descriptions are limited to 20,000 characters.
- `/api/analyze`, `/api/generate-jd`, and `/api/generate-cover-letter` are rate limited per user and per IP. Upstash Redis is used when `UPSTASH_REDIS_REST_URL` is set. Otherwise counters live in MongoDB with a TTL on `expiresAt`. A 429 includes `Retry-After`.
- Resume and job text are wrapped as untrusted data in prompts. The model is told to ignore instructions inside those blocks.
- API failures return `{ error: { code, message } }`. Stack traces and raw model text are not sent to the client.
- `JWT_SECRET` has no default. `GET /api/test-gemini` requires an admin session.
- Security headers are set in `next.config.ts`, including `X-Frame-Options: DENY` and a Content-Security-Policy.
- `E2E_AUTH_BYPASS=1` is ignored when `NODE_ENV=production`.

Known limits: the homepage `POST /api/stats` counter can be incremented by anonymous clients. Cover-letter and job-description generation still use a single model call. The CSP allows inline scripts because the Next.js runtime needs them.
