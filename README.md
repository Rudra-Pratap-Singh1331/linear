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

### ✅ Workspace Keyboard Shortcut Support
- Built fast workspace navigation using keyboard shortcuts
- Enabled users to trigger key workspace actions efficiently without mouse interaction
- Improved overall workflow speed and usability with Linear-style shortcuts

### ✅ Issue creation flow
- Create issue in the same way like linear
- Select status, priority, labels, due date and many more.

### ✅ Linear-style Issue Detail Page
- Clean and minimal Issue Details UI
- Right-side properties panel (Status, Priority, Labels, etc.)
- Activity section for comments + events

### ✅ AI Features (Gemini)

#### 1) ✨ Generate Issue thorugh Natural language
- Generates appropriate and accurate title and description for the issue described in natural language by the user.
- Set the priority, status, labels automatically be analyzing the importance of current issue be comparing it with the other exisiting ones.

#### 2) ✨ AI Reply (Comment Reply Helper)
- Generates a professional reply to a selected comment based on issue context

#### 3) ✨ Polish Comment
- Polishes the user's draft comment into a professional tone
- Returns only **one final version** (no suggestions/options)

#### 4) ✨ Summarize Activity
- Summarizes issue activity into simple user-centric bullet points
- Outputs activity in a clean format (Linear-like)

---

## 🧩 App Routes

### Pages
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

- Push code to GitHub
- Import the repo in Vercel
- Add the same env variables in:
- `Vercel → Project → Settings → Environment Variables`

# 📌 Notes

The UI is designed to match Linear’s minimalist design language
The AI helpers are added to improve productivity:
- reply to issue comments faster
- create issue efficiently through natural language
- polish messages
- quickly understand issue activity(summary)

## 👤 Author

`Rudra Pratap Singh`
