# Linear Clone – Trial Task ✅ (Next.js + Supabase + AI)

A **Linear-inspired issue tracker** built as a trial task project with a clean minimalist UI, workspace-based routing, authentication, and AI-powered helpers (reply, polish, summarize).

---

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** Tailwind CSS v4 (Minimal Linear-style design)
- **Auth + Database:** Supabase
- **AI:** Gemini (`@google/genai`)
- **Icons:** Lucide + FontAwesome
- **Utilities:** date-fns, clsx, tailwind-merge

---

## ✨ Key Features

### ✅ Authentication + Workspace Flow
- Sign up / login using **Supabase Auth**
- Workspace creation page (first-time onboarding)
- Workspace-based dynamic routing (Linear-style URLs)

### ✅ Linear-style Issue Detail Page
- Clean and minimal Issue Details UI
- Right-side properties panel (Status, Priority, Labels, etc.)
- Activity section for comments + events

### ✅ AI Features (Gemini)
#### 1) ✨ AI Reply (Comment Reply Helper)
- Generates a professional reply to a selected comment based on issue context

#### 2) ✨ Polish Comment
- Polishes the user's draft comment into a professional tone
- Returns only **one final version** (no suggestions/options)

#### 3) ✨ Summarize Activity
- Summarizes issue activity into simple user-centric bullet points
- Outputs activity in a clean format (Linear-like)

---

## 🧩 App Routes

### Pages
- `/` – Home
- `/login` – Login
- `/signup` – Signup
- `/create-workspace` – Create Workspace
- `/:workspaceName/welcome` – Workspace welcome screen

### Teams + Issues
- `/:workspaceName/team/:teamKey/all`
- `/:workspaceName/team/:teamKey/active`
- `/:workspaceName/team/:teamKey/backlog`
- `/:workspaceName/issue/:issueKey/:issueTitle`

### API Routes (AI)
- `/api/ai/generate-issue`
- `/api/ai/comment-reply`
- `/api/ai/summarize`
- `/api/ai/list-models`

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
## 🛠️ Setup & Run Locally

Install dependencies and Run server:
```
npm install
npm run dev
```

Build for production:
```
npm run build
npm start
```

## 🌍 Deployment (Vercel)
-Push code to GitHub
-Import the repo in Vercel
-Add the same env variables in:
-`Vercel → Project → Settings → Environment Variables`

# 📌 Notes

The UI is designed to match Linear’s minimalist design language
The AI helpers are added to improve productivity:
-reply faster
-polish messages
-quickly understand issue activity

## 👤 Author

`Rudra Pratap Singh`
