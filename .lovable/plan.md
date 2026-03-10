# VproTechDigital Internship Hiring & Assessment Portal — Implementation Plan

## Important Technical Note

Lovable builds frontend apps with **Supabase** as the backend (PostgreSQL database, built-in auth, edge functions). Node.js/Express/MongoDB cannot run here. The Supabase stack delivers **identical functionality** — auth, database, serverless functions, Excel export — with zero DevOps. I'll proceed with this approach.

---

## Phase 1: Foundation & Database

**Connect  with mongodb** to get database, auth, and edge functions.

**Database tables:**

- `profiles` — fullName, email, phone, collegeName, crn, urn, course, semester, city, hasAttempted, selectedDomain, applicationId
- `user_roles` — user_id, role (admin/user enum)
- `questions` — domain, questionText, options (jsonb), correctAnswer, difficulty, createdAt
- `exams` — userId, domain, questionsShown (jsonb), selectedAnswers (jsonb), correctCount, wrongCount, score, totalMarks, status, startedAt, submittedAt, violations, disqualified, disqualifiedReason
- `violation_logs` — examId, userId, type, timestamp, details
- `domain_cutoffs` — domain, cutoffMarks (admin-configurable)

**RLS policies** on all tables. Admin access via `has_role()` security definer function.

**Seed data:** 30+ questions per domain (4 domains), default admin account.

---

## Phase 2: Auth & Branding

- Mongodb with email/password
- Sign-up form collecting all required fields → creates auth user + profile row via trigger
- Login page with validation
- Password reset flow with `/reset-password` page
- Auto-generate unique application ID per candidate
- Blue/black/white corporate theme with gradient accents throughout `index.css`

---

## Phase 3: Pages (8 total)

1. **Landing Page** (`/`) — Navbar, hero, about, domains, how-it-works, CTA, footer
2. **Sign Up** (`/signup`) — Full registration form with exam rules checkbox
3. **Login** (`/login`) — Email/password with forgot password
4. **Candidate Dashboard** (`/dashboard`) — Welcome card, profile summary, domain selection cards, start exam button (disabled after attempt)
5. **Exam Instructions** (`/exam/instructions`) — Rules display, accept checkbox, proceed button
6. **Exam Page** (`/exam`) — One question at a time, 30-min timer, progress bar, nav buttons, mark-for-review, fullscreen enforcement, anti-cheat detection
7. **Result Page** (`/result`) — Score breakdown, status badge, contact message
8. **Candidate Profile** (`/profile`) — View/edit profile details

---

## Phase 4: Exam Engine & Anti-Cheat

- Fetch 30 random questions from selected domain via Supabase query with `order: random`, limit 30
- Randomize option order client-side
- 30-minute countdown timer (persisted start time in DB)
- Auto-submit on timer end
- **Anti-cheat:** `visibilitychange`, `blur`, `fullscreenchange` listeners; `beforeunload` prevention
- First violation = warning toast; 3rd violation = auto-disqualify + auto-submit
- Log each violation to `violation_logs`
- Save answers to local state + periodic sync to DB
- Prevent back navigation, block re-attempt via `hasAttempted` flag
- Auto-evaluate on submit: compare answers to correctAnswer, calculate score, determine status based on domain cutoff

---

## Phase 5: Admin Panel

- **Admin Login** — same auth, role-checked routes
- **Admin Dashboard** (`/admin`) — Stats cards (registered, appeared, qualified, disqualified), domain-wise charts (recharts), average scores, recent applicants
- **Candidate Management** (`/admin/candidates`) — Full data table with search, domain/status filters, sort by marks, view detail modal, delete candidate
- **Question Bank** (`/admin/questions`) — CRUD interface, domain filter, bulk upload via CSV/JSON
- **Cutoff Settings** (`/admin/settings`) — Set cutoff marks per domain
- **Excel Export** — Edge function using `xlsx` library to generate Excel file; export all or filtered records

---

## Phase 6: Edge Functions

1. `**export-excel**` — Accepts filter params, queries candidates, generates .xlsx, returns file
2. `**evaluate-exam**` — Server-side scoring to prevent client tampering
3. `**seed-questions**` — One-time seeder for sample questions

---

## Phase 7: Polish

- Dark/light mode toggle (next-themes already installed)
- Toast notifications (sonner) for all actions
- Form validation with zod + react-hook-form
- Protected routes (auth guard + role guard)
- Mobile responsive (exam page shows desktop-required warning on mobile)
- Loading skeletons throughout
- College-wise and domain-wise analytics charts in admin

---

## File Structure

```text
src/
├── components/
│   ├── landing/        (Hero, About, Domains, HowItWorks, Footer)
│   ├── auth/           (LoginForm, SignupForm, ProtectedRoute, AdminRoute)
│   ├── dashboard/      (WelcomeCard, DomainCards, ProfileSummary)
│   ├── exam/           (QuestionCard, Timer, ProgressBar, AntiCheat)
│   ├── result/         (ScoreCard, StatusBadge)
│   ├── admin/          (StatsCards, CandidateTable, QuestionForm, CutoffSettings, Charts)
│   └── ui/             (existing shadcn components)
├── hooks/
│   ├── useAuth.ts
│   ├── useExam.ts
│   ├── useAntiCheat.ts
│   └── useAdmin.ts
├── lib/
│   ├── utils.ts
│   └── constants.ts
├── pages/
│   ├── Index.tsx, Login.tsx, Signup.tsx
│   ├── Dashboard.tsx, ExamInstructions.tsx, Exam.tsx, Result.tsx
│   ├── Profile.tsx, ResetPassword.tsx
│   └── admin/ (Dashboard.tsx, Candidates.tsx, Questions.tsx, Settings.tsx)
└── integrations/supabase/
supabase/
├── functions/
│   ├── export-excel/index.ts
│   ├── evaluate-exam/index.ts
│   └── seed-questions/index.ts
├── migrations/ (all table definitions)
└── config.toml
```

---

## Implementation Order

This is a large project. I'll build it in sequential batches to keep quality high:

1. **Batch 1:** Database setup, auth, landing page, signup, login
2. **Batch 2:** Candidate dashboard, exam instructions, domain selection
3. **Batch 3:** Exam engine with timer, anti-cheat, auto-submit
4. **Batch 4:** Result page, scoring logic
5. **Batch 5:** Admin dashboard, candidate management, question bank
6. **Batch 6:** Excel export, cutoff settings, analytics, polish

Each batch will be fully functional before moving to the next.  
  
  
