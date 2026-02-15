# CLAUDE.md — MobilePantry Agent Handoff

> **FOR AI AGENTS:** This file is your source of truth for task status. Before starting work:
>
> 1. Read this file to understand current state
> 2. Check what's `[~] In Progress` — don't duplicate work
> 3. Pick up `[ ] To Do` tasks in sprint order
> 4. Before starting a task, mark it `[~] In Progress` with your session ID and date
> 5. When done, mark `[x] Done` with date and add a brief Work Log entry
> 6. **Always check `/docs/JIRA_EPIC.md` for full task details and acceptance criteria**
>
> Status key: `[ ]` To Do | `[~]` In Progress | `[x]` Done | `[!]` Blocked | `[-]` Skipped

---

## Quick Status

| Sprint   | Dates           | Status         |
| -------- | --------------- | -------------- |
| Sprint 1 | Jan 15 - Jan 29 | ✅ Complete    |
| Sprint 2 | Jan 29 - Feb 12 | ✅ Complete    |
| Sprint 3 | Feb 12 - Feb 26 | 🔵 Active      |
| Sprint 4 | Feb 26 - Mar 12 | ⚪ Not Started |
| Launch   | Mar 15          | ⚪ Target      |

**Current Focus:** Sprint 3 — Donor Portal

---

## Sprint 1: Foundation (Jan 15 - Jan 29)

### Story 1.1: Project Infrastructure Setup

- [x] Task 1.1.1: Initialize Next.js Project with Tailwind (2025-01-15)
- [x] Task 1.1.2: Set Up shadcn/ui Component Library (2025-01-15)
- [x] Task 1.1.3: Configure Firebase Project (2025-01-15)
- [x] Task 1.1.4: Deploy to Vercel (2025-01-15)

### Story 1.2: Authentication System

- [x] Task 1.2.1: Create Auth Context and Hooks (2026-01-20)
- [x] Task 1.2.2: Build Login Page (2026-01-20)
- [x] Task 1.2.3: Build Signup Page (2026-01-20)
- [x] Task 1.2.4: Build Forgot Password Page (2026-01-20)

### Story 1.3: Database Schema Implementation

- [x] Task 1.3.1: Define TypeScript Types and Firestore Schema (2026-01-20)
- [x] Task 1.3.2: Create Database Helper Functions (2026-01-20)
- [x] Task 1.3.3: Configure Firestore Security Rules (2026-01-20)

---

## Sprint 2: Public Site + Donor Registration (Jan 29 - Feb 12)

### Story 2.1: Public Marketing Website

- [x] Task 2.1.1: Create Shared Layout Component (2026-01-27)
- [x] Task 2.1.2: Build Homepage (2026-01-27)
- [x] Task 2.1.3: Build About Page (2026-01-27)
- [x] Task 2.1.4: Build Contact Page (2026-01-27)

### Story 2.2: Donor Onboarding Polish

- [x] Task 2.2.1: Build Google OAuth Profile Completion (2026-01-27)
- [x] Task 2.2.2: Implement Form Validation with React Hook Form (2026-01-27)
- [x] Task 2.2.3: Add Loading States and Success Messages (2026-01-27)

---

## Sprint 3: Donor Portal (Feb 12 - Feb 26)

### Story 3.1: Pickup Request Form

- [x] Task 3.1.1: Build Pickup Request Form UI (2026-02-03)
- [x] Task 3.1.2: Implement Pickup Request Submission (2026-02-03)
- [x] Task 3.1.3: Build Request Confirmation Page (2026-02-03)

### Story 3.2: Donor Dashboard

- [x] Task 3.2.1: Build Donor Dashboard Page (2026-02-10)
- [x] Task 3.2.2: Build Donation History Page (2026-02-10)
- [x] Task 3.2.3: Build Donor Settings Page (2026-02-10)

---

## Sprint 4: Admin Dashboard + Polish (Feb 26 - Mar 12)

### Story 4.1: Admin Dashboard

- [ ] Task 4.1.1: Build Admin Dashboard Home
- [ ] Task 4.1.2: Build Admin Requests List Page
- [ ] Task 4.1.3: Build Admin Request Detail Page
- [ ] Task 4.1.4: Build Admin Donors List Page
- [ ] Task 4.1.5: Build Admin Donor Detail Page

### Story 4.2: Slack Integration

- [ ] Task 4.2.1: Set Up Slack App and Webhook
- [ ] Task 4.2.2: Implement Slack Notification Function

### Story 4.3: Polish and Launch Prep

- [ ] Task 4.3.1: Mobile Responsiveness Audit
- [ ] Task 4.3.2: Error Handling and Loading States
- [ ] Task 4.3.3: SEO and Meta Tags
- [ ] Task 4.3.4: Create Manual Testing Checklist
- [ ] Task 4.3.5: Production Environment Setup
- [ ] Task 4.3.6: Launch Day Checklist

---

## Work Log

> Keep last 10 entries. Newest at top. Format: `YYYY-MM-DD @agent — what was done, decisions made, blockers`

- 2026-02-10 @claude — Story 3.2 completed: Built donor dashboard (donor/dashboard.tsx) with welcome header, impact stats cards (pounds donated, meals provided, total donations), pending requests section with status badges, and recent donations table with mobile card view. Built donation history page (donor/history.tsx) with full request list, status filter tabs (all/pending/confirmed/completed/cancelled), summary stats, and responsive table/card layout. Built donor settings page (donor/settings.tsx) with business profile edit form (React Hook Form + Zod), account settings (email display, password change for email/password users, Google OAuth info), and Firebase reauthentication for password changes. Added Settings link to Header dropdown and mobile menu. Build verified clean.
- 2026-02-03 @claude — Story 3.1 completed: Built pickup request form (donor/request.tsx) with all fields per spec: food description, estimated weight, address (pre-fills from donor profile with toggle), pickup date (defaults to today), time window select, contact on arrival, special instructions. Created API endpoint (api/pickup-requests.ts) that creates Firestore document and sends Slack notification. Built request detail page (donor/request/[id].tsx) with status-specific messaging, all request details, and Google Maps link. Created Zod validation schema and Slack notification lib.
- 2026-01-27 @claude — Story 2.2 verified complete: Reviewed auth flow and fixed bug in login.tsx where Google OAuth wasn't checking for donor profile before redirect. All form validations (login, signup, forgot-password, complete-profile) confirmed working with React Hook Form + Zod. Loading states and success toasts present on all auth pages.
- 2026-01-27 @claude — Story 2.1 completed: Created shared Layout components (Header with responsive nav, auth-aware user dropdown, mobile hamburger menu; Footer with logo, social links, email). Built Homepage recreating reference design with mission statement card, How accordion, Founders section (blue bg), Board section (white bg), and CTA. Created About page with mission, how we work, and our story sections. Created Contact page with contact info and "coming soon" form placeholder. All pages use consistent theming and are mobile responsive.
- 2026-01-20 @claude — Stories 1.2 & 1.3 completed: Created AuthContext with Firebase Auth (email/password + Google OAuth), useAuth/useRequireAuth/useRequireAdmin hooks. Built login, signup, forgot-password, and complete-profile pages with React Hook Form + Zod validation. Created TypeScript types (Donor, PickupRequest, Address) and Firestore helper functions (donors.ts, pickups.ts, stats.ts). Added Firestore security rules with admin email allowlist. Also added NEXT_PUBLIC_ADMIN_EMAILS env var for client-side admin check.
- 2025-01-15 @claude — Task 1.1.4 completed: Made GitHub repository public. Deployed to Vercel (Hobby plan) at https://mp-web-livid.vercel.app/. Configured all Firebase environment variables in Vercel dashboard. Verified automatic preview deployments working. Added deployment badge to README. Decision: Using james@mobilepantry.org Vercel account with Hobby plan for MVP.
- 2025-01-15 @claude — Task 1.1.3 completed: Installed Firebase SDK. Created lib/firebase.ts with auth and Firestore initialization. Configured environment variables in .env.local and .env.local.example. Reused existing Firebase project (MobilePantry-MVP) with Email/Password and Google OAuth enabled. Verified connection after updating Firestore rules to test mode.
- 2025-01-15 @claude — Task 1.1.2 completed: Initialized shadcn/ui with default style and Slate base color. Installed 13 components (button, input, label, card, form, select, textarea, table, badge, alert, dialog, dropdown-menu, sonner). Created components/ui/index.ts for clean exports. Added secondary colors (#159977, #FFDF05, #F29516, #CC3332). Build verified successful.
- 2025-01-15 @claude — Task 1.1.1 completed: Created required folder structure (components/ui, components/layout, components/common, hooks, lib, types, pages/auth, pages/donor, pages/admin). Configured Tailwind CSS v4 with custom primary color #23AAE1 via @theme directive. Updated README.md with project structure details.
- 2025-01-15 @human — Project initialized with create-next-app (Pages Router, TypeScript, Tailwind). CLAUDE.md and docs created. Ready for Sprint 1.

---

## Blockers

> List anything blocking progress. Remove when resolved.

_None currently._

---

## Key Decisions

> Important architectural or design decisions agents should know about.

- **Auth:** Using Firebase Auth with email/password + Google OAuth
- **Admin access:** Email allowlist via `ADMIN_EMAILS` env var (no roles table for MVP)
- **Notifications:** Slack webhooks to #pickup-requests channel
- **Styling:** Tailwind + shadcn/ui components
- **Database:** Firestore with `donors` and `pickupRequests` collections

---

## References

- `/docs/MVP_SPEC.md` — Full product specification
- `/docs/JIRA_EPIC.md` — Complete story and task details with acceptance criteria
- `/README.md` — Setup instructions and project structure
