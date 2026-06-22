# Phase 2 — Implementation Task Tracker

## Decisions Made (defaults for unanswered open questions)
- Q1/Q2: Use search params (`?sessionId=xxx`) on existing pages
- Q3: Option A — surface `recommendedFollowUpTopics[]` from last report (minimal)
- Q4: Notifications/Appearance/Privacy left as UI-only
- Q5: Replace external avatars with initials-based avatars

## Phase 2A — Auth Wiring
- [x] `src/components/Login.jsx` — wire to `POST /api/auth/login`, redirect to `/dashboard`
- [x] `src/components/signup.jsx` — wire to `POST /api/auth/signup`, redirect to `/dashboard`

## Phase 2B — New Backend APIs
- [x] `src/models/Interviewreport.js` — add `interviewType`, `completedAt` fields
- [x] `src/app/api/interview/[sessionId]/complete/route.js` — store new fields at report creation
- [x] `src/app/api/dashboard/route.js` — NEW: GET aggregated stats
- [x] `src/app/api/resume/route.js` — NEW: GET user's resume list
- [x] `src/app/api/interview/[sessionId]/report/route.js` — NEW: GET existing report
- [x] `src/app/api/reports/route.js` — NEW: GET paginated sessions list
- [x] `src/app/api/profile/route.js` — NEW: GET user profile + stats
- [x] `src/app/api/auth/me/route.js` — add PATCH handler
- [x] `src/app/api/learning-plan/route.js` — NEW: GET topics from last report

## Phase 2C — Resume Page Wiring
- [x] `src/components/resume.jsx` — wire upload + start + redirect

## Phase 2D — Interview Session Wiring
- [x] `src/components/interview-session.jsx` — wire session load, answer submit, completion

## Phase 2E — Interview Feedback Page Wiring
- [x] `src/app/interview-feedback/page.jsx` — fetch real report, remap UI
- [x] Delete `src/app/interview-feedback/data/mockReportData.js`

## Phase 2F — Dashboard Wiring
- [x] `src/components/Dashboard.jsx` — fetch /api/dashboard, replace mock constants

## Phase 2G — Reports Page Wiring
- [x] `src/components/reports/ReportsPage.jsx` — fetch /api/reports, replace mock constants

## Phase 2H — Profile Page Wiring
- [x] `src/components/profile/ProfileCard.jsx` — accept props, remove hardcoded data
- [x] `src/components/profile/StatsCard.jsx` — accept props, remove hardcoded STATS[]
- [x] `src/components/profile/SkillBreakdown.jsx` — accept props, remove hardcoded SKILLS[]
- [x] `src/components/profile/ProfileSettings.jsx` — fetch /api/profile, pass data down

## Phase 2I — Settings Page Wiring
- [x] `src/app/dashboard/settings/page.jsx` — fetch /api/auth/me, wire PATCH on save

## Phase 2J — Learning Plan Wiring
- [x] `src/app/dashboard/learning-plan/page.jsx` — fetch /api/learning-plan, replace mock
