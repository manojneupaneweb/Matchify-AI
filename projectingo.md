Viewed README.md:1-80

Here is a breakdown of the Matchify AI project's Tech Stack, AI integration, and core application flow based on its architecture:

### 🛠️ Tech Stack Overview

The project is built using a modern, full-stack Javascript/Typescript environment centered around Next.js:

**Frontend Ecosystem:**
*   **Framework:** **Next.js 16.2.4** (utilizing the App Router and Turbopack for fast compilation).
*   **UI Library:** **React 19.2.4**.
*   **Styling:** **Tailwind CSS** providing utility-first styling with a premium "Glassmorphism" and Obsidian black aesthetic.
*   **Icons & Animations:** **Lucide React** for crisp vector icons and **Framer Motion** for smooth micro-animations.
*   **Data Visualization:** **Chart.js** via `react-chartjs-2` to render dynamic analytics graphs.

**Backend & Data Ecosystem:**
*   **API Routes:** Handled seamlessly through Next.js server-side route handlers (`/app/api/...`).
*   **Database:** **MongoDB** (accessed via **Mongoose** schema modeling) to store user profiles, scan statistics, and resume analysis results securely.
*   **Authentication:** **NextAuth.js** handling OAuth social logins (Google, GitHub) alongside JWT session management (`jose`, `bcryptjs`).
*   **File Processing:** **pdf-parse** to extract raw text content from uploaded resume files securely on the backend.

---

### 🧠 AI Integration Engine

The core intelligence of Matchify AI is powered by **Google's Gemini Pro AI Models**:
*   **SDK Used:** `@google/generative-ai` SDK connects your backend securely to Google's infrastructure.
*   **Models Utilized:** Fast reasoning models like `gemini-2.5-flash` or `gemini-2.0-flash`.
*   **Prompting Strategy:** The system sends the extracted resume text and the target Job Description to Gemini alongside a strict system prompt. This prompt forces the AI to reply exclusively with structured JSON data representing:
    *   An overall match percentage score.
    *   Deep skill matching (technical vs. soft skills).
    *   Specific missing keywords that ATS systems search for.

---

### 🌊 Application Flow (How It Works)

Here is the step-by-step lifecycle of how a user interacts with the system:

1.  **Authentication & Entry:**
    *   The user visits the landing page and signs in securely using NextAuth (Google/GitHub). They are then routed to their personalized dashboard.
2.  **Input Submission (Upload & Parse):**
    *   The user pastes the target Job Description (JD) and uploads their resume as a PDF file.
    *   The backend securely reads the PDF file into memory and uses `pdf-parse` to convert the document into plain text.
3.  **AI Processing (The Analysis):**
    *   The backend takes the extracted resume text and the JD text and packages them into a payload.
    *   This payload is sent to the **Gemini AI** endpoint. The AI evaluates the alignment between the two texts based on predefined criteria (keywords, experience, domain knowledge).
    *   Gemini returns a highly structured JSON response with the final scores and actionable suggestions.
4.  **Database Logging:**
    *   The Next.js backend intercepts the JSON result. It saves the entire payload securely to the **MongoDB** database, linking it to the current user's authenticated session (so they can review it later).
5.  **Visualization & Insights:**
    *   The frontend receives the data and updates the UI state.
    *   The user is presented with a gorgeous results dashboard where the raw JSON data is transformed into visually appealing **Chart.js** graphs, missing keyword lists, and percentage bars.