# Phase 1 — Full Codebase Audit & Integration Plan

## Architecture Summary

**Stack:** Next.js 16 (App Router) · JavaScript · MongoDB/Mongoose · JWT (HTTP-only cookie) · Cloudinary · Groq LLM  
**Auth utility:** `getCurrentUser(request)` in `src/lib/auth.js`  
**DB utility:** `connectDB()` in `src/lib/dbConnect.js`  
**Pattern:** All API routes use `NextResponse.json()`, `connectDB()`, `getCurrentUser()`.

---

## 1. Existing Models

| Model | Key Fields | References | Issues |
|-------|-----------|-----------|--------|
| **User** | `email`, `name`, `password`, `timestamps` | — | No `avatarUrl` field — profile card shows avatar from external placeholder URL |
| **Resume** | `userId`, `blobUrl`, `fileName`, `parseStatus` | User | Complete |
| **CandidateProfile** | `resumeId`, `userId`, `skills[]`, `experience[]`, `projects[]`, `experienceLevel` | Resume, User | Complete |
| **InterviewSession** | `userId`, `resumeId`, `candidateProfileId`, `interviewType`, `jobDescription`, `targetCompany`, `status`, `startedAt`, `completedAt` | User, Resume, CandidateProfile | `candidateProfileId` refs string `"Candidateprofile"` but model registers as `"CandidateProfile"` — inconsistent but harmless for .populate() |
| **Turn** | `sessionId`, `index`, `question`, `answer`, `questionType` | InterviewSession | Complete |
| **Evaluation** | `turnId`, `sessionId`, `score`, `dimensionScores[]`, `strengths[]`, `weaknesses[]`, `recommendedFollowUpTopics[]`, `feedback` | Turn, InterviewSession | Complete |
| **InterviewReport** | `sessionId`, `overallScore`, `dimensionAverages` (Map), `strengths[]`, `weaknesses[]`, `recommendedFollowUpTopics[]`, `summary` | InterviewSession | Missing `interviewType` and `completedAt` — needed by Reports and Feedback pages |
| **LearningPlan** | `userId`, `topics[]`, `resources[]`, `generatedAt` | User | Model exists but **never populated** — no API creates it |
| **UserMemory** | `userId`, `strengthTags[]`, `weaknessTags[]`, `embeddings[]`, `lastUpdated` | User | Model exists but **never written to** — no API |
| **GraphCheckpoint** | `thread_id`, `checkpoint`, `metadata` | — | Completely unused — LangGraph scaffolding not implemented |

### Detected Field Issues
- `InterviewReport` is missing `interviewType` (Reports/Feedback pages need it to label sessions).
- `InterviewReport` is missing `completedAt` (needed for date display on Reports page).
- No `avatarUrl` on `User` — all profile/header components use `https://i.pravatar.cc/...`.

---

## 2. Existing API Routes

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `GET /api/health` | GET | No | Working | Health check only |
| `POST /api/auth/signup` | POST | No | Working | Creates User, sets JWT cookie |
| `POST /api/auth/login` | POST | No | Working | Validates credentials, sets JWT cookie |
| `POST /api/auth/logout` | POST | No | Working | Clears cookie |
| `GET /api/auth/me` | GET | Yes | Working | Returns `{ user: { _id, name, email, createdAt } }` |
| `POST /api/resume/upload` | POST | Yes | Working | Cloudinary upload, creates Resume doc |
| `POST /api/interview/start` | POST | Yes | Working | Parses resume → CandidateProfile → Session → Turn 0 |
| `GET /api/interview/[sessionId]/session` | GET | Yes | Working | Returns session state + current open turn |
| `POST /api/interview/[sessionId]/answer` | POST | Yes | Working | Saves answer → Evaluation → next Turn |
| `POST /api/interview/[sessionId]/complete` | POST | Yes | Working | Generates InterviewReport, marks session completed |

### Missing APIs (frontend needs but backend lacks)

| Needed Endpoint | Purpose |
|----------------|---------|
| `GET /api/dashboard` | Aggregate stats: total sessions, avg score, top strength/weakness, recent sessions list |
| `GET /api/resume` | List all resumes for the logged-in user |
| `GET /api/interview/[sessionId]/report` | Fetch an existing report for a completed session (re-read after creation) |
| `GET /api/reports` | Paginated list of all completed sessions + their reports |
| `GET /api/profile` | Combined: user info + interview stats + skill breakdown |
| `PATCH /api/auth/me` | Update user name (settings page) |
| `GET /api/learning-plan` | Return learning topics derived from last InterviewReport |

---

## 3. Existing Pages

| Route | Component | Purpose | Data Source | Status |
|-------|-----------|---------|-------------|--------|
| `/` | `src/app/page.jsx` | Marketing landing page | Static content | Static — no backend needed |
| `/login` | `src/components/Login.jsx` | Login form | — | **NOT CONNECTED** — `handleSubmit` only calls `console.log` |
| `/signup` | `src/components/signup.jsx` | Registration form | — | **NOT CONNECTED** — `handleSubmit` is empty `e.preventDefault()` only |
| `/resume` | `src/components/resume.jsx` | Upload resume + start interview | — | **NOT CONNECTED** — file picker works locally, "Generate Interview" does nothing |
| `/dashboard` | `src/components/Dashboard.jsx` | Overview: stats, score trend, recent reports | Hardcoded mock arrays | All data is fake (`REPORTS[]`, `SKILLS[]`) |
| `/interview-session` | `src/components/interview-session.jsx` | Active interview Q&A | Hardcoded mock | Static question, history items are fake, no API calls |
| `/interview-feedback` | `src/app/interview-feedback/page.jsx` | Post-interview report | `mockReportData.js` | `useEffect` loads mock file instead of API |
| `/reports` | `src/components/reports/ReportsPage.jsx` | All sessions list | Hardcoded `SESSIONS[]` array | All mock |
| `/profile` | `src/components/profile/ProfileSettings.jsx` | User profile + stats | Hardcoded | Name "Alex Johnson", avatar from external URL, all stats mock |
| `/dashboard/learning-plan` | `src/app/dashboard/learning-plan/page.jsx` | Learning roadmap | `learningData.js` mock | All mock |
| `/dashboard/settings` | `src/app/dashboard/settings/page.jsx` | Account settings | `settingsData.js` mock | Profile data is mock, save calls `alert()`, no API |

---

## 4. Frontend / Backend Mapping Table

| Page | Expected Data | Current Source | Needed API | Status |
|------|-------------|---------------|-----------|--------|
| `/login` | POST `{email, password}` → JWT cookie | `console.log` | `POST /api/auth/login` | Missing call |
| `/signup` | POST `{name, email, password}` → JWT cookie | `e.preventDefault()` only | `POST /api/auth/signup` | Missing call |
| `/resume` | Upload file + start interview → sessionId | Nothing | `POST /api/resume/upload`, `POST /api/interview/start` | No API calls |
| `/dashboard` | Total sessions, avg score, top strength/weakness, recent reports | `REPORTS[]` mock | `GET /api/dashboard` | API missing |
| `/interview-session` | Session data, current question, history, submit answer | Hardcoded | `GET /api/interview/[sessionId]/session`, `POST /api/interview/[sessionId]/answer`, `POST /api/interview/[sessionId]/complete` | No API calls |
| `/interview-feedback` | Report: overall score, dimensions, strengths, weaknesses, summary | `mockReportData.js` | `GET /api/interview/[sessionId]/report` | API missing, uses mock |
| `/reports` | All completed sessions + scores + types + dates | `SESSIONS[]` mock | `GET /api/reports` | API missing |
| `/profile` | Logged-in user name/email, total interviews, avg/best score, skill breakdown | Hardcoded "Alex Johnson" | `GET /api/profile` | API missing |
| `/dashboard/learning-plan` | User's learning plan topics + progress | `learningData.js` mock | `GET /api/learning-plan` | Both API and model population missing |
| `/dashboard/settings` | User name, email; save changes | `settingsData.js` mock | `GET /api/auth/me`, `PATCH /api/auth/me` | No API calls |

---

## 5. Missing Backend Requirements

### Fields Frontend Expects but Models Lack

| Frontend Expectation | Current Model | Fix |
|--------------------|--------------|-----|
| Report needs `interviewType` for display | `InterviewReport` missing | Add field, populate at report creation |
| Report needs `completedAt` date | `InterviewReport` missing | Add field, populate at report creation |
| `/interview-feedback` expects `candidate.name`, `candidate.percentileTier`, `interviewerNotes`, `marketBenchmark` | None of these exist in `InterviewReport` | These are mock-only. Remap UI to real shape: `overallScore`, `strengths[]`, `weaknesses[]`, `dimensionAverages`, `summary` |
| Dashboard "Strength" card shows topic text | No field | Derive from `InterviewReport.strengths[0]` of most recent session |
| Profile page shows skill percentages | Not stored | Derive by averaging `Evaluation.dimensionScores` across all sessions |
| `/interview-session` needs `sessionId` | Page at `/interview-session` ignores URL params | Page must read `sessionId` from URL |
| Learning plan modules with `progress` % | `LearningPlan.topics[]` has no `progress` field | Use `recommendedFollowUpTopics[]` from last report as topics |
| Settings page shows/saves user profile | No PATCH API | Need `PATCH /api/auth/me` |

### Backend Data Never Used by Frontend

- `UserMemory` — never created, never read.
- `GraphCheckpoint` — completely unused.
- `LearningPlan` — model exists, never populated or read.
- `InterviewSession.targetCompany` — stored, never displayed.
- `Turn.questionType` — stored, not shown in session UI.
- `Evaluation.recommendedFollowUpTopics` — stored, never surfaced in feedback UI.

---

## 6. Critical Wiring Issues

**A. `/login`** — `handleSubmit` calls `console.log` only. Must POST to `/api/auth/login`, handle errors, redirect to `/dashboard`.

**B. `/signup`** — `handleSubmit` is empty. Must POST to `/api/auth/signup`, redirect to `/dashboard`.

**C. `/resume`** — Three gaps: (1) No API calls at all. (2) "Experience Level" dropdown is disconnected — backend derives `experienceLevel` via AI from the resume, user input is ignored. (3) After start, must redirect to `/interview-session?sessionId=xxx`.

**D. `/interview-session`** — Fully disconnected. Must read `?sessionId` from URL, load session on mount, submit answer via API, handle completion redirect.

**E. `/interview-feedback`** — Loads `mockReportData.js`. Must fetch from `GET /api/interview/[sessionId]/report`. The mock data shape (`candidate`, `coreMetrics`, `executiveSummary`, `interviewerNotes`, `marketBenchmark`) does not match the real `InterviewReport` shape. The page UI must be remapped.

**F. `/dashboard`** — `REPORTS[]` and `SKILLS[]` are hardcoded constants. Must fetch from `GET /api/dashboard`.

**G. `/reports`** — `SESSIONS[]` is a hardcoded constant. Must fetch from `GET /api/reports`.

**H. `/profile`** — Hardcoded "Alex Johnson". Must use `GET /api/profile`.

**I. `/dashboard/settings`** — `handleProfileSave` calls `alert()`. Must call `PATCH /api/auth/me`.

**J. `/dashboard/learning-plan`** — Mock data only. Must use `GET /api/learning-plan`.

---

## 7. Implementation Plan

> [!IMPORTANT]
> Awaiting your approval before writing any code. The plan below is the complete ordered change set.

### Phase 2A — Auth Wiring (existing APIs ready, just need frontend calls)

#### [MODIFY] `src/components/Login.jsx`
- Replace `handleSubmit` `console.log` with `fetch('/api/auth/login', { method: 'POST', ... })`.
- Show inline error message on failure.
- On success: `router.push('/dashboard')`.

#### [MODIFY] `src/components/signup.jsx`
- Replace empty `handleSubmit` with `fetch('/api/auth/signup', { method: 'POST', ... })`.
- Show inline error message on failure.
- On success: `router.push('/dashboard')`.

---

### Phase 2B — New Backend APIs

#### [MODIFY] `src/models/Interviewreport.js`
- Add `interviewType: String` field.
- Add `completedAt: Date` field.

#### [MODIFY] `src/app/api/interview/[sessionId]/complete/route.js`
- Store `interviewType: session.interviewType` and `completedAt: session.completedAt` when creating the report.

#### [NEW] `src/app/api/dashboard/route.js`
**`GET /api/dashboard`** (auth required)  
Returns: `{ totalSessions, avgScore, topStrength, topWeakness, recentSessions: [{ sessionId, interviewType, overallScore, completedAt }] }`

#### [NEW] `src/app/api/resume/route.js`
**`GET /api/resume`** (auth required)  
Returns: `[{ _id, fileName, parseStatus, createdAt }]` for logged-in user.

#### [NEW] `src/app/api/interview/[sessionId]/report/route.js`
**`GET /api/interview/[sessionId]/report`** (auth required)  
Returns full `InterviewReport` doc. Confirms ownership via `InterviewSession.userId`.

#### [NEW] `src/app/api/reports/route.js`
**`GET /api/reports`** (auth required)  
Returns paginated list: `{ sessions: [...], total, page }`. Each item includes session + report joined.

#### [NEW] `src/app/api/profile/route.js`
**`GET /api/profile`** (auth required)  
Returns user info + aggregated stats + skill dimension averages from Evaluations.

#### [MODIFY] `src/app/api/auth/me/route.js`
- Add `PATCH` handler to update `user.name`.

#### [NEW] `src/app/api/learning-plan/route.js`
**`GET /api/learning-plan`** (auth required)  
Returns topics derived from most recent `InterviewReport.recommendedFollowUpTopics[]`. Falls back to empty array if no interviews completed.

---

### Phase 2C — Resume Page Wiring

#### [MODIFY] `src/components/resume.jsx`
- Store actual `File` object (not just filename) from `fileInputRef`.
- On "Generate Interview": validate → `POST /api/resume/upload` (multipart) → get `resumeId` → `POST /api/interview/start` → get `sessionId` → `router.push('/interview-session?sessionId=' + sessionId)`.
- Map UI labels to backend enums: `"Technical Assessment"` → `"technical"`, `"Behavioral Round"` → `"behavioral"`, `"Mixed Simulation"` → `"mixed"`.
- Remove `experienceLevel` dropdown (backend derives from AI).
- Add loading + error states.

---

### Phase 2D — Interview Session Wiring

#### [MODIFY] `src/components/interview-session.jsx`
- Read `sessionId` from `useSearchParams()`.
- On mount: `GET /api/interview/[sessionId]/session` → load current question + history.
- Replace hardcoded `historyItems` with real answered turns.
- Replace hardcoded question text with `currentQuestion.question`.
- Replace `"Question 3 of 10"` with real progress.
- On "Submit Answer": `POST /api/interview/[sessionId]/answer` with `{ answer }`.
  - If response has `nextQuestion` → update question state.
  - If response has `readyForCompletion: true` → `POST /api/interview/[sessionId]/complete` → redirect to `/interview-feedback?sessionId=xxx`.
- Add loading + submitting states.

---

### Phase 2E — Interview Feedback Page Wiring

#### [MODIFY] `src/app/interview-feedback/page.jsx`
- Read `sessionId` from `useSearchParams()`.
- Replace `mockReportData` import with `fetch('/api/interview/[sessionId]/report')`.
- Remap UI to real report shape:
  - `overallScore` → hero score
  - `summary` → executive summary
  - `strengths[]` → strengths list
  - `weaknesses[]` → growth areas list
  - `dimensionAverages` (Map) → metric cards grid
  - `interviewType` + `completedAt` → metadata breadcrumb
  - `recommendedFollowUpTopics[]` → next steps section
- Remove mock-only fields from UI: `candidate.percentileTier`, `interviewerNotes`, `marketBenchmark`.
- Delete `src/app/interview-feedback/data/mockReportData.js`.

---

### Phase 2F — Dashboard Wiring

#### [MODIFY] `src/components/Dashboard.jsx`
- Remove `REPORTS[]` and `SKILLS[]` constants.
- `useEffect` → `fetch('/api/dashboard')` → populate stat cards + recent reports table.
- Replace hardcoded `"JD"` initials with real user initials from `/api/auth/me`.
- Add loading skeleton + empty state.

---

### Phase 2G — Reports Page Wiring

#### [MODIFY] `src/components/reports/ReportsPage.jsx`
- Remove `SESSIONS[]` constant + hardcoded stats.
- `useEffect` → `fetch('/api/reports?page=1')`.
- Populate stats and session rows from API.
- Wire pagination to real `page`/`total`.
- "View Report" button → `router.push('/interview-feedback?sessionId=' + s.sessionId)`.
- Remove hardcoded external avatar.

---

### Phase 2H — Profile Page Wiring

#### [MODIFY] `src/components/profile/ProfileCard.jsx`
- Accept props: `name`, `email`, `experienceLevel`. Remove hardcoded "Alex Johnson". Replace external avatar with initials-based avatar.

#### [MODIFY] `src/components/profile/StatsCard.jsx`
- Accept props: `totalInterviews`, `bestScore`, `avgScore`. Remove hardcoded `STATS[]`.

#### [MODIFY] `src/components/profile/SkillBreakdown.jsx`
- Accept props: `skills[]` (dimension name + avg score). Remove hardcoded `SKILLS[]`.

#### [MODIFY] `src/components/profile/ProfileSettings.jsx`
- `useEffect` → `fetch('/api/profile')` → pass real data to child components.

---

### Phase 2I — Settings Page Wiring

#### [MODIFY] `src/app/dashboard/settings/page.jsx`
- On mount: `fetch('/api/auth/me')` → pre-populate form fields.
- `handleProfileSave` → `PATCH /api/auth/me` with `{ name }` → show success/error message.

---

### Phase 2J — Learning Plan (Minimal)

#### [MODIFY] `src/app/dashboard/learning-plan/page.jsx`
- Replace `learningModulesData` mock with `fetch('/api/learning-plan')`.
- Remap `recommendedFollowUpTopics[]` to `modules[]` shape.
- Handle empty state when no interviews completed yet.

---

## 8. Open Questions

> [!IMPORTANT]
> **Q1: Interview Session URL structure.** Should the session page use search params `/interview-session?sessionId=xxx` (existing page, add `useSearchParams`) or a new dynamic route `/interview-session/[sessionId]`? Dynamic route is cleaner but requires a new page file.

> [!IMPORTANT]
> **Q2: Interview Feedback URL structure.** Same question for `/interview-feedback`: search params on existing page vs new dynamic route `/interview-feedback/[sessionId]`.

> [!IMPORTANT]
> **Q3: Learning Plan strategy.** Option A: Surface `recommendedFollowUpTopics[]` from last report as read-only plan items (minimal, no new model writes). Option B: Build `POST /api/learning-plan/generate` that runs Groq pipeline and persists a real `LearningPlan` document. Which do you prefer?

> [!NOTE]
> **Q4: Settings page scope.** Only the "Account" tab has backend relevance. Notifications, Appearance, Privacy tabs are pure UI with no database model. Should these 3 tabs be wired to a backend (requires new model fields) or left as UI-only?

> [!NOTE]
> **Q5: Avatar / profile photo.** The `User` model has no `avatarUrl`. Profile and header components use external placeholder URLs. Should we add Cloudinary-backed avatar upload (new API + model field), or replace all external avatars with initials-based generated avatars (simpler, no new dependencies)?
