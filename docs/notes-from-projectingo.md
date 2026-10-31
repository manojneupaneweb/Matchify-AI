# Notes preserved from `projectingo.md`

The root file was a stack summary, not a spec. Useful facts that are still accurate:

- App Router on Next.js 16 (the old README said 15).
- React 19, Tailwind CSS, Lucide, Framer Motion, Chart.js via `react-chartjs-2`.
- MongoDB via Mongoose. NextAuth (Google and GitHub) plus a credentials JWT (`jose`, `bcryptjs`).
- PDF text extraction uses `pdf-parse` on the server. The original file is not stored.
- The original analysis path sent resume text and the job description to Gemini and stored the JSON on the signed-in user's account.

`resume.txt` was a sample job description (React / .NET), not a resume. It now lives at `docs/samples/sample-job-description.txt`.
