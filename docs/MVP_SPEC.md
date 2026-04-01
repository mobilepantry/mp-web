# MobilePantry Product Specification — Produce Rescue Platform

**Version:** 2.0 (Post-Pivot) | **Target Launch:** March 15, 2026
**Development Team:** 2-4 CS Students

---

## 1. Overview

### Product Vision

MobilePantry is a produce rescue nonprofit connecting Columbus-area produce distributors, farms, and grocery stores with MobilePantry's operations team. The platform rescues cosmetically imperfect surplus produce, packs subscription boxes, and delivers to paying customers and community partners.

The web application (app.mobilepantry.org) serves as the operational hub — a supplier portal for produce sources and an ops dashboard for the MobilePantry team.

### Platform Scope

- **Supplier Portal:** Produce distributors and farms alert MobilePantry of available surplus and schedule pickups
- **Ops Dashboard:** MobilePantry team manages surplus alerts, confirms pickups, logs weights/temps, tracks supplier relationships
- **Slack Notifications:** Team receives structured alerts on new surplus submissions

### Architecture

```
mobilepantry.org            → Webflow (marketing, story, blog, email capture)
shop.mobilepantry.org       → Shopify (subscription boxes, free box promo codes)
app.mobilepantry.org        → Next.js on Vercel (supplier portal + ops dashboard)
```

### Explicitly Out of Scope (handled externally)

- Public marketing site (Webflow)
- E-commerce / subscription management (Shopify)
- Volunteer coordination and rescue claiming
- Mobile app
- Popup event management
- Recipient/agency portal
- Automated email notifications (post-launch)
- Route optimization

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (Pages Router) | React-based, file routing |
| Styling | Tailwind CSS | Utility-first, fast development |
| UI Components | shadcn/ui | Accessible, copy-paste components |
| Database | Firebase Firestore | NoSQL, real-time, generous free tier |
| Authentication | Firebase Auth | Email/password + Google OAuth |
| Hosting | Vercel | Subdomain: app.mobilepantry.org |
| Notifications | Slack Webhooks | Structured surplus alert notifications |
| Marketing | Webflow | mobilepantry.org |
| E-commerce | Shopify | shop.mobilepantry.org |

---

## 3. Users & Roles

| Role | Description | Auth |
|------|-------------|------|
| Supplier | Produce distributor/farm submitting surplus alerts | Email/password or Google |
| Admin | MobilePantry ops team (2 people) | Email/password only |

> **Note:** One account = one business. Suppliers specify pickup address on each alert, so multi-location businesses can use a single account and enter different addresses as needed.

---

## 4. User Stories

### 4.1 Supplier

- As a supplier, I can create an account quickly (Google OAuth or email).
- As a supplier, I can submit a surplus alert with produce-specific details (category, weight, case count, grade).
- As a supplier, I can choose between a one-time (ad-hoc) alert or a standing weekly pickup.
- As a supplier, I can see the status of my pending alerts (pending → confirmed → picked up → completed).
- As a supplier, I can view my alert history and total impact (lbs rescued).
- As a supplier, I can update my business/contact information.

### 4.2 Admin (Ops Team)

- As an admin, I receive a Slack notification when a new surplus alert is submitted.
- As an admin, I can view all incoming surplus alerts with produce details.
- As an admin, I can update alert status through the full workflow (pending → confirmed → picked up → completed).
- As an admin, I can log actual weight, temperature at pickup, and produce grade on completion.
- As an admin, I can see temperature compliance warnings (>41°F per cold chain SOP).
- As an admin, I can view and manage all suppliers with per-supplier stats.
- As an admin, I can see dashboard metrics (lbs rescued, active suppliers, avg temp, pending alerts).

---

## 5. Data Model

### 5.1 Suppliers Collection (Firestore: `donors`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated |
| `email` | string | Required, unique |
| `businessName` | string | Required (e.g., "DNO Produce") |
| `contactName` | string | Required |
| `phone` | string | Required |
| `businessAddress` | object | street, city, state, zip |
| `businessType` | string | distributor, wholesale, farm, grocery, restaurant, processor, other |
| `userId` | string | Firebase Auth UID |
| `createdAt` | timestamp | Auto-set on creation |
| `updatedAt` | timestamp | Auto-set on update |

### 5.2 Surplus Alerts Collection (Firestore: `pickupRequests`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated |
| `supplierId` | string | Reference to supplier |
| `status` | string | pending \| confirmed \| picked-up \| completed \| cancelled |
| `produceDescription` | string | What produce is available |
| `produceCategory` | string[] | Multi-select: fruits, vegetables, leafy-greens, root-vegetables, herbs, mixed, other |
| `estimatedWeightLbs` | number | Supplier estimate in lbs |
| `estimatedCaseCount` | number? | Optional — not all suppliers think in cases |
| `produceGrade` | string? | A, B, or C (supplier estimate, optional) |
| `alertType` | string | ad-hoc \| standing |
| `pickupAddress` | object | street, city, state, zip |
| `pickupDate` | string | ISO date |
| `pickupTimeWindow` | string | morning \| afternoon \| evening |
| `contactOnArrival` | string | How to reach supplier on arrival |
| `specialInstructions` | string? | Optional notes |
| `actualWeightLbs` | number? | Logged by admin after pickup |
| `temperatureAtPickup` | number? | °F — must be ≤41°F per SOP |
| `actualGrade` | string? | A, B, or C (logged by admin) |
| `createdAt` | timestamp | Auto-set on creation |
| `updatedAt` | timestamp | Auto-set on update |

### 5.3 Impact Metrics (Computed)

| Metric | Calculation |
|--------|-------------|
| Total Pounds Rescued | Sum of `actualWeightLbs` for completed alerts |
| Total Meals Provided | Total Pounds / 1.2 (industry standard) |
| Total Rescues | Count of completed alerts |
| Active Suppliers | Count of suppliers with 1+ alert in last 30 days |
| Avg Pickup Temperature | Average `temperatureAtPickup` for completed alerts |
| Cold Chain Compliance Rate | % of pickups with temp ≤41°F |

---

## 6. Surplus Alert Form

This is the core supplier experience. The form should be mobile-friendly and completable in under 3 minutes.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| What produce is available? | Textarea | Yes | Description + quantity |
| Produce category | Multi-select checkboxes | Yes | At least one category |
| Estimated weight (lbs) | Number | Yes | Min 1 |
| Estimated case count | Number | No | "If applicable" |
| Produce grade | Select | No | A/B/C/Not sure |
| Alert type | Radio | Yes | Ad-hoc (default) or Standing weekly |
| Pickup address | Address fields | Yes | Pre-fill from profile |
| Pickup date | Date picker | Yes | Default to today |
| Pickup time window | Select | Yes | Morning / Afternoon / Evening |
| Contact on arrival | Text | Yes | Phone, ask for X, etc. |
| Special instructions | Textarea | No | Loading dock, bring bins, etc. |

---

## 7. Page Structure

### 7.1 Auth Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | Login (email/password + Google OAuth) |
| `/auth/signup` | Supplier registration |
| `/auth/forgot-password` | Password reset flow |
| `/auth/complete-profile` | Finish supplier profile setup |

### 7.2 Supplier Portal

| Route | Description |
|-------|-------------|
| `/supplier/dashboard` | Overview: pending alerts, impact stats, recent activity |
| `/supplier/alert` | New surplus alert form |
| `/supplier/alert/[id]` | View specific alert details and status |
| `/supplier/history` | All past alerts with status filters |
| `/supplier/settings` | Edit business profile, change password |

### 7.3 Ops Dashboard (Admin)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard: metrics, pending alerts, recent activity |
| `/admin/requests` | All surplus alerts, filter by status |
| `/admin/requests/[id]` | View/edit alert, update status, log weight/temp/grade |
| `/admin/suppliers` | List all suppliers with stats |
| `/admin/suppliers/[id]` | Supplier detail + their alert history |

### 7.4 Root

| Route | Description |
|-------|-------------|
| `/` | Redirect: authenticated → dashboard, unauthenticated → login |

---

## 8. Core Flow: Surplus Alert Lifecycle

1. **Supplier submits alert** — Form data saved to Firestore with status = "pending"
2. **Slack notification fires** — Webhook posts formatted surplus alert to #surplus-alerts channel
3. **Ops team reviews** — Admin views in dashboard, coordinates pickup
4. **Admin confirms** — Status updated to "confirmed", supplier sees update
5. **Driver picks up** — Admin marks "picked up"
6. **Team completes rescue** — Admin logs actual weight, temperature (must be ≤41°F), produce grade → status = "completed"
7. **[Future] Thank-you email** — Automated email with impact metrics sent to supplier

### Slack Notification Format

When a supplier submits a surplus alert, the following message is posted to Slack:

```
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

---

## 9. Slack Webhook Setup

1. Go to api.slack.com/apps and create a new app
2. Select "Incoming Webhooks" and enable
3. Click "Add New Webhook to Workspace"
4. Select the #surplus-alerts channel (create it first)
5. Copy the webhook URL
6. Add to your `.env.local` file as `SLACK_WEBHOOK_URL`

The webhook is called from a Next.js API route when a surplus alert is submitted.

---

## 10. Development Timeline

### Pivot Sprint (Mar 2–12, 2026)

| Story | Focus | Tasks |
|-------|-------|-------|
| P.1 | Data Model & Schema Updates | 3 |
| P.2 | Supplier Portal Rebrand | 4 |
| P.3 | Ops Dashboard Updates | 3 |
| P.4 | App Shell, Routing & Subdomain Config | 3 |
| P.5 | Polish & Launch Prep | 4 |
| **Total** | | **17 tasks** |

**Target:** Pivot live by March 15, 2026

---

## 11. Future Considerations (Post-Launch Backlog)

- **Shopify integration** — Subscription box management, order data in ops dashboard
- **Standing pickup automation** — Auto-generate weekly alerts for recurring suppliers
- **Supplier onboarding automation** — Track pilot stages: Outreach → Discovery → Pilot → Formalized
- **Public impact dashboard** — Embeddable stats for funders and partners
- **Automated thank-you emails** — Send impact report after completed rescue
- **Volunteer coordination** — Mobile app for volunteers to claim rescues
- **Route optimization** — Efficient pickup routing for multiple rescues
- **Recipient portal** — Community partners view incoming deliveries

---

## 12. Admin Access (MVP Approach)

For launch with 2 admins, use a simple allowlist approach:

1. Store admin emails in environment variable: `ADMIN_EMAILS`
2. When user logs in, check if their email is in the allowlist
3. If yes, show admin navigation and allow access to `/admin` routes
4. Protect API routes with same check

---

*— End of Specification —*
