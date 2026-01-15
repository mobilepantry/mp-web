# CLAUDE.md — MobilePantry Agent Handoff

> **FOR AI AGENTS:** This file is your source of truth for task status. Before starting work:
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

| Sprint | Dates | Status |
|--------|-------|--------|
| Sprint 1 | Jan 15 - Jan 29 | 🔵 Active |
| Sprint 2 | Jan 29 - Feb 12 | ⚪ Not Started |
| Sprint 3 | Feb 12 - Feb 26 | ⚪ Not Started |
| Sprint 4 | Feb 26 - Mar 12 | ⚪ Not Started |
| Launch | Mar 15 | ⚪ Target |

**Current Focus:** Sprint 1 — Foundation (project setup, auth, database)

---

## Sprint 1: Foundation (Jan 15 - Jan 29)

### Story 1.1: Project Infrastructure Setup
- [x] Task 1.1.1: Initialize Next.js Project with Tailwind (2025-01-15)
- [ ] Task 1.1.2: Set Up shadcn/ui Component Library
- [ ] Task 1.1.3: Configure Firebase Project
- [ ] Task 1.1.4: Deploy to Vercel

### Story 1.2: Authentication System
- [ ] Task 1.2.1: Create Auth Context and Hooks
- [ ] Task 1.2.2: Build Login Page
- [ ] Task 1.2.3: Build Signup Page
- [ ] Task 1.2.4: Build Forgot Password Page

### Story 1.3: Database Schema Implementation
- [ ] Task 1.3.1: Define TypeScript Types and Firestore Schema
- [ ] Task 1.3.2: Create Database Helper Functions
- [ ] Task 1.3.3: Configure Firestore Security Rules

---

## Sprint 2: Public Site + Donor Registration (Jan 29 - Feb 12)

### Story 2.1: Public Marketing Website
- [ ] Task 2.1.1: Create Shared Layout Component
- [ ] Task 2.1.2: Build Homepage
- [ ] Task 2.1.3: Build About Page
- [ ] Task 2.1.4: Build Contact Page

### Story 2.2: Donor Onboarding Polish
- [ ] Task 2.2.1: Build Google OAuth Profile Completion
- [ ] Task 2.2.2: Implement Form Validation with React Hook Form
- [ ] Task 2.2.3: Add Loading States and Success Messages

---

## Sprint 3: Donor Portal (Feb 12 - Feb 26)

### Story 3.1: Pickup Request Form
- [ ] Task 3.1.1: Build Pickup Request Form UI
- [ ] Task 3.1.2: Implement Pickup Request Submission
- [ ] Task 3.1.3: Build Request Confirmation Page

### Story 3.2: Donor Dashboard
- [ ] Task 3.2.1: Build Donor Dashboard Page
- [ ] Task 3.2.2: Build Donation History Page
- [ ] Task 3.2.3: Build Donor Settings Page

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