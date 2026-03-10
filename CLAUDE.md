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

- [x] TypeScript types updated: `Donor` → `Supplier`, `PickupRequest` → `SurplusAlert`
- [x] New fields added: produce category, estimated case count, temperature at pickup, alert type (ad-hoc vs. standing), produce grade
- [x] Zod validation schemas updated to match new types
- [x] Database helper functions updated with new field names and queries
- [x] Firestore security rules updated for renamed collections (or aliased)
- [x] Existing test data (if any) migrated or cleared

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
    businessName: string; // e.g., "DNO Produce"
    contactName: string;
    email: string;
    phone: string;
    businessAddress: Address;
    businessType: SupplierType; // Updated enum
    createdAt: Timestamp;
    updatedAt: Timestamp;
    userId: string; // Firebase Auth UID
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
    // Produce details
    produceDescription: string; // "Mixed stone fruit, leafy greens"
    produceCategory: ProduceCategory[]; // Multi-select
    estimatedWeightLbs: number;
    estimatedCaseCount?: number; // Optional — not all suppliers think in cases
    produceGrade?: ProduceGrade; // Optional — supplier may not know
    // Pickup logistics
    pickupAddress: Address;
    pickupDate: string; // ISO date
    pickupTimeWindow: TimeWindow;
    alertType: AlertType; // 'ad-hoc' | 'standing'
    contactOnArrival: string;
    specialInstructions?: string;
    // Post-pickup (filled by admin)
    actualWeightLbs?: number;
    temperatureAtPickup?: number; // °F — must be ≤41°F per SOP
    actualGrade?: ProduceGrade;
    // Metadata
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

  export type ProduceGrade = "A" | "B" | "C"; // Per SOP grading

  export type AlertType = "ad-hoc" | "standing";

  export type TimeWindow =
    | "morning" // 8am-12pm
    | "afternoon" // 12pm-5pm
    | "evening"; // 5pm-8pm
  ```

- Add a `'picked-up'` status between `'confirmed'` and `'completed'` to reflect the actual operations flow (confirmed → driver en route → picked up → weighed/graded at hub → completed)
- Keep the `Address` type as-is — it still works

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
      "distributor",
      "wholesale",
      "farm",
      "grocery",
      "restaurant",
      "processor",
      "other",
    ]),
    // Address fields same as before
  });

  export const surplusAlertSchema = z.object({
    produceDescription: z.string().min(1, "Describe the available produce"),
    produceCategory: z
      .array(
        z.enum([
          "fruits",
          "vegetables",
          "leafy-greens",
          "root-vegetables",
          "herbs",
          "mixed",
          "other",
        ]),
      )
      .min(1, "Select at least one category"),
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

- **Decision: Keep existing Firestore collection names** (`donors`, `pickupRequests`) to avoid data migration complexity. Map them in code:

  ```typescript
  // lib/db/suppliers.ts (rename from donors.ts)
  // Collection is still 'donors' in Firestore, but code refers to Supplier type
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
- Firestore security rules: No changes needed if collection names stay the same. Just verify the rules still apply correctly.

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

- [x] Signup page collects supplier-specific info (business type includes distributor, wholesale, farm, etc.)
- [x] Surplus alert form captures: produce description, category (multi-select), weight, case count, grade, pickup logistics, alert type (ad-hoc vs standing)
- [x] Supplier dashboard shows pending alerts, impact stats (lbs rescued, alerts submitted), and recent activity
- [x] Alert history page with status filter tabs
- [x] Settings page updated with supplier-specific fields
- [x] All UI text updated from donor/donation language to supplier/surplus language

---

### Task P.2.1: Update Auth Pages for Supplier Terminology

**Reason**  
Signup, login, and profile completion pages reference "donor" and "donation" language that no longer applies.

**Goal**  
Rebrand all auth pages for supplier context.

**Technical Requirements**

- Update `pages/auth/signup.tsx`:
  - Page title: "Create a Supplier Account" (was "Create an Account")
  - Business type dropdown options:
    - Distributor
    - Wholesale
    - Farm
    - Grocery Store
    - Restaurant
    - Processor
    - Other
  - Placeholder text updates:
    - Business name: "e.g., DNO Produce, Miller Farms"
    - Phone: "e.g., 614-555-1234"
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
The pickup request form needs produce-specific fields to capture structured data about available surplus, matching the notification protocols in the Operations Playbook.

**Goal**  
Create a surplus alert form that captures all information needed for produce rescue operations.

**Technical Requirements**

- Update `pages/donor/request.tsx` → rename route to `pages/supplier/alert.tsx` (or keep `/donor/` path and redirect — see Task P.4.1):
- Form fields (using React Hook Form + Zod with `surplusAlertSchema`):
  1. **What produce is available?** (textarea)
     - Placeholder: "e.g., 20 cases mixed stone fruit, 10 cases romaine lettuce — cosmetic only"
     - Required
  2. **Produce category** (multi-select checkboxes)
     - Options: Fruits, Vegetables, Leafy Greens, Root Vegetables, Herbs, Mixed, Other
     - Required (at least one)
  3. **Estimated weight (lbs)** (number input)
     - Placeholder: "500"
     - Required, min 1
  4. **Estimated case count** (number input)
     - Placeholder: "30"
     - Optional — helper text: "If applicable"
  5. **Produce grade** (select, optional)
     - Options: "A — Minor cosmetic" | "B — Noticeable blemishes, fully edible" | "C — Very ripe, use immediately" | "Not sure"
     - Helper text: "How would you rate the condition?"
  6. **Alert type** (radio buttons)
     - "One-time surplus (ad-hoc)" — default
     - "Standing weekly pickup" — helper text: "We'll pick up at the same time every week"
  7. **Pickup address** (address fields)
     - Pre-fill from supplier profile
     - "Use my business address" checkbox (checked by default)
     - Required
  8. **Pickup date** (date picker)
     - Default to today
     - Min date: today
     - Required
  9. **Pickup time window** (select)
     - Options: Morning (8am–12pm), Afternoon (12pm–5pm), Evening (5pm–8pm)
     - Required
  10. **Contact on arrival** (text input)
      - Placeholder: "Call 614-555-1234 or ask for warehouse manager"
      - Required
  11. **Special instructions** (textarea)
      - Placeholder: "e.g., Use loading dock B, bring your own bins, product is on pallets"
      - Optional
- Submit button: "Submit Surplus Alert"
- On submit:
  - Validate via Zod schema
  - POST to `/api/surplus-alerts` (renamed from `/api/pickup-requests`)
  - Create Firestore document with `status: 'pending'`
  - Send Slack notification (see Task P.3.3)
  - Redirect to alert detail page
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
  - Impact stats cards:
    - "Pounds Rescued" (sum of `actualWeightLbs` from completed alerts)
    - "Surplus Alerts Submitted" (total count)
    - "Active Alerts" (pending + confirmed count)
  - Pending alerts section:
    - Show alerts with status `pending` or `confirmed`
    - Each card shows: produce description, category badges, estimated weight, pickup date, status badge
    - Click to view alert detail
  - Quick action: "Submit New Surplus Alert" button prominently placed
  - Recent activity table showing last 5 alerts
- Update `pages/donor/history.tsx` → `pages/supplier/history.tsx`:
  - Status filter tabs: All | Pending | Confirmed | Picked Up | Completed | Cancelled
  - Table columns: Date, Produce, Category, Est. Weight, Actual Weight, Status
  - Mobile: card view with same info
  - Summary stats at top: Total alerts, Total lbs rescued, Completion rate
- Update `pages/donor/settings.tsx` → `pages/supplier/settings.tsx`:
  - Business profile form with updated `SupplierType` dropdown
  - All labels updated from donor to supplier language

---

### Task P.2.4: Update Alert Detail and Confirmation Page

**Reason**  
Suppliers need to see the status of individual surplus alerts with produce-specific details.

**Goal**  
Update the request detail page to show surplus alert information.

**Technical Requirements**

- Update `pages/donor/request/[id].tsx` → `pages/supplier/alert/[id].tsx`:
  - Status-specific messaging:
    - Pending: "Your surplus alert has been received. Our team will confirm pickup shortly."
    - Confirmed: "Pickup confirmed! We'll be there on {date} during the {timeWindow} window."
    - Picked Up: "Produce has been picked up and is being processed at our hub."
    - Completed: "Rescue complete! {actualWeightLbs} lbs of produce rescued."
    - Cancelled: "This alert was cancelled." + reason if provided
  - Alert details section:
    - Produce description
    - Category badges
    - Estimated weight + actual weight (if completed)
    - Case count (if provided)
    - Grade (supplier estimate + actual if completed)
    - Alert type badge (ad-hoc or standing)
  - Pickup logistics section:
    - Address with "Open in Maps" link
    - Date and time window
    - Contact on arrival
    - Special instructions
  - Timeline showing status changes with timestamps

---

# Story P.3: Ops Dashboard Updates

### Story Description

As the MobilePantry operations team, we need the admin dashboard to show produce-specific information and cold chain data so that we can manage surplus alerts, confirm pickups, log weights and temperatures, and track supplier relationships effectively.

### Business Value

- Ops team can manage the full produce rescue workflow from alert to completion
- Temperature logging supports cold chain compliance per the Operations Playbook
- Produce grading data helps track supplier quality over time
- Metrics shift from donation-centric to rescue-centric, aligned with the new model

### Acceptance Criteria

- [x] Dashboard home shows updated metrics: pending alerts, weekly lbs rescued, active suppliers, avg pickup temp
- [x] Request detail page includes produce-specific fields and temp/grade logging on completion
- [x] Donor list → Supplier list with supplier-specific stats (total lbs, avg frequency, produce categories)
- [x] Slack notifications updated with produce-specific details
- [x] Status flow includes new "Picked Up" state

---

### Task P.3.1: Update Admin Dashboard Home and Metrics

**Reason**  
Dashboard metrics need to reflect produce rescue operations, not general food donations.

**Goal**  
Update the admin home page with produce rescue metrics.

**Technical Requirements**

- Update `pages/admin/index.tsx`:
  - Metrics cards:
    - "Pending Alerts" (count of `status: 'pending'`)
    - "Lbs Rescued This Week" (sum of `actualWeightLbs` for completed alerts in current week)
    - "Active Suppliers" (count of suppliers with at least one alert in last 30 days)
    - "Avg Pickup Temp" (average `temperatureAtPickup` for completed alerts — display in °F, flag if above 41°F)
  - Pending alerts list:
    - Show: Supplier name, produce categories, estimated weight, pickup date, time window
    - Quick action buttons: Confirm | View Details
  - Recent activity table:
    - Columns: Date, Supplier, Produce, Weight, Status, Temp
    - Color-code temps: green ≤38°F, yellow 39-41°F, red >41°F
- Update stats helper functions in `lib/db/stats.ts` to compute new metrics

---

### Task P.3.2: Update Admin Request Detail with Produce Fields

**Reason**  
When completing a pickup, the ops team needs to log actual weight, temperature, and produce grade per the Operations Playbook cold chain protocol.

**Goal**  
Add produce-specific fields to the admin request detail page, including temperature and grading on completion.

**Technical Requirements**

- Update `pages/admin/requests/[id].tsx`:
  - Alert info section:
    - Produce description, category badges, estimated weight, case count
    - Supplier-estimated grade (if provided)
    - Alert type (ad-hoc or standing)
  - Status actions:
    - **Pending → Confirmed:** Confirm button (same as before)
    - **Confirmed → Picked Up:** New "Mark Picked Up" button
    - **Picked Up → Completed:** "Mark Completed" opens modal with:
      - Actual weight (lbs) — required
      - Temperature at pickup (°F) — required
        - Warning banner if >41°F: "⚠️ Temperature exceeds 41°F. Per SOP, reject if rapid cooling isn't possible within 30 min."
      - Actual produce grade (A/B/C) — required
      - Notes (optional)
    - **Any → Cancelled:** Cancel with confirmation dialog + reason field
  - Supplier info section:
    - Business name, contact, phone, email
    - Link to supplier detail page
    - Supplier's total alert count and completion rate
  - Timeline showing all status changes with timestamps and who made the change
  - "Open in Maps" link for pickup address

---

### Task P.3.3: Update Admin Lists and Slack Notifications

**Reason**  
The admin requests list, suppliers list, and Slack notifications need to reflect produce-specific terminology and data.

**Goal**  
Update all remaining admin pages and the Slack notification format.

**Technical Requirements**

- Update `pages/admin/requests/index.tsx`:
  - Status filter tabs: All | Pending | Confirmed | Picked Up | Completed | Cancelled
  - Table columns: Date, Supplier, Produce, Est. Wt, Actual Wt, Temp, Status
  - Mobile cards with same info
  - Add "Picked Up" to status badge colors (use orange/amber)
- Update `pages/admin/donors/index.tsx` → `pages/admin/suppliers/index.tsx`:
  - Rename all "Donor" references to "Supplier"
  - Sort options: Recent, A-Z, Top Suppliers (by lbs rescued)
  - Per-supplier stats: Total lbs rescued, Alert count, Avg frequency, Primary produce categories
- Update `pages/admin/donors/[id].tsx` → `pages/admin/suppliers/[id].tsx`:
  - Supplier impact stats: Lbs rescued, Alerts completed, Avg pickup temp, Primary categories
  - Contact info
  - Full alert history table
- Update `lib/slack.ts`:
  ```
  Slack message format:
  🥬 New Surplus Alert
  ─────────────────
  Supplier:    DNO Produce
  Contact:     John Smith
  Produce:     Mixed stone fruit, leafy greens
  Categories:  🍎 Fruits, 🥬 Leafy Greens
  Est. Weight: ~500 lbs (30 cases)
  Grade:       B — Noticeable blemishes, fully edible
  Pickup:      Mar 5, Morning (8am–12pm)
  Address:     737 Parkwood Ave, Columbus OH
  Type:        Ad-hoc
  Contact:     Call 614-555-1234, ask for warehouse mgr
  ─────────────────
  → View in dashboard: [link]
  ```
- Update API endpoint: Rename `pages/api/pickup-requests.ts` → `pages/api/surplus-alerts.ts`

---

# Story P.4: App Shell, Routing & Subdomain Config

### Story Description

As a development team, we need to remove the public marketing pages from the Next.js app, update the routing structure, and configure the app to run on a subdomain so that the platform architecture matches our Webflow + Shopify + Next.js split.

### Business Value

- Clean separation between marketing (Webflow), e-commerce (Shopify), and operations (Next.js)
- Reduces Next.js app to only operational pages, simplifying maintenance
- Enables marketing team to update mobilepantry.org without developer involvement
- Professional architecture matching the Sharing Excess model

### Acceptance Criteria

- [x] Public marketing pages (homepage, about, contact) removed from Next.js
- [x] App root (/) redirects to login or supplier dashboard based on auth state
- [x] Navigation updated — no marketing links, just supplier/admin portal links
- [x] Route structure updated from `/donor/` to `/supplier/`
- [ ] Vercel configured for `app.mobilepantry.org` subdomain (manual config needed)
- [ ] CORS and environment variables updated for subdomain (manual config needed)

---

### Task P.4.1: Remove Marketing Pages and Update Routing

**Reason**  
The public marketing site is moving to Webflow. The Next.js app should only contain the supplier portal and ops dashboard.

**Goal**  
Remove marketing pages and update the routing structure.

**Technical Requirements**

- Delete pages:
  - `pages/index.tsx` (homepage)
  - `pages/about.tsx`
  - `pages/contact.tsx`
- Create new `pages/index.tsx` that:
  - If authenticated → redirect to `/supplier/dashboard` (or `/admin` if admin)
  - If not authenticated → redirect to `/auth/login`
- Update route structure (rename `/donor/` → `/supplier/`):
  - `pages/supplier/dashboard.tsx`
  - `pages/supplier/alert.tsx` (was `request.tsx`)
  - `pages/supplier/alert/[id].tsx` (was `request/[id].tsx`)
  - `pages/supplier/history.tsx`
  - `pages/supplier/settings.tsx`
- Update admin routes:
  - `pages/admin/suppliers/index.tsx` (was `donors/index.tsx`)
  - `pages/admin/suppliers/[id].tsx` (was `donors/[id].tsx`)
- Add redirects in `next.config.js` for old routes:
  ```javascript
  async redirects() {
    return [
      { source: '/donor/:path*', destination: '/supplier/:path*', permanent: true },
      { source: '/admin/donors/:path*', destination: '/admin/suppliers/:path*', permanent: true },
    ];
  }
  ```
- Update all internal `<Link>` hrefs and `router.push()` calls throughout codebase

---

### Task P.4.2: Update App Shell and Navigation

**Reason**  
The Header and Footer components reference marketing pages and use donor-centric language.

**Goal**  
Update the app shell to reflect the operational app context.

**Technical Requirements**

- Update `components/layout/Header.tsx`:
  - Remove marketing nav links (Home, About, Contact)
  - Logged-out state: Show only MobilePantry logo + "Log In" / "Sign Up" buttons
  - Supplier logged-in state:
    - Logo (links to `/supplier/dashboard`)
    - "Dashboard" link
    - "Submit Alert" link
    - "History" link
    - User dropdown: Settings, Log Out
  - Admin logged-in state:
    - Logo (links to `/admin`)
    - "Dashboard" link
    - "Alerts" link
    - "Suppliers" link
    - User dropdown: Settings, Log Out
  - Mobile hamburger menu with same structure
- Update `components/layout/Footer.tsx`:
  - Remove marketing links
  - Simplified footer: "© 2026 MobilePantry · Driving to End Hunger"
  - Link to mobilepantry.org (external, opens Webflow site)
  - Link to shop.mobilepantry.org (external, opens Shopify store)
- Update `components/layout/Layout.tsx` if it references removed pages

---

### Task P.4.3: Configure Subdomain and Environment

**Reason**  
The app needs to run on `app.mobilepantry.org` as a subdomain while Webflow handles the root domain.

**Goal**  
Configure Vercel deployment for subdomain and update all environment references.

**Technical Requirements**

- In Vercel dashboard:
  - Add custom domain: `app.mobilepantry.org`
  - Configure DNS: CNAME record pointing `app` to `cname.vercel-dns.com`
  - Verify SSL certificate auto-provisioned
- In Webflow:
  - Configure DNS: A record for `mobilepantry.org` pointing to Webflow
  - Add CNAME for `www` pointing to Webflow
- Update environment variables in Vercel:
  - `NEXT_PUBLIC_APP_URL=https://app.mobilepantry.org`
  - Verify Firebase Auth authorized domains includes `app.mobilepantry.org`
- Update Firebase console:
  - Add `app.mobilepantry.org` to authorized domains in Authentication settings
- Update Slack notification dashboard link to use new subdomain
- Update `next.config.js` with any needed CORS or headers for cross-subdomain requests
- Document DNS configuration in `docs/DNS_SETUP.md`

---

# Story P.5: Polish & Launch Prep

### Story Description

As a development team, we need to verify the pivoted application works end-to-end, is mobile responsive, handles errors gracefully, and is ready for pilot launch with initial suppliers.

### Business Value

- Ensures reliability for pilot launch with real suppliers
- Mobile responsiveness is critical — suppliers may submit alerts from warehouse floors on phones
- Error handling prevents data loss and builds supplier trust
- Testing checklist provides confidence for launch day

### Acceptance Criteria

- [x] All pages mobile responsive (tested on 375px, 768px, 1024px breakpoints)
- [x] Error states and loading states present on all data-fetching pages
- [x] SEO meta tags updated for app.mobilepantry.org
- [x] Manual testing checklist covers full supplier and admin flows
- [ ] Production environment verified with real subdomain (manual verification needed)
- [x] Launch day checklist created

---

### Task P.5.1: Mobile Responsiveness Audit

**Reason**  
Suppliers will often submit surplus alerts from warehouse floors or loading docks using their phones.

**Goal**  
Verify and fix mobile responsiveness across all pages.

**Technical Requirements**

- Test all pages at three breakpoints: 375px (phone), 768px (tablet), 1024px (desktop)
- Pages to audit:
  - Auth: Login, Signup, Forgot Password, Complete Profile
  - Supplier: Dashboard, Alert Form, Alert Detail, History, Settings
  - Admin: Dashboard, Alerts List, Alert Detail, Suppliers List, Supplier Detail
- Key mobile UX checks:
  - Surplus alert form is completable on mobile without horizontal scrolling
  - Multi-select produce categories are touch-friendly
  - Tables switch to card view on mobile
  - Status filter tabs are scrollable on mobile
  - Touch targets are ≥44px
- Fix any layout issues found

---

### Task P.5.2: Error Handling and Loading States

**Reason**  
Network errors on warehouse floors (poor connectivity) must not lose supplier data.

**Goal**  
Add comprehensive error handling and loading states.

**Technical Requirements**

- Loading states:
  - Skeleton loaders on dashboard, history, and admin pages while data fetches
  - Spinner on form submit buttons
  - Disabled state on buttons during submission
- Error handling:
  - Surplus alert form: Save form state to sessionStorage so data isn't lost on network error
  - Retry logic on API calls (1 retry with 2s delay)
  - User-friendly error messages: "Unable to submit alert. Please check your connection and try again."
  - Toast notifications for success/error states
- Empty states:
  - Dashboard with no alerts: "No surplus alerts yet. Submit your first alert to get started."
  - History with no completed alerts: "No completed rescues yet."
  - Admin with no pending alerts: "All caught up! No pending surplus alerts."

---

### Task P.5.3: SEO and Meta Tags

**Reason**  
The app needs proper meta tags for the new subdomain and pivoted branding.

**Goal**  
Update all meta tags and SEO configuration.

**Technical Requirements**

- Update `pages/_app.tsx` or `pages/_document.tsx` default meta:
  - Title: "MobilePantry | Supplier Portal"
  - Description: "Manage your surplus produce alerts and track rescues with MobilePantry."
  - OG image: MobilePantry branded social image
- Per-page titles:
  - Login: "Log In | MobilePantry"
  - Signup: "Create Supplier Account | MobilePantry"
  - Dashboard: "Dashboard | MobilePantry"
  - Submit Alert: "Submit Surplus Alert | MobilePantry"
  - Admin: "Ops Dashboard | MobilePantry"
- Add `robots.txt` — allow indexing of auth pages, noindex supplier/admin pages
- Add canonical URLs pointing to `app.mobilepantry.org`
- Favicon and app icon updated if needed

---

### Task P.5.4: Testing Checklist and Launch Day Runbook

**Reason**  
Need systematic verification before going live with real suppliers.

**Goal**  
Create manual testing checklist and launch day runbook.

**Technical Requirements**

- Create `docs/TESTING_CHECKLIST.md`:
  - **Supplier Flow:**
    - [ ] Create account (email)
    - [ ] Create account (Google OAuth)
    - [ ] Complete profile
    - [ ] Submit ad-hoc surplus alert
    - [ ] Submit standing surplus alert
    - [ ] View alert detail and status updates
    - [ ] View dashboard metrics
    - [ ] View alert history with filters
    - [ ] Update settings / business profile
    - [ ] Receive status change (confirm in another browser as admin)
  - **Admin Flow:**
    - [ ] Login as admin
    - [ ] View dashboard metrics
    - [ ] Confirm a pending alert
    - [ ] Mark alert as picked up
    - [ ] Complete alert with weight, temp (≤41°F), and grade
    - [ ] Complete alert with temp >41°F (verify warning)
    - [ ] Cancel an alert with reason
    - [ ] View supplier list and detail
    - [ ] Receive Slack notification on new alert
  - **Mobile:**
    - [ ] Complete supplier signup on mobile
    - [ ] Submit surplus alert on mobile
    - [ ] Admin confirm and complete on mobile
  - **Edge Cases:**
    - [ ] Submit alert with only required fields
    - [ ] Submit alert with all fields
    - [ ] Network error during submission (verify data not lost)
    - [ ] Unauthorized access to admin pages
    - [ ] Unauthorized access to other supplier's data
- Create `docs/LAUNCH_CHECKLIST.md`:
  - **Pre-launch (day before):**
    - [ ] All testing checklist items pass
    - [ ] DNS configured: app.mobilepantry.org → Vercel
    - [ ] DNS configured: mobilepantry.org → Webflow
    - [ ] Firebase authorized domains updated
    - [ ] Slack webhook verified
    - [ ] Production env vars set in Vercel
  - **Launch morning:**
    - [ ] Verify app.mobilepantry.org loads with SSL
    - [ ] Test supplier signup flow end-to-end
    - [ ] Test surplus alert submission
    - [ ] Verify Slack notification received
    - [ ] Test admin flow: confirm → pick up → complete
    - [ ] Verify mobilepantry.org (Webflow) loads
  - **Post-launch:**
    - [ ] Monitor for errors
    - [ ] Onboard first pilot supplier(s)
    - [ ] Team available for issues via Slack

---

# Backlog (Post-Pivot Launch)

These stories are documented for future planning but not scheduled for this sprint.

## Story B.1: Shopify Integration

**Description:** As the operations team, we need the Shopify subscription store connected to the platform so that box packing and delivery data flows between systems.

**Acceptance Criteria:**

- Shopify store configured at shop.mobilepantry.org
- Subscription product created ($7/week, $28/month)
- Free box promo code system for community partners
- Order data visible in ops dashboard (stretch)

---

## Story B.2: Standing Pickup Automation

**Description:** As a supplier with a standing weekly pickup, I want the system to automatically generate weekly surplus alerts so that I don't have to submit them manually each week.

**Acceptance Criteria:**

- Suppliers can set up recurring alerts (same day/time each week)
- System auto-generates alerts on schedule
- Supplier can pause, modify, or cancel the standing pickup
- Admin sees standing pickups flagged differently from ad-hoc

---

## Story B.3: Supplier Onboarding Automation

**Description:** As the operations team, we need to track the 4-week pilot onboarding process for new suppliers in the platform.

**Acceptance Criteria:**

- Onboarding stage tracking: Outreach → Discovery Visit → Pilot → Formalized
- MOU document management
- Impact report generation after pilot (lbs rescued, meals equivalent, tax deduction estimate)

---

## Story B.4: Public Impact Dashboard

**Description:** As a funder or partner, I want to see MobilePantry's impact data so that I can evaluate their effectiveness.

**Acceptance Criteria:**

- Public page showing aggregated stats
- Charts showing trends over time (lbs rescued, suppliers active, boxes packed)
- Embeddable widget for partners

---

_— End of Pivot Sprint Epic —_
