# MobilePantry Pivot Sprint — Jira Epic Breakdown

**Epic:** MobilePantry Produce Rescue Platform Pivot
**Start Date:** March 2, 2026
**Target Launch:** March 15, 2026
**Duration:** 2 weeks (1 sprint)

---

## Context

MobilePantry is pivoting from a general food rescue donation model to a cosmetically imperfect produce rescue subscription model. The platform connects produce distributors/farms with MobilePantry's operations team, who rescue surplus produce, pack subscription boxes, and deliver to paying customers and community partners.

The existing codebase (Next.js + Firebase + Vercel) has a completed Donor Portal and Admin Dashboard. This sprint repurposes those interfaces for the new model:

- **Donor Portal → Supplier Portal:** Produce distributors and farms use this to alert MobilePantry of available surplus and schedule pickups.
- **Admin Dashboard → Ops Dashboard:** MobilePantry team uses this to manage incoming surplus alerts, confirm pickups, log weights and temps, and track supplier relationships.
- **Public Marketing Pages → Removed:** Marketing handled by Webflow (mobilepantry.org). Shopify handles e-commerce (shop.mobilepantry.org). The Next.js app lives at app.mobilepantry.org.

---

## Architecture

```
mobilepantry.org            → Webflow (marketing, story, blog, email capture)
shop.mobilepantry.org       → Shopify (subscription boxes, free box promo codes)
app.mobilepantry.org        → Next.js on Vercel (supplier portal + ops dashboard)
```

---

## Sprint Overview

| Sprint       | Dates          | Focus                                                       |
| ------------ | -------------- | ----------------------------------------------------------- |
| Pivot Sprint | Mar 2 - Mar 12 | Rebrand, data model update, ops dashboard, subdomain config |
| Launch       | Mar 15         | Final testing, deploy, go-live                              |

| Story     | Focus                                 | Tasks        |
| --------- | ------------------------------------- | ------------ |
| P.1       | Data Model & Schema Updates           | 3 tasks      |
| P.2       | Supplier Portal Rebrand               | 4 tasks      |
| P.3       | Ops Dashboard Updates                 | 3 tasks      |
| P.4       | App Shell, Routing & Subdomain Config | 3 tasks      |
| P.5       | Polish & Launch Prep                  | 4 tasks      |
| **Total** |                                       | **17 tasks** |

---

# Story P.1: Data Model & Schema Updates

### Story Description

As a development team, we need to update the Firestore data model and TypeScript types to reflect produce-specific fields so that the platform captures the information needed for produce rescue operations (surplus categories, case counts, temperature logging, standing vs. ad-hoc pickups).

### Business Value

- Captures produce-specific data required by the Operations Playbook (grading, temp, categories)
- Enables accurate tracking of pounds rescued, supplier relationships, and cold chain compliance
- Foundation for all other pivot sprint work — UI and dashboard changes depend on this

### Acceptance Criteria

- [ ] TypeScript types updated: `Donor` → `Supplier`, `PickupRequest` → `SurplusAlert`
- [ ] New fields added: produce category, estimated case count, temperature at pickup, alert type (ad-hoc vs. standing), produce grade
- [ ] Zod validation schemas updated to match new types
- [ ] Database helper functions updated with new field names and queries
- [ ] Firestore security rules updated for renamed collections (or aliased)
- [ ] Existing test data (if any) migrated or cleared

---

### Task P.1.1: Update TypeScript Types and Interfaces

**Reason**
The existing `Donor` and `PickupRequest` types don't capture produce-specific information required by the Operations Playbook.

**Goal**
Redefine TypeScript types to reflect the produce rescue model.

**Technical Requirements**

- Update `types/index.ts` (or create `types/supplier.ts` and `types/surplus.ts`):

  ```typescript
  // Rename Donor → Supplier
  export interface Supplier {
    id: string;
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    businessAddress: Address;
    businessType: SupplierType;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    userId: string;
  }

  export type SupplierType =
    | "distributor"
    | "wholesale"
    | "farm"
    | "grocery"
    | "restaurant"
    | "processor"
    | "other";

  // Rename PickupRequest → SurplusAlert
  export interface SurplusAlert {
    id: string;
    supplierId: string;
    status: AlertStatus;
    produceDescription: string;
    produceCategory: ProduceCategory[];
    estimatedWeightLbs: number;
    estimatedCaseCount?: number;
    produceGrade?: ProduceGrade;
    pickupAddress: Address;
    pickupDate: string;
    pickupTimeWindow: TimeWindow;
    alertType: AlertType;
    contactOnArrival: string;
    specialInstructions?: string;
    actualWeightLbs?: number;
    temperatureAtPickup?: number;
    actualGrade?: ProduceGrade;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export type AlertStatus =
    | "pending"
    | "confirmed"
    | "picked-up"
    | "completed"
    | "cancelled";

  export type ProduceCategory =
    | "fruits"
    | "vegetables"
    | "leafy-greens"
    | "root-vegetables"
    | "herbs"
    | "mixed"
    | "other";

  export type ProduceGrade = "A" | "B" | "C";
  export type AlertType = "ad-hoc" | "standing";
  export type TimeWindow = "morning" | "afternoon" | "evening";
  ```

- Add a `'picked-up'` status between `'confirmed'` and `'completed'` to reflect the actual operations flow
- Keep the `Address` type as-is

---

### Task P.1.2: Update Zod Validation Schemas

**Reason**
Form validation must match the new data model to ensure data quality.

**Goal**
Update Zod schemas for supplier registration and surplus alert submission.

**Technical Requirements**

- Update or create validation schemas in `lib/validations.ts`:

  ```typescript
  export const supplierSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    contactName: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    businessType: z.enum([
      "distributor", "wholesale", "farm", "grocery",
      "restaurant", "processor", "other",
    ]),
  });

  export const surplusAlertSchema = z.object({
    produceDescription: z.string().min(1, "Describe the available produce"),
    produceCategory: z.array(z.enum([
      "fruits", "vegetables", "leafy-greens", "root-vegetables",
      "herbs", "mixed", "other",
    ])).min(1, "Select at least one category"),
    estimatedWeightLbs: z.number().min(1, "Weight must be at least 1 lb"),
    estimatedCaseCount: z.number().min(1).optional(),
    produceGrade: z.enum(["A", "B", "C"]).optional(),
    alertType: z.enum(["ad-hoc", "standing"]),
    pickupDate: z.string().min(1, "Pickup date is required"),
    pickupTimeWindow: z.enum(["morning", "afternoon", "evening"]),
    contactOnArrival: z.string().min(1, "Contact method is required"),
    specialInstructions: z.string().optional(),
  });
  ```

- Ensure error messages are supplier-friendly, not developer-facing

---

### Task P.1.3: Update Database Helper Functions and Security Rules

**Reason**
Database helpers and Firestore rules reference the old `donors` and `pickupRequests` collection names and field structures.

**Goal**
Update all Firestore interaction code for the new data model.

**Technical Requirements**

- **Keep existing Firestore collection names** (`donors`, `pickupRequests`) to avoid data migration complexity. Map them in code:

  ```typescript
  // lib/db/suppliers.ts (rename from donors.ts)
  const SUPPLIERS_COLLECTION = 'donors';

  export async function getSupplier(userId: string): Promise<Supplier | null> { ... }
  export async function createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> { ... }
  export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<void> { ... }
  ```

- Update `lib/db/pickups.ts` → rename to `lib/db/surplus-alerts.ts`:

  ```typescript
  const ALERTS_COLLECTION = 'pickupRequests';

  export async function createSurplusAlert(data: ...): Promise<string> { ... }
  export async function getSurplusAlert(id: string): Promise<SurplusAlert | null> { ... }
  export async function updateAlertStatus(id: string, status: AlertStatus, extraFields?: Partial<SurplusAlert>): Promise<void> { ... }
  export async function getAlertsBySupplier(supplierId: string): Promise<SurplusAlert[]> { ... }
  export async function getPendingAlerts(): Promise<SurplusAlert[]> { ... }
  ```

- Update `lib/db/stats.ts` to compute new metrics:
  - Total pounds rescued (sum of `actualWeightLbs`)
  - Total surplus alerts by status
  - Active suppliers count
  - Avg temperature at pickup (for cold chain compliance tracking)
- Firestore security rules: No changes needed if collection names stay the same

---

# Story P.2: Supplier Portal Rebrand

### Story Description

As a produce supplier, I need a portal where I can create an account, alert MobilePantry of available surplus produce, and track the status of my alerts, so that my surplus gets rescued instead of wasted.

### Business Value

- Core interface for supplier engagement — without this, no produce gets rescued
- Frictionless experience encourages suppliers to use the platform instead of just texting/calling
- Structured data capture replaces ad-hoc text messages and shared Google Sheets
- Gives suppliers visibility into the status of their surplus alerts

### Acceptance Criteria

- [ ] Signup page collects supplier-specific info (business type includes distributor, wholesale, farm, etc.)
- [ ] Surplus alert form captures: produce description, category (multi-select), weight, case count, grade, pickup logistics, alert type (ad-hoc vs standing)
- [ ] Supplier dashboard shows pending alerts, impact stats (lbs rescued, alerts submitted), and recent activity
- [ ] Alert history page with status filter tabs
- [ ] Settings page updated with supplier-specific fields
- [ ] All UI text updated from donor/donation language to supplier/surplus language

---

### Task P.2.1: Update Auth Pages for Supplier Terminology

**Reason**
Signup, login, and profile completion pages reference "donor" and "donation" language that no longer applies.

**Goal**
Rebrand all auth pages for supplier context.

**Technical Requirements**

- Update `pages/auth/signup.tsx`:
  - Page title: "Create a Supplier Account"
  - Business type dropdown: Distributor, Wholesale, Farm, Grocery Store, Restaurant, Processor, Other
  - Placeholder text updates (e.g., "e.g., DNO Produce, Miller Farms")
  - CTA: "Create Supplier Account"
- Update `pages/auth/login.tsx`:
  - Subtitle: "Sign in to manage your surplus alerts"
  - "Don't have an account? Register as a supplier" link text
- Update `pages/auth/complete-profile.tsx`:
  - Same business type changes as signup
  - Helper text: "Complete your supplier profile to start submitting surplus alerts"
- Update meta titles and descriptions on all auth pages

---

### Task P.2.2: Rebuild Surplus Alert Form (was Pickup Request Form)

**Reason**
The pickup request form needs produce-specific fields to capture structured data about available surplus.

**Goal**
Create a surplus alert form that captures all information needed for produce rescue operations.

**Technical Requirements**

- Update `pages/donor/request.tsx` → rename route to `pages/supplier/alert.tsx`
- Form fields (using React Hook Form + Zod with `surplusAlertSchema`):
  1. **What produce is available?** (textarea) — Required
  2. **Produce category** (multi-select checkboxes) — Required (at least one)
  3. **Estimated weight (lbs)** (number input) — Required, min 1
  4. **Estimated case count** (number input) — Optional
  5. **Produce grade** (select, optional) — A/B/C/Not sure
  6. **Alert type** (radio buttons) — Ad-hoc (default) or Standing weekly
  7. **Pickup address** (address fields) — Pre-fill from supplier profile
  8. **Pickup date** (date picker) — Default to today, min today
  9. **Pickup time window** (select) — Morning/Afternoon/Evening
  10. **Contact on arrival** (text input) — Required
  11. **Special instructions** (textarea) — Optional
- Submit button: "Submit Surplus Alert"
- On submit: validate, POST to `/api/surplus-alerts`, create Firestore doc, send Slack notification, redirect to detail page
- Mobile-first responsive design

---

### Task P.2.3: Update Supplier Dashboard and Alert History

**Reason**
The donor dashboard and donation history pages need to reflect supplier-specific metrics and surplus alert tracking.

**Goal**
Rebrand and update the supplier-facing dashboard and history pages.

**Technical Requirements**

- Update `pages/donor/dashboard.tsx` → `pages/supplier/dashboard.tsx`:
  - Welcome header: "Welcome back, {businessName}"
  - Impact stats: Pounds Rescued, Surplus Alerts Submitted, Active Alerts
  - Pending alerts section with status cards
  - Quick action: "Submit New Surplus Alert"
- Update `pages/donor/history.tsx` → `pages/supplier/history.tsx`:
  - Status filter tabs: All | Pending | Confirmed | Picked Up | Completed | Cancelled
  - Table columns: Date, Produce, Category, Est. Weight, Actual Weight, Status
  - Summary stats at top
- Update `pages/donor/settings.tsx` → `pages/supplier/settings.tsx`:
  - Business profile form with updated `SupplierType` dropdown

---

### Task P.2.4: Update Alert Detail and Confirmation Page

**Reason**
Suppliers need to see the status of individual surplus alerts with produce-specific details.

**Goal**
Update the request detail page to show surplus alert information.

**Technical Requirements**

- Update `pages/donor/request/[id].tsx` → `pages/supplier/alert/[id].tsx`
- Status-specific messaging (Pending, Confirmed, Picked Up, Completed, Cancelled)
- Alert details section: produce description, category badges, weights, grade, alert type
- Pickup logistics section: address, date, time window, contact, instructions
- Timeline showing status changes with timestamps

---

# Story P.3: Ops Dashboard Updates

### Story Description

As the MobilePantry operations team, we need the admin dashboard to show produce-specific information and cold chain data so that we can manage surplus alerts, confirm pickups, log weights and temperatures, and track supplier relationships effectively.

### Business Value

- Ops team can manage the full produce rescue workflow from alert to completion
- Temperature logging supports cold chain compliance per the Operations Playbook
- Produce grading data helps track supplier quality over time
- Metrics shift from donation-centric to rescue-centric

### Acceptance Criteria

- [ ] Dashboard home shows updated metrics: pending alerts, weekly lbs rescued, active suppliers, avg pickup temp
- [ ] Request detail page includes produce-specific fields and temp/grade logging on completion
- [ ] Donor list → Supplier list with supplier-specific stats
- [ ] Slack notifications updated with produce-specific details
- [ ] Status flow includes new "Picked Up" state

---

### Task P.3.1: Update Admin Dashboard Home and Metrics

**Reason**
Dashboard metrics need to reflect produce rescue operations, not general food donations.

**Goal**
Update the admin home page with produce rescue metrics.

**Technical Requirements**

- Update `pages/admin/index.tsx`:
  - Metrics cards: Pending Alerts, Lbs Rescued This Week, Active Suppliers, Avg Pickup Temp
  - Temperature color-coding: green ≤38°F, yellow 39-41°F, red >41°F
  - Pending alerts list with quick actions (Confirm | View Details)
  - Recent activity table: Date, Supplier, Produce, Weight, Status, Temp

---

### Task P.3.2: Update Admin Request Detail with Produce Fields

**Reason**
When completing a pickup, the ops team needs to log actual weight, temperature, and produce grade per the Operations Playbook.

**Goal**
Add produce-specific fields to the admin request detail page.

**Technical Requirements**

- Update `pages/admin/requests/[id].tsx`:
  - Alert info: produce description, categories, weight, case count, grade, alert type
  - Status actions: Pending→Confirmed, Confirmed→Picked Up, Picked Up→Completed (with weight/temp/grade modal), Any→Cancelled
  - Temperature warning if >41°F
  - Supplier info section with link to supplier detail
  - Timeline of status changes

---

### Task P.3.3: Update Admin Lists and Slack Notifications

**Reason**
The admin requests list, suppliers list, and Slack notifications need produce-specific terminology.

**Goal**
Update all remaining admin pages and the Slack notification format.

**Technical Requirements**

- Update `pages/admin/requests/index.tsx`: Add "Picked Up" status tab, produce-specific columns
- Update `pages/admin/donors/` → `pages/admin/suppliers/`: Rebrand all donor references
- Update `lib/slack.ts` with new surplus alert notification format
- Rename API endpoint: `pages/api/pickup-requests.ts` → `pages/api/surplus-alerts.ts`

---

# Story P.4: App Shell, Routing & Subdomain Config

### Story Description

As a development team, we need to remove the public marketing pages from the Next.js app, update the routing structure, and configure the app to run on a subdomain.

### Business Value

- Clean separation between marketing (Webflow), e-commerce (Shopify), and operations (Next.js)
- Reduces Next.js app to only operational pages
- Enables marketing team to update mobilepantry.org without developer involvement

### Acceptance Criteria

- [ ] Public marketing pages (homepage, about, contact) removed from Next.js
- [ ] App root (/) redirects to login or supplier dashboard based on auth state
- [ ] Navigation updated — no marketing links, just supplier/admin portal links
- [ ] Route structure updated from `/donor/` to `/supplier/`
- [ ] Vercel configured for `app.mobilepantry.org` subdomain
- [ ] CORS and environment variables updated for subdomain

---

### Task P.4.1: Remove Marketing Pages and Update Routing

**Reason**
The public marketing site is moving to Webflow. The Next.js app should only contain the supplier portal and ops dashboard.

**Goal**
Remove marketing pages and update the routing structure.

**Technical Requirements**

- Delete pages: `pages/index.tsx` (homepage), `pages/about.tsx`, `pages/contact.tsx`
- New `pages/index.tsx`: redirect to `/supplier/dashboard` or `/auth/login` based on auth
- Rename `/donor/` → `/supplier/` routes
- Rename `/admin/donors/` → `/admin/suppliers/` routes
- Add redirects in `next.config.js` for old routes
- Update all internal links

---

### Task P.4.2: Update App Shell and Navigation

**Reason**
The Header and Footer components reference marketing pages and use donor-centric language.

**Goal**
Update the app shell to reflect the operational app context.

**Technical Requirements**

- Update Header: Remove marketing nav links, add Supplier/Admin portal navigation
- Update Footer: Simplified — "© 2026 MobilePantry · Driving to End Hunger" with external links to mobilepantry.org and shop.mobilepantry.org
- Update Layout component

---

### Task P.4.3: Configure Subdomain and Environment

**Reason**
The app needs to run on `app.mobilepantry.org` as a subdomain.

**Goal**
Configure Vercel deployment for subdomain and update all environment references.

**Technical Requirements**

- Vercel: Add custom domain `app.mobilepantry.org`, configure DNS
- Webflow: Configure DNS for root domain
- Update environment variables (`NEXT_PUBLIC_APP_URL=https://app.mobilepantry.org`)
- Update Firebase Auth authorized domains
- Update Slack dashboard links
- Document in `docs/DNS_SETUP.md`

---

# Story P.5: Polish & Launch Prep

### Story Description

As a development team, we need to verify the pivoted application works end-to-end, is mobile responsive, handles errors gracefully, and is ready for pilot launch with initial suppliers.

### Business Value

- Ensures reliability for pilot launch with real suppliers
- Mobile responsiveness is critical — suppliers may submit alerts from warehouse floors
- Error handling prevents data loss and builds supplier trust

### Acceptance Criteria

- [ ] All pages mobile responsive (tested on 375px, 768px, 1024px breakpoints)
- [ ] Error states and loading states present on all data-fetching pages
- [ ] SEO meta tags updated for app.mobilepantry.org
- [ ] Manual testing checklist covers full supplier and admin flows
- [ ] Production environment verified with real subdomain
- [ ] Launch day checklist created

---

### Task P.5.1: Mobile Responsiveness Audit

Test all pages at 375px, 768px, 1024px. Verify surplus alert form is completable on mobile, touch targets ≥44px, tables switch to card view.

---

### Task P.5.2: Error Handling and Loading States

Add skeleton loaders, form state persistence to sessionStorage, retry logic, user-friendly error messages, and empty states.

---

### Task P.5.3: SEO and Meta Tags

Update default meta (title: "MobilePantry | Supplier Portal"), per-page titles, add robots.txt, canonical URLs for `app.mobilepantry.org`.

---

### Task P.5.4: Testing Checklist and Launch Day Runbook

Create `docs/TESTING_CHECKLIST.md` and `docs/LAUNCH_CHECKLIST.md` covering full supplier flow, admin flow, mobile testing, and edge cases.

---

# Backlog (Post-Pivot Launch)

## Story B.1: Shopify Integration

Connect Shopify subscription store to platform. Subscription product ($7/week, $28/month), free box promo codes, order data in ops dashboard.

## Story B.2: Standing Pickup Automation

Auto-generate weekly surplus alerts for standing pickups. Suppliers can pause, modify, or cancel.

## Story B.3: Supplier Onboarding Automation

Track 4-week pilot onboarding: Outreach → Discovery Visit → Pilot → Formalized. MOU management, impact reports.

## Story B.4: Public Impact Dashboard

Public page with aggregated stats, trend charts, embeddable widget for partners.

---

_— End of Pivot Sprint Epic —_
