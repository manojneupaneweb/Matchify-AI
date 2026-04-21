# Matchify AI 🚀

Matchify AI is a premium, AI-powered Applicant Tracking System (ATS) and resume analyzer. Built to help job seekers instantly evaluate how well their resume matches a specific job description, Matchify AI provides deep insights, keyword coverage analysis, and actionable suggestions to improve your hiring chances.

## ✨ Features

- **Live AI Resume Analysis**: Powered by Google's Gemini Pro AI models (`gemini-2.5-flash`, `gemini-2.0-flash`).
- **Deep Skill Matching**: Breaks down technical skills, soft skills, experience, and domain knowledge.
- **Missing Keyword Detection**: Instantly highlights critical keywords missing from your resume that ATS scanners look for.
- **Secure Authentication**: Built-in Google and GitHub OAuth social login powered by `NextAuth.js`.
- **Admin & User Dashboards**: Secure, personalized dashboards to view past reports and track your analysis history.
- **Premium Glassmorphism UI**: A beautiful, highly responsive, and modern interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js (OAuth via Google/GitHub)
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **PDF Parsing**: `pdf-parse`

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed, and your MongoDB instance ready.

### Environment Variables
You will need to create a `.env.local` file in the root directory and add the following keys:

```env
# AI Integration
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Database
MONGODB_URI="your_mongodb_connection_string_here"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secure_secret_string"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"
```

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗂️ Project Structure

- `/app` - Next.js App Router (Pages, Layouts, API routes like `/api/analyze` and `/api/auth`)
- `/components` - Reusable UI elements (Buttons, Modals, Navbar, Charts, Results Display)
- `/hooks` - Custom React hooks (e.g., `useHome` to run the analysis engine)
- `/lib` - Application utilities (e.g., MongoDB connection logic)
- `/models` - MongoDB schema definitions (`User`, `Stats`, `Result`)

## 💡 How It Works

1. **Upload & Parse**: Users upload a PDF resume and paste a Job Description. Our backend securely parses the PDF.
2. **AI Processing**: A strict prompt is sent to Google's Gemini, which forces the model to respond strictly with a structured JSON evaluating your resume against the JD.
3. **Database Logging**: The JSON payload is saved securely to MongoDB, tracked to the user's specific authenticated session.
4. **Visualization**: The user is navigated to their specialized Dashboard, where the raw data is rendered into gorgeous web charts and actionable item logs.

---
*Built with modern web technologies for a lightning-fast user experience.*
