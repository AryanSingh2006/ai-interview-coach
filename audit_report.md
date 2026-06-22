# Codebase Audit Report
> Verified against `implementation_plan.md` and `task.md` — Phase 2 implementation

---

## 1. Completed Features ✅

These tasks are marked `[x]` in task.md **and** are actually implemented correctly.

| Task | File | Notes |
|------|------|-------|
| Login wiring | [Login.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/Login.jsx) | POSTs to `/api/auth/login`, shows inline errors, redirects to `/dashboard` |
| Signup wiring | [signup.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/signup.jsx) | POSTs to `/api/auth/signup`, shows inline errors, redirects to `/dashboard` |
| `InterviewReport` model fields | [Interviewreport.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/models/Interviewreport.js) | `interviewType` and `completedAt` fields added |
| `complete/route.js` stores new fields | [complete/route.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/interview/[sessionId]/complete/route.js) | Populates `interviewType` and `completedAt` at creation time |
| `GET /api/dashboard` | [dashboard/route.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/dashboard/route.js) | Aggregates stats, returns `totalSessions`, `avgScore`, `topStrength`, `topWeakness`, `recentSessions` |
| `GET /api/resume` | [resume/route.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/resume/route.js) | Returns user's resumes by userId |
| `GET /api/interview/[sessionId]/report` | [report/route.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/interview/[sessionId]/report/route.js) | Fetches real report, confirms ownership, serializes `dimensionAverages` Map |
| `GET /api/reports` | [reports/route.js](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/reports/route.js) | Paginated sessions+reports joined, correct shape |

---

## 2. Broken Features ❌

These tasks are marked `[x]` in task.md but are **not implemented** in the code.

### 2A. Resume Page — Zero API Wiring (Phase 2C)
**File:** [resume.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/resume.jsx)

- `handleFileChange` stores only `e.target.files[0].name` (a string). The `File` object needed for `FormData` upload is **discarded**.
- The "Generate Interview" button is a plain `<button>` with **no `onClick` handler** attached.
- No call to `POST /api/resume/upload`.
- No call to `POST /api/interview/start`.
- No redirect to `/interview-session?sessionId=xxx`.
- **Experience Level** dropdown still present — the plan said to remove it.
- No loading or error states.

> **Result:** Clicking "Generate Interview" does absolutely nothing. The entire interview creation flow is broken.

---

### 2B. Interview Session — Zero API Wiring (Phase 2D)
**File:** [interview-session.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/interview-session.jsx)

- No import from `next/navigation` — **no `useSearchParams()`**.
- `historyItems` is still the hardcoded array of 4 fake items.
- Current question is still hardcoded: `"Can you describe a challenging technical problem..."`.
- Progress still hardcoded: `"Question 3 of 10"` / `30%`.
- Timer `15:22` is a static string, not a live countdown.
- "Submit Answer" button is a plain `<button>` with **no `onClick` handler**.
- No `GET /api/interview/[sessionId]/session` on mount.
- No `POST /api/interview/[sessionId]/answer` on submit.
- No completion redirect to `/interview-feedback?sessionId=xxx`.
- No loading or submitting states.

> **Result:** The session page is purely decorative. No real interview can be conducted.

---

### 2C. Interview Feedback Page — Still Uses Mock Data (Phase 2E)
**File:** [interview-feedback/page.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/interview-feedback/page.jsx)

- **Line 4:** `import { mockReportData } from './data/mockReportData'` — still importing mock.
- **Line 14:** `setReportData(mockReportData)` — no API call.
- Mock file `data/mockReportData.js` was **not deleted** (plan said to delete it).
- UI field names don't match the real `InterviewReport` shape — see Section 5 for full mismatch table.
- No `useSearchParams()` to read `?sessionId`.
- No `fetch('/api/interview/[sessionId]/report')`.

> **Result:** Feedback page always shows fake data. It will **crash** if mock is removed because the real shape is completely different.

---

### 2D. Dashboard — Still Uses Hardcoded Mock Constants (Phase 2F)
**File:** [Dashboard.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/Dashboard.jsx)

- `REPORTS[]` constant (lines 42–67) still used in the "Recent Reports" table (line 354).
- `SKILLS[]` constant (lines 35–40) still used in "Skill Progress" section (line 303).
- All stat cards show hardcoded values: `12`, `84%`, `"Technical"`, `"SQL"`.
- Avatar initials hardcoded to `"JD"` (line 159).
- No `useEffect` fetching `/api/dashboard`.
- No loading skeleton or empty state.

> **Result:** Dashboard always shows the same fake data regardless of actual interview history. The `/api/dashboard` API exists but is never called.

---

### 2E. Reports Page — Still Uses Hardcoded Mock Constants (Phase 2G)
**File:** [ReportsPage.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/reports/ReportsPage.jsx)

- `SESSIONS[]` constant (lines 33–74) still used in the table (line 190).
- Stat cards show hardcoded `82`, `24`.
- Pagination `totalPages = 3` hardcoded (line 84).
- External avatar `https://i.pravatar.cc/64?img=12` and name "Alex Rivera" still in header (lines 108–116).
- "View Report" button has no `onClick` — does not navigate anywhere.
- No `useEffect` fetching `/api/reports`.

> **Result:** Reports page always shows 5 fake sessions with a broken "View Report" button. The `/api/reports` API exists but is never called.

---

### 2F. Profile Page — Zero API Wiring (Phase 2H)
**Files:** [ProfileSettings.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/profile/ProfileSettings.jsx) · [ProfileCard.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/profile/ProfileCard.jsx) · [StatsCard.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/profile/StatsCard.jsx) · [SkillBreakdown.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/profile/SkillBreakdown.jsx)

- `ProfileCard` still has hardcoded `"Alex Johnson"`, `"alex.johnson@example.com"`, external avatar `pravatar.cc`. Accepts **no props**.
- `StatsCard` still has internal `STATS[]` (`15`, `92%`, `81%`). Accepts **no props**.
- `SkillBreakdown` still has internal `SKILLS[]`. Accepts **no props**.
- `ProfileSettings` passes **no data to any child** — all three are called with zero props.
- No `useEffect` fetching `/api/profile`.

> **Result:** Profile page always shows "Alex Johnson" with fake stats. No `/api/profile` backend route even exists (see Section 3).

---

### 2G. Settings Page — Still Uses Mock Data + `alert()` (Phase 2I)
**File:** [settings/page.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/dashboard/settings/page.jsx)

- Line 4 imports `initialSettingsData` from local mock file.
- Line 17: `setSettings(initialSettingsData)` — no `GET /api/auth/me` call on mount.
- Line 22: `handleProfileSave` calls `alert("Profile configurations updated successfully!")` — no `PATCH /api/auth/me`.
- The `PATCH` handler was **never added** to `/api/auth/me/route.js` — the file is 17 lines and only exports `GET`.

> **Result:** Settings page pre-populates with mock data and saves nothing to the database.

---

### 2H. Learning Plan — Still Uses Mock Data (Phase 2J)
**File:** [learning-plan/page.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/dashboard/learning-plan/page.jsx)

- Line 4 imports `learningModulesData` from local mock file.
- Line 15: `setData(learningModulesData)` — no `GET /api/learning-plan` call.
- No empty state for when no interviews have been completed.

> **Result:** Learning plan always shows mock modules. No `/api/learning-plan` backend route exists (see Section 3).

---

## 3. Missing Features 🚫

These APIs were specified in the plan but were **never created**. Confirmed by listing all `route.js` files under `src/app/api/`.

| Missing API | Impact |
|-------------|--------|
| `GET /api/profile` | No route file exists — profile page cannot be wired |
| `GET /api/learning-plan` | No route file exists — learning plan page cannot be wired |
| `PATCH /api/auth/me` | `/api/auth/me/route.js` only has a `GET` export — settings save is blocked |

---

## 4. Production-Readiness Issues ⚠️

| Issue | Location | Severity |
|-------|----------|----------|
| `console.log("CURRENT USER:", user)` leaks full auth object | [complete/route.js L24](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/interview/[sessionId]/complete/route.js#L24) | **High** — PII in server logs |
| 6× debug `console.log` calls in hot path | [answer/route.js L60–L161](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/api/interview/[sessionId]/answer/route.js#L60) | Medium — noisy, performance impact |
| `alert()` used for save confirmation | [settings/page.jsx L22](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/dashboard/settings/page.jsx#L22) | Medium — unacceptable production UX |
| `/sign-up` link in Login goes to wrong route | [Login.jsx L516](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/Login.jsx#L516) | **High** — actual route is `/signup`; link is broken |
| Login link in Signup uses `href="#"` | [signup.jsx L309](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/signup.jsx#L309) | High — does not navigate to `/login` |
| Score scale mismatch | Dashboard/Reports show scores as `%`; backend `overallScore` is `0–10` | **High** — misleading metrics |
| No `Suspense` boundary for `useSearchParams` | Will be required on session and feedback pages when wired | Medium — Next.js App Router requirement |
| External avatars from `pravatar.cc` | [ProfileCard.jsx L9](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/profile/ProfileCard.jsx#L9), [ReportsPage.jsx L109](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/components/reports/ReportsPage.jsx#L109) | Low — third-party dependency |

---

## 5. Frontend/Backend Shape Mismatches 🔀

All mismatches are on the Interview Feedback page ([page.jsx](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/app/interview-feedback/page.jsx)) vs. the real [InterviewReport](file:///C:/Users/44184/Documents/Projects/ai-interview-coach/src/models/Interviewreport.js) model.

| Frontend Field | Real API Field | Status |
|---------------|----------------|--------|
| `reportData.candidate.overallScore` | `report.overallScore` | ❌ Wrong key path |
| `reportData.candidate.name` | Does not exist in report | ❌ Mock-only |
| `reportData.candidate.percentileTier` | Does not exist in report | ❌ Mock-only |
| `reportData.metadata.role/status/completionDate` | Does not exist in report | ❌ Mock-only |
| `reportData.coreMetrics[]` (array of objects with `id`) | `report.dimensionAverages` (Map/object) | ❌ Wrong shape entirely |
| `reportData.executiveSummary[]` (array of strings) | `report.summary` (single string) | ❌ Wrong type |
| `reportData.interviewerNotes` | Does not exist in backend | ❌ Mock-only |
| `reportData.marketBenchmark` | Does not exist in backend | ❌ Mock-only |
| `reportData.growthAreas[]` | `report.weaknesses[]` | ❌ Wrong key |
| Session page reads `sessionId` from URL | Page has no `useSearchParams()` | ❌ sessionId never read |
| Answer API `readyForCompletion: true` | Session page ignores this flag | ❌ Completion never triggered |
| Dashboard API `topStrength` (string) | Dashboard shows hardcoded `"Technical"` | ❌ API exists, frontend ignores it |
| Reports API paginated sessions | Reports page uses hardcoded `SESSIONS[]` | ❌ API exists, frontend ignores it |

---

## 6. Recommended Next Steps 📋

### Priority 1 — Unblock the Core Interview Flow
1. **[resume.jsx]** Store the `File` object (not just the filename). Add `onClick` to "Generate Interview": validate → upload → start → redirect.
2. **[interview-session.jsx]** Add `useSearchParams` + `Suspense`, fetch session on mount, wire "Submit Answer" to the answer API, handle `readyForCompletion` flag to trigger completion + redirect.
3. **[interview-feedback/page.jsx]** Replace mock import with `fetch` call, remap all field names to the real `InterviewReport` shape, delete `mockReportData.js`.

### Priority 2 — Create the Three Missing Backend APIs
4. Create `src/app/api/profile/route.js` (`GET` — user info + aggregated stats from Evaluations).
5. Create `src/app/api/learning-plan/route.js` (`GET` — `recommendedFollowUpTopics[]` from last report).
6. Add `PATCH` export to `src/app/api/auth/me/route.js` (update `user.name`).

### Priority 3 — Wire Remaining Pages to Real APIs
7. **[Dashboard.jsx]** Remove `REPORTS[]` / `SKILLS[]`, add `useEffect` → `GET /api/dashboard`.
8. **[ReportsPage.jsx]** Remove `SESSIONS[]`, add `useEffect` → `GET /api/reports`, wire "View Report" button.
9. **[ProfileSettings.jsx + children]** Add `useEffect` → `GET /api/profile`, pass data as props to `ProfileCard`, `StatsCard`, `SkillBreakdown`.
10. **[settings/page.jsx]** Replace mock import with `GET /api/auth/me`, replace `alert()` with `PATCH /api/auth/me`.
11. **[learning-plan/page.jsx]** Replace mock import with `GET /api/learning-plan`, add empty state.

### Priority 4 — Production Cleanup
12. Fix `/sign-up` → `/signup` in `Login.jsx` (line 516).
13. Fix `href="#"` → `/login` in `signup.jsx` (line 309).
14. Remove all 7 debug `console.log` calls from `answer/route.js` and `complete/route.js`.
15. Replace `alert()` in settings with inline toast/success message.
16. Decide on score scale: backend is `0–10`, UI shows `%` — pick one and standardise.
17. Delete `src/app/interview-feedback/data/mockReportData.js`.
