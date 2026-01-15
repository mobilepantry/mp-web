# MobilePantry MVP Product Specification

**Version:** 1.0 | **Target Launch:** March 2026  
**Development Team:** 2-4 CS Students

---

## 1. Overview

### Product Vision

MobilePantry is a food rescue nonprofit connecting Columbus businesses with surplus food to community organizations in need. The MVP is a web application that makes it as frictionless as possible for food donors to coordinate pickup requests with the MobilePantry team.

### MVP Scope

- Public-facing marketing website
- Donor accounts with simple signup/login
- Frictionless pickup request form
- Slack notifications to team on new requests
- Admin dashboard for managing requests

### Explicitly Out of Scope

- Volunteer coordination and rescue claiming
- Mobile app
- Popup event management
- Recipient/agency portal
- Automated email notifications (post-MVP)
- Route optimization

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 14 (Pages Router) | React-based, file routing, SSG for SEO |
| Styling | Tailwind CSS | Utility-first, fast development |
| UI Components | shadcn/ui | Accessible, copy-paste components |
| Database | Firebase Firestore | NoSQL, real-time, generous free tier |
| Authentication | Firebase Auth | Email/password + Google OAuth |
| Hosting | Vercel | Free tier, seamless Next.js deploy |
| Notifications | Slack Webhooks | Free, instant team alerts |

---

## 3. Users & Roles

| Role | Description | Auth |
|------|-------------|------|
| Visitor | Anyone viewing public marketing pages | None |
| Donor | Business requesting food pickups | Email/password or Google |
| Admin | MobilePantry team (2 people) | Email/password only |

> **Note:** One account = one business. Donors specify pickup address on each request, so multi-location businesses can use a single account and enter different addresses as needed.

---

## 4. User Stories

### 4.1 Visitor (Public Website)

- As a visitor, I can learn about MobilePantry's mission so I understand what the organization does.
- As a visitor, I can see impact stats (pounds rescued, meals provided) to understand the organization's reach.
- As a visitor, I can navigate to donor signup if I want to donate food.
- As a visitor, I can find contact information.

### 4.2 Donor

- As a donor, I can create an account quickly (Google OAuth or email).
- As a donor, I can submit a pickup request with minimal friction.
- As a donor, I can see the status of my pending requests.
- As a donor, I can view my donation history and total impact.
- As a donor, I can update my business/contact information.

### 4.3 Admin

- As an admin, I receive a Slack notification when a new request is submitted.
- As an admin, I can view all incoming pickup requests.
- As an admin, I can update request status (pending, confirmed, completed, cancelled).
- As an admin, I can log the actual weight after completing a pickup.
- As an admin, I can view and manage all donors.
- As an admin, I can see dashboard metrics (total pounds, active donors, etc.).

---

## 5. Data Model

### 5.1 Donors Collection

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated |
| `email` | string | Required, unique |
| `businessName` | string | Required |
| `contactName` | string | Required |
| `phone` | string | Required |
| `address` | object | street, city, state, zip |
| `businessType` | string | Restaurant, Grocery, Caterer, etc. |
| `createdAt` | timestamp | Auto-set on creation |

### 5.2 Pickup Requests Collection

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated |
| `donorId` | string | Reference to donor |
| `status` | string | pending \| confirmed \| completed \| cancelled |
| `foodDescription` | string | What food is available |
| `estimatedWeight` | number | Donor estimate in lbs |
| `pickupAddress` | object | street, city, state, zip |
| `pickupDate` | date | Requested pickup date |
| `pickupTimeWindow` | string | morning \| afternoon \| evening |
| `contactOnArrival` | string | How to reach donor on arrival |
| `specialInstructions` | string | Optional notes |
| `actualWeight` | number | Logged by admin after pickup |
| `confirmedAt` | timestamp | When team confirmed |
| `completedAt` | timestamp | When pickup completed |
| `createdAt` | timestamp | Auto-set on creation |

### 5.3 Impact Metrics (Computed)

| Metric | Calculation |
|--------|-------------|
| Total Pounds Rescued | Sum of actualWeight for completed pickups |
| Total Meals Provided | Total Pounds / 1.2 (industry standard) |
| Total Rescues | Count of completed pickups |
| Active Donors | Count of donors with 1+ completed pickup |

---

## 6. Pickup Request Form

This is the core donor experience. The form should be mobile-friendly and completable in under 2 minutes.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| What food do you have? | Textarea | Yes | Description + quantity |
| Estimated amount (lbs) | Number | Yes | Numeric input |
| Pickup address | Address fields | Yes | Pre-fill from account |
| Pickup date | Date picker | Yes | Default to today |
| Pickup time window | Select | Yes | Morning / Afternoon / Evening |
| Best way to contact on arrival | Text | Yes | Phone, ask for X, etc. |
| Special instructions | Textarea | No | Loading dock, buzzer, etc. |

---

## 7. Page Structure

### 7.1 Public Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage - mission, impact stats, CTAs |
| `/about` | About page - story, team, mission details |
| `/contact` | Contact form, email, phone |

### 7.2 Auth Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | Login (email/password + Google OAuth) |
| `/auth/signup` | Donor registration |
| `/auth/forgot-password` | Password reset flow |

### 7.3 Donor Portal

| Route | Description |
|-------|-------------|
| `/donor/dashboard` | Overview: recent requests, impact stats |
| `/donor/request` | New pickup request form |
| `/donor/request/[id]` | View specific request details |
| `/donor/history` | All past donations |
| `/donor/settings` | Edit profile, change password |

### 7.4 Admin Dashboard

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard: metrics, recent activity |
| `/admin/requests` | All requests, filter by status |
| `/admin/requests/[id]` | View/edit request, update status, log weight |
| `/admin/donors` | List all donors |
| `/admin/donors/[id]` | Donor detail + their donation history |

---

## 8. Core Flow: Pickup Request Lifecycle

1. **Donor submits request** - Form data saved to Firestore with status = "pending"
2. **Slack notification fires** - Webhook posts formatted message to #pickup-requests channel
3. **Team reviews request** - Admin views in dashboard, coordinates pickup
4. **Admin confirms** - Status updated to "confirmed", donor sees update
5. **Team completes pickup** - Admin logs actual weight, status = "completed"
6. **[Future] Thank-you email** - Automated email with impact metrics sent to donor

### Slack Notification Format

When a donor submits a request, the following message is posted to your Slack channel:

```
🚨 New Pickup Request

Business: Joe's Deli
Contact: Joe Smith
Address: 123 Main St, Columbus OH
Food: ~50 lbs sandwiches, salads
Pickup: Tomorrow, Afternoon
Contact on arrival: Call 614-555-1234

→ View in dashboard: [link]
```

---

## 9. Slack Webhook Setup

1. Go to api.slack.com/apps and create a new app
2. Select "Incoming Webhooks" and enable
3. Click "Add New Webhook to Workspace"
4. Select the #pickup-requests channel (create it first)
5. Copy the webhook URL
6. Add to your `.env.local` file as `SLACK_WEBHOOK_URL`

The webhook is called from a Next.js API route when a pickup request is submitted.

---

## 10. Development Timeline

Assuming 2-4 developers working 10-15 hours/week each:

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 1 | Week 1-2 | Project setup, auth flow, database schema, routing |
| 2 | Week 2-3 | Public pages: home, about, contact |
| 3 | Week 3-5 | Donor portal: signup, login, dashboard, request form |
| 4 | Week 5-7 | Admin dashboard: requests, donors, status management |
| 5 | Week 7-8 | Slack integration, metrics, polish |
| 6 | Week 8-9 | Bug fixes, mobile responsiveness, testing |
| 7 | Week 9-10 | Final testing, seed data, production deploy |

**Target:** MVP live by early-to-mid March 2026

---

## 11. Future Considerations (Post-MVP)

These features are out of scope for MVP but worth designing with in mind:

- **Automated thank-you emails** - Send impact report after completed pickup
- **Volunteer coordination** - Mobile app for volunteers to claim rescues
- **Recipient portal** - Agencies can view incoming deliveries
- **Destinations management** - Track where food goes
- **SMS notifications** - Twilio integration for team alerts
- **Public impact dashboard** - Embeddable stats for funders
- **Route optimization** - Efficient pickup routing for multiple rescues
- **Popup event management** - Track community distribution events

---

## 12. Admin Access (MVP Approach)

For MVP with 2 admins, use a simple allowlist approach:

1. Store admin emails in environment variable: `ADMIN_EMAILS`
2. When user logs in, check if their email is in the allowlist
3. If yes, show admin navigation and allow access to `/admin` routes
4. Protect API routes with same check

This avoids needing a separate admin users table or role management system for now. When you need more admins or granular permissions, you can add a proper roles system.

---

*— End of Specification —*