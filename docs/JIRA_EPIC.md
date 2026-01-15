# MobilePantry MVP — Jira Epic Breakdown

**Epic:** MobilePantry MVP Web Application  
**Start Date:** January 15, 2026  
**Target Launch:** March 15, 2026  
**Duration:** 8 weeks (4 two-week sprints)

---

## Sprint Overview

| Sprint | Dates | Focus |
|--------|-------|-------|
| Sprint 1 | Jan 15 - Jan 29 | Foundation: Project setup, auth, database schema |
| Sprint 2 | Jan 29 - Feb 12 | Public site + Donor registration |
| Sprint 3 | Feb 12 - Feb 26 | Donor portal: request form, dashboard, history |
| Sprint 4 | Feb 26 - Mar 12 | Admin dashboard + Slack integration + Polish |
| Launch | Mar 12 - Mar 15 | Final testing, deploy, go-live |

---

# Sprint 1: Foundation (Jan 15 - Jan 29)

## Story 1.1: Project Infrastructure Setup

### Story Description
As a development team, we need to set up the foundational project infrastructure so that we have a consistent development environment and can begin building features.

### Business Value
- Establishes consistent development environment for all team members
- Enables rapid feature development with proper tooling
- Sets up deployment pipeline early to catch issues
- Creates foundation for entire MVP build

### Acceptance Criteria
- [ ] Next.js project initialized with Pages Router
- [ ] Tailwind CSS configured and working
- [ ] shadcn/ui installed with base components
- [ ] Firebase project created with Firestore and Auth enabled
- [ ] Project deployed to Vercel with preview deploys working
- [ ] Repository structure documented in README
- [ ] All team members can run project locally

---

### Task 1.1.1: Initialize Next.js Project with Tailwind

**Reason**  
Need a properly configured Next.js project as the foundation for all development work.

**Goal**  
Create Next.js project with Pages Router, Tailwind CSS, and proper folder structure.

**Technical Requirements**
- Run `npx create-next-app@latest mobilepantry` with options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: Yes
  - App Router: No (use Pages Router)
  - Import alias: @/*
- Create folder structure:
  ```
  src/
  ├── components/
  │   ├── ui/           # shadcn components
  │   ├── layout/       # Header, Footer, Layout
  │   └── common/       # Shared components
  ├── pages/
  │   ├── api/          # API routes
  │   ├── auth/         # Login, signup, forgot-password
  │   ├── donor/        # Donor portal pages
  │   └── admin/        # Admin dashboard pages
  ├── lib/              # Utilities, Firebase config
  ├── hooks/            # Custom React hooks
  ├── styles/           # Global styles
  └── types/            # TypeScript types
  ```
- Configure `tailwind.config.js` with custom colors:
  - Primary green: #2D5A27
  - Secondary colors TBD
- Create `.env.local.example` with required environment variables
- Update `README.md` with setup instructions

---

### Task 1.1.2: Set Up shadcn/ui Component Library

**Reason**  
Need accessible, well-designed UI components to build interfaces quickly.

**Goal**  
Install and configure shadcn/ui with commonly needed components.

**Technical Requirements**
- Run `npx shadcn-ui@latest init`
- Configure for:
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes
- Install initial components:
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add label
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add form
  npx shadcn-ui@latest add select
  npx shadcn-ui@latest add textarea
  npx shadcn-ui@latest add table
  npx shadcn-ui@latest add badge
  npx shadcn-ui@latest add alert
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add dropdown-menu
  npx shadcn-ui@latest add toast
  ```
- Create `components/ui/index.ts` for clean exports
- Verify components render correctly with Tailwind

---

### Task 1.1.3: Configure Firebase Project

**Reason**  
Need Firebase for authentication and database before building any user-facing features.

**Goal**  
Create Firebase project with Firestore and Authentication configured.

**Technical Requirements**
- Create new Firebase project: "mobilepantry-prod"
- Enable services:
  - Firestore Database (start in test mode, will secure later)
  - Authentication with providers:
    - Email/Password
    - Google OAuth
- Create web app in Firebase console
- Install Firebase SDK: `npm install firebase`
- Create `lib/firebase.ts`:
  ```typescript
  import { initializeApp, getApps } from 'firebase/app';
  import { getAuth } from 'firebase/auth';
  import { getFirestore } from 'firebase/firestore';

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  ```
- Add Firebase config values to `.env.local`
- Update `.env.local.example` with variable names (no values)
- Test connection by reading/writing test document

---

### Task 1.1.4: Deploy to Vercel

**Reason**  
Need production deployment pipeline working early to catch deployment issues and enable preview URLs for testing.

**Goal**  
Connect repository to Vercel with automatic preview deploys on PRs.

**Technical Requirements**
- Create Vercel account (if needed)
- Import GitHub repository to Vercel
- Configure environment variables in Vercel dashboard:
  - All `NEXT_PUBLIC_FIREBASE_*` variables
  - `SLACK_WEBHOOK_URL` (can be placeholder for now)
  - `ADMIN_EMAILS` (comma-separated list)
- Verify:
  - Main branch deploys to production URL
  - Pull requests get preview URLs
  - Environment variables are accessible
- Add Vercel deployment badge to README
- Document deployment process in README

---

## Story 1.2: Authentication System

### Story Description
As a development team, we need to implement user authentication so that donors can create accounts and securely access their dashboard.

### Business Value
- Enables personalized donor experience
- Secures donor data and pickup history
- Establishes identity for all platform interactions
- Allows admin access control

### Acceptance Criteria
- [ ] Donors can sign up with email/password
- [ ] Donors can sign up with Google OAuth
- [ ] Donors can log in with existing credentials
- [ ] Donors can reset forgotten passwords
- [ ] Auth state persists across page refreshes
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Admin emails can access admin routes

---

### Task 1.2.1: Create Auth Context and Hooks

**Reason**  
Need centralized auth state management accessible throughout the application.

**Goal**  
Implement React context for Firebase auth with custom hooks.

**Technical Requirements**
- Create `lib/auth-context.tsx`:
  ```typescript
  // Context providing:
  // - user: Firebase User | null
  // - loading: boolean
  // - isAdmin: boolean
  // - signUp: (email, password) => Promise
  // - signIn: (email, password) => Promise
  // - signInWithGoogle: () => Promise
  // - signOut: () => Promise
  // - resetPassword: (email) => Promise
  ```
- Create `hooks/useAuth.ts` for easy context access
- Create `hooks/useRequireAuth.ts` for protected routes:
  - Redirects to `/auth/login` if not authenticated
  - Returns user object if authenticated
- Create `hooks/useRequireAdmin.ts` for admin routes:
  - Checks if user email is in `ADMIN_EMAILS` env var
  - Redirects to `/donor/dashboard` if not admin
- Wrap `_app.tsx` with AuthProvider
- Handle auth state persistence with `onAuthStateChanged`

---

### Task 1.2.2: Build Login Page

**Reason**  
Donors need a way to access their existing accounts.

**Goal**  
Create login page with email/password and Google OAuth options.

**Technical Requirements**
- Create `pages/auth/login.tsx`
- UI Requirements:
  - MobilePantry logo at top
  - Email input field
  - Password input field
  - "Forgot password?" link
  - "Log in" button
  - Divider with "or"
  - "Continue with Google" button
  - "Don't have an account? Sign up" link
- Form validation:
  - Email format validation
  - Password required
  - Display error messages from Firebase
- On successful login:
  - Redirect to `/donor/dashboard`
  - If admin email, offer choice of donor or admin dashboard
- Mobile responsive design
- Loading states on buttons during auth

---

### Task 1.2.3: Build Signup Page

**Reason**  
New donors need to create accounts to request pickups.

**Goal**  
Create signup page that collects donor information and creates account.

**Technical Requirements**
- Create `pages/auth/signup.tsx`
- UI Requirements:
  - MobilePantry logo at top
  - Business name input
  - Contact name input
  - Email input
  - Phone input
  - Password input
  - Confirm password input
  - Business address fields:
    - Street address
    - City
    - State (dropdown, default Ohio)
    - ZIP code
  - Business type dropdown:
    - Restaurant
    - Grocery Store
    - Caterer
    - Bakery
    - Corporate Cafeteria
    - Other
  - "Create Account" button
  - "Continue with Google" button
  - "Already have an account? Log in" link
- Form validation:
  - All required fields filled
  - Email format valid
  - Phone format valid (10 digits)
  - Password minimum 8 characters
  - Passwords match
  - ZIP code format valid
- On successful signup:
  - Create Firebase Auth user
  - Create donor document in Firestore (see Task 1.3.1)
  - Redirect to `/donor/dashboard`
- For Google OAuth signup:
  - After Google auth, redirect to profile completion form if donor document doesn't exist

---

### Task 1.2.4: Build Forgot Password Page

**Reason**  
Donors need ability to recover account access if they forget their password.

**Goal**  
Create password reset flow using Firebase Auth.

**Technical Requirements**
- Create `pages/auth/forgot-password.tsx`
- UI Requirements:
  - MobilePantry logo
  - Explanatory text
  - Email input
  - "Send Reset Link" button
  - "Back to login" link
- On submit:
  - Call Firebase `sendPasswordResetEmail`
  - Show success message: "Check your email for reset link"
  - Handle errors (user not found, etc.)
- Mobile responsive

---

## Story 1.3: Database Schema Implementation

### Story Description
As a development team, we need to implement the Firestore database schema so that we have a structured way to store and retrieve donor and pickup request data.

### Business Value
- Establishes data structure for all application features
- Enables consistent data access patterns
- Supports future reporting and analytics needs
- Provides foundation for donor history and impact tracking

### Acceptance Criteria
- [ ] Donors collection created with defined schema
- [ ] Pickup requests collection created with defined schema
- [ ] TypeScript types match Firestore schema
- [ ] Helper functions exist for common database operations
- [ ] Firestore security rules protect data appropriately

---

### Task 1.3.1: Define TypeScript Types and Firestore Schema

**Reason**  
Need strongly-typed data structures to prevent bugs and enable autocomplete.

**Goal**  
Create TypeScript types that match our data model.

**Technical Requirements**
- Create `types/index.ts`:
  ```typescript
  export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
  }

  export interface Donor {
    id: string;
    email: string;
    businessName: string;
    contactName: string;
    phone: string;
    address: Address;
    businessType: 'restaurant' | 'grocery' | 'caterer' | 'bakery' | 'corporate' | 'other';
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export type PickupStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
  export type TimeWindow = 'morning' | 'afternoon' | 'evening';

  export interface PickupRequest {
    id: string;
    donorId: string;
    status: PickupStatus;
    foodDescription: string;
    estimatedWeight: number;
    pickupAddress: Address;
    pickupDate: Timestamp;
    pickupTimeWindow: TimeWindow;
    contactOnArrival: string;
    specialInstructions?: string;
    actualWeight?: number;
    confirmedAt?: Timestamp;
    completedAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  // For creating new records (omit auto-generated fields)
  export type CreateDonorInput = Omit<Donor, 'id' | 'createdAt' | 'updatedAt'>;
  export type CreatePickupInput = Omit<PickupRequest, 'id' | 'status' | 'confirmedAt' | 'completedAt' | 'createdAt' | 'updatedAt'>;
  ```

---

### Task 1.3.2: Create Database Helper Functions

**Reason**  
Need reusable functions for common database operations to keep code DRY.

**Goal**  
Create helper functions for CRUD operations on donors and pickup requests.

**Technical Requirements**
- Create `lib/db/donors.ts`:
  ```typescript
  // Functions:
  // - createDonor(userId: string, data: CreateDonorInput): Promise<Donor>
  // - getDonor(donorId: string): Promise<Donor | null>
  // - getDonorByEmail(email: string): Promise<Donor | null>
  // - updateDonor(donorId: string, data: Partial<Donor>): Promise<void>
  // - getAllDonors(): Promise<Donor[]>
  ```
- Create `lib/db/pickups.ts`:
  ```typescript
  // Functions:
  // - createPickupRequest(data: CreatePickupInput): Promise<PickupRequest>
  // - getPickupRequest(requestId: string): Promise<PickupRequest | null>
  // - getPickupRequestsByDonor(donorId: string): Promise<PickupRequest[]>
  // - getAllPickupRequests(status?: PickupStatus): Promise<PickupRequest[]>
  // - updatePickupRequest(requestId: string, data: Partial<PickupRequest>): Promise<void>
  // - getPendingPickupRequests(): Promise<PickupRequest[]>
  ```
- Create `lib/db/stats.ts`:
  ```typescript
  // Functions:
  // - getTotalPoundsRescued(): Promise<number>
  // - getTotalRescues(): Promise<number>
  // - getActiveDonorsCount(): Promise<number>
  // - getDonorStats(donorId: string): Promise<{ totalPounds: number, totalRescues: number }>
  ```
- Use Firestore Timestamp for all date fields
- Handle errors appropriately with try/catch
- Add JSDoc comments for all functions

---

### Task 1.3.3: Configure Firestore Security Rules

**Reason**  
Need to secure database so users can only access appropriate data.

**Goal**  
Write Firestore security rules that protect donor and pickup data.

**Technical Requirements**
- Create `firestore.rules`:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Helper functions
      function isAuthenticated() {
        return request.auth != null;
      }
      
      function isOwner(donorId) {
        return isAuthenticated() && request.auth.uid == donorId;
      }
      
      function isAdmin() {
        return isAuthenticated() && 
          request.auth.token.email in ['admin1@mobilepantry.org', 'admin2@mobilepantry.org'];
      }
      
      // Donors collection
      match /donors/{donorId} {
        allow read: if isOwner(donorId) || isAdmin();
        allow create: if isAuthenticated() && request.auth.uid == donorId;
        allow update: if isOwner(donorId) || isAdmin();
        allow delete: if isAdmin();
      }
      
      // Pickup requests collection
      match /pickupRequests/{requestId} {
        allow read: if isAuthenticated() && 
          (resource.data.donorId == request.auth.uid || isAdmin());
        allow create: if isAuthenticated();
        allow update: if isAdmin() || 
          (resource.data.donorId == request.auth.uid && 
           resource.data.status == 'pending');
        allow delete: if isAdmin();
      }
    }
  }
  ```
- Deploy rules: `firebase deploy --only firestore:rules`
- Test rules with Firebase emulator
- Document any admin email updates needed in rules

---

# Sprint 2: Public Site + Donor Registration (Jan 29 - Feb 12)

## Story 2.1: Public Marketing Website

### Story Description
As a development team, we need to build the public-facing marketing pages so that visitors can learn about MobilePantry and be encouraged to become donors.

### Business Value
- Creates first impression for potential donors
- Communicates mission and impact clearly
- Provides SEO foundation for organic discovery
- Establishes credibility and trust

### Acceptance Criteria
- [ ] Homepage displays mission, impact stats, and clear CTAs
- [ ] About page tells MobilePantry's story
- [ ] Contact page provides ways to reach the team
- [ ] All pages are mobile responsive
- [ ] Navigation is consistent across pages
- [ ] Impact stats pull from database (or show placeholder if no data)

---

### Task 2.1.1: Create Shared Layout Component

**Reason**  
Need consistent header, footer, and navigation across all pages.

**Goal**  
Build layout component with responsive navigation.

**Technical Requirements**
- Create `components/layout/Header.tsx`:
  - MobilePantry logo (link to home)
  - Navigation links: Home, About, Contact
  - "Become a Donor" button (links to signup)
  - "Login" link (if not authenticated)
  - User dropdown (if authenticated):
    - Donor Dashboard
    - Admin Dashboard (if admin)
    - Logout
  - Mobile hamburger menu
- Create `components/layout/Footer.tsx`:
  - MobilePantry logo
  - Contact info (email, phone)
  - Social links (placeholders for now)
  - Copyright notice
  - Links: About, Contact, Privacy Policy
- Create `components/layout/Layout.tsx`:
  - Wraps children with Header and Footer
  - Optional `hideNav` prop for auth pages
- Apply Layout in `_app.tsx` or per-page

---

### Task 2.1.2: Build Homepage

**Reason**  
Homepage is the primary entry point and must communicate value proposition quickly.

**Goal**  
Create compelling homepage with mission, impact, and clear calls-to-action.

**Technical Requirements**
- Create `pages/index.tsx`
- Sections:
  1. **Hero Section**
     - Headline: "Rescuing Food, Feeding Columbus"
     - Subheadline: Brief mission statement
     - CTA buttons: "Donate Food" (→ signup) and "Learn More" (→ about)
     - Background image or gradient
  2. **Impact Stats** (3-4 cards)
     - Total pounds rescued
     - Meals provided (pounds / 1.2)
     - Active donors
     - (Optional) CO2 prevented
     - Pull from database or show "Coming soon" if no data
  3. **How It Works** (3 steps)
     - Step 1: Sign up as a donor
     - Step 2: Request a pickup when you have surplus
     - Step 3: We pick it up and deliver to those in need
  4. **Call to Action**
     - "Ready to reduce waste and fight hunger?"
     - "Become a Donor" button
  5. **Contact teaser**
     - "Questions? Get in touch"
     - Link to contact page
- Mobile responsive (stack sections on mobile)
- Use Next.js `getStaticProps` for impact stats (revalidate every hour)

---

### Task 2.1.3: Build About Page

**Reason**  
Donors want to understand who they're partnering with and why the mission matters.

**Goal**  
Create about page that tells MobilePantry's story and mission.

**Technical Requirements**
- Create `pages/about.tsx`
- Sections:
  1. **Mission Statement**
     - Clear articulation of what MobilePantry does
     - The problem: food waste + food insecurity in Columbus
  2. **How We Work**
     - Dual-channel model explanation
     - Supplier → Pantry delivery
     - Weekend popup distributions (future)
  3. **Our Story** (placeholder for now)
     - Founded by OSU students
     - Partnership goals
  4. **The Team** (optional for MVP)
     - Photos and bios (can be placeholder)
  5. **Partners** (placeholder)
     - "Coming soon" or logos of target partners
- Mobile responsive
- SEO meta tags

---

### Task 2.1.4: Build Contact Page

**Reason**  
Visitors need a way to reach MobilePantry with questions or partnership inquiries.

**Goal**  
Create contact page with form and direct contact info.

**Technical Requirements**
- Create `pages/contact.tsx`
- Contact form fields:
  - Name (required)
  - Email (required)
  - Subject dropdown:
    - General Inquiry
    - Become a Donor
    - Partnership Opportunity
    - Volunteer Interest
    - Other
  - Message (required, textarea)
  - Submit button
- On submit:
  - Send notification to team (can use same Slack webhook)
  - Show success message
  - Clear form
- Also display:
  - Email address
  - Phone number (if available)
  - Location: "Serving Columbus, Ohio"
- Mobile responsive

---

## Story 2.2: Donor Onboarding Polish

### Story Description
As a development team, we need to polish the donor signup flow and ensure smooth onboarding so that new donors have a great first experience.

### Business Value
- Reduces friction in donor acquisition
- Creates positive first impression
- Ensures donor data is complete for operations
- Sets up donors for successful first pickup request

### Acceptance Criteria
- [ ] Signup flow is smooth and intuitive
- [ ] Google OAuth users complete profile on first login
- [ ] Form validation provides helpful error messages
- [ ] Success states guide users to next steps
- [ ] Email verification sent (optional for MVP)

---

### Task 2.2.1: Build Google OAuth Profile Completion

**Reason**  
Google OAuth only provides email and name; we need business details for operations.

**Goal**  
Create profile completion flow for Google OAuth signups.

**Technical Requirements**
- Create `pages/auth/complete-profile.tsx`
- Trigger when:
  - User signs in with Google
  - No donor document exists for their UID
- Form fields (pre-fill email from Google):
  - Business name (required)
  - Contact name (pre-fill from Google displayName)
  - Phone (required)
  - Business address (required)
  - Business type (required)
- On submit:
  - Create donor document in Firestore
  - Redirect to `/donor/dashboard`
- If donor document exists, skip this page
- Add check in `useRequireAuth` hook

---

### Task 2.2.2: Implement Form Validation with React Hook Form

**Reason**  
Need consistent, user-friendly form validation across all forms.

**Goal**  
Set up React Hook Form with Zod validation for all auth forms.

**Technical Requirements**
- Install dependencies: `npm install react-hook-form @hookform/resolvers zod`
- Create validation schemas in `lib/validations/`:
  ```typescript
  // auth.ts
  export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  export const signupSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
    businessType: z.enum(['restaurant', 'grocery', 'caterer', 'bakery', 'corporate', 'other']),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
  ```
- Refactor login and signup pages to use React Hook Form
- Display inline error messages below fields
- Disable submit button while form is invalid or submitting

---

### Task 2.2.3: Add Loading States and Success Messages

**Reason**  
Users need feedback during async operations to know the system is working.

**Goal**  
Add loading spinners and success/error toasts throughout auth flows.

**Technical Requirements**
- Create `components/ui/Spinner.tsx` (or use shadcn)
- Implement loading states:
  - Login button shows spinner while authenticating
  - Signup button shows spinner while creating account
  - Google OAuth button shows spinner
  - Forgot password button shows spinner
- Use shadcn `toast` for notifications:
  - Success: "Account created! Redirecting..."
  - Success: "Password reset email sent"
  - Error: Display Firebase error messages in user-friendly format
- Create `lib/firebase-errors.ts` to map Firebase error codes to friendly messages:
  ```typescript
  export function getAuthErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email';
      // ... etc
    }
  }
  ```

---

# Sprint 3: Donor Portal (Feb 12 - Feb 26)

## Story 3.1: Pickup Request Form

### Story Description
As a donor, I need to submit pickup requests easily so that MobilePantry can rescue my surplus food with minimal friction.

### Business Value
- Core feature enabling food rescue operations
- Frictionless experience encourages repeat donations
- Captures all information needed for successful pickups
- Triggers team notification for quick response

### Acceptance Criteria
- [ ] Form is completable in under 2 minutes
- [ ] Address pre-fills from donor profile
- [ ] Date defaults to today
- [ ] Form validates all required fields
- [ ] Submission creates Firestore document with status "pending"
- [ ] Slack notification sent on submission
- [ ] Donor sees confirmation and can view request status

---

### Task 3.1.1: Build Pickup Request Form UI

**Reason**  
This is the core donor interaction and must be as frictionless as possible.

**Goal**  
Create the pickup request form with excellent UX.

**Technical Requirements**
- Create `pages/donor/request.tsx`
- Form fields:
  1. **What food do you have?** (textarea)
     - Placeholder: "e.g., 50 lbs prepared sandwiches, 20 lbs mixed salads"
     - Required
  2. **Estimated amount** (number input)
     - Label: "Estimated weight (lbs)"
     - Placeholder: "50"
     - Required, min 1
  3. **Pickup address** (address fields)
     - Pre-fill from donor profile
     - "Use my business address" checkbox (checked by default)
     - If unchecked, show editable fields
     - Required
  4. **Pickup date** (date picker)
     - Default to today
     - Min date: today
     - Required
  5. **Pickup time window** (select)
     - Options: Morning (8am-12pm), Afternoon (12pm-5pm), Evening (5pm-8pm)
     - Required
  6. **Best way to contact on arrival** (text input)
     - Placeholder: "Call 614-555-1234 or ask for Joe at front desk"
     - Required
  7. **Special instructions** (textarea)
     - Placeholder: "e.g., Use loading dock, ring buzzer #3"
     - Optional
- Submit button: "Request Pickup"
- Form validation using React Hook Form + Zod
- Mobile-first responsive design

---

### Task 3.1.2: Implement Pickup Request Submission

**Reason**  
Need to save request to database and notify team.

**Goal**  
Handle form submission with database write and Slack notification.

**Technical Requirements**
- Create `pages/api/pickup-requests.ts`:
  ```typescript
  // POST handler:
  // 1. Validate request body
  // 2. Verify user is authenticated
  // 3. Create pickup request in Firestore
  // 4. Send Slack notification
  // 5. Return created request
  ```
- Create `lib/slack.ts`:
  ```typescript
  export async function sendPickupNotification(request: PickupRequest, donor: Donor) {
    const message = {
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🚨 New Pickup Request' }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Business:*\n${donor.businessName}` },
            { type: 'mrkdwn', text: `*Contact:*\n${donor.contactName}` },
            { type: 'mrkdwn', text: `*Address:*\n${formatAddress(request.pickupAddress)}` },
            { type: 'mrkdwn', text: `*Food:*\n~${request.estimatedWeight} lbs - ${request.foodDescription}` },
            { type: 'mrkdwn', text: `*Pickup:*\n${formatDate(request.pickupDate)}, ${request.pickupTimeWindow}` },
            { type: 'mrkdwn', text: `*Contact on arrival:*\n${request.contactOnArrival}` },
          ]
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `→ <${dashboardUrl}/admin/requests/${request.id}|View in dashboard>` }
        }
      ]
    };
    
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  }
  ```
- On successful submission:
  - Show success toast
  - Redirect to `/donor/request/[id]` to view request
- Handle errors gracefully

---

### Task 3.1.3: Build Request Confirmation Page

**Reason**  
Donors need to see their request was received and track its status.

**Goal**  
Create request detail page showing status and all request information.

**Technical Requirements**
- Create `pages/donor/request/[id].tsx`
- Display:
  - Status badge (Pending, Confirmed, Completed, Cancelled)
  - Submitted date/time
  - Food description
  - Estimated weight
  - Pickup address
  - Pickup date and time window
  - Contact on arrival
  - Special instructions (if any)
  - Actual weight (if completed)
- Status-specific messaging:
  - Pending: "We've received your request and will confirm shortly."
  - Confirmed: "Your pickup is confirmed! We'll see you on [date]."
  - Completed: "Thank you! We rescued [X] lbs of food."
  - Cancelled: "This request was cancelled."
- "Back to Dashboard" link
- Real-time updates using Firestore `onSnapshot` (optional for MVP)
- Protect route: only allow donor who owns request or admin

---

## Story 3.2: Donor Dashboard

### Story Description
As a donor, I need a dashboard to view my pending requests, donation history, and impact so that I can track my contributions.

### Business Value
- Provides donors visibility into their activity
- Shows impact to encourage continued donations
- Enables donors to self-serve for status checks
- Reduces support inquiries

### Acceptance Criteria
- [ ] Dashboard shows pending requests prominently
- [ ] Donor can see their total impact (pounds donated, meals provided)
- [ ] Recent donations displayed with status
- [ ] Quick action to create new request
- [ ] Dashboard loads quickly

---

### Task 3.2.1: Build Donor Dashboard Page

**Reason**  
Central hub for donor activity and primary landing after login.

**Goal**  
Create donor dashboard with impact stats and request overview.

**Technical Requirements**
- Create `pages/donor/dashboard.tsx`
- Sections:
  1. **Welcome header**
     - "Welcome back, [Business Name]"
     - "Request a Pickup" button (prominent CTA)
  2. **Impact stats** (card row)
     - Total pounds donated
     - Meals provided (pounds / 1.2)
     - Number of donations
  3. **Pending requests** (if any)
     - Card for each pending/confirmed request
     - Show: date, food description, status badge
     - Click to view details
     - If none: "No pending requests"
  4. **Recent donations** (last 5)
     - Table or card list
     - Columns: Date, Description, Weight, Status
     - "View all" link to history page
- Use `getServerSideProps` to fetch data
- Protect with `useRequireAuth` hook
- Mobile responsive (cards stack on mobile)

---

### Task 3.2.2: Build Donation History Page

**Reason**  
Donors may want to see their full donation history for records or tax purposes.

**Goal**  
Create paginated list of all donations.

**Technical Requirements**
- Create `pages/donor/history.tsx`
- Display:
  - Table with columns: Date, Description, Weight, Status
  - Click row to view request details
  - Status badge coloring
- Sorting:
  - Default: newest first
  - Allow sorting by date
- Filtering (stretch goal):
  - By status
  - By date range
- Pagination or infinite scroll (if >20 donations)
- Summary at top:
  - Total donations: X
  - Total pounds: X
- Empty state: "You haven't made any donations yet"
- Export to CSV (stretch goal)

---

### Task 3.2.3: Build Donor Settings Page

**Reason**  
Donors need to update their business info and account settings.

**Goal**  
Create settings page for profile and account management.

**Technical Requirements**
- Create `pages/donor/settings.tsx`
- Tabs or sections:
  1. **Business Profile**
     - Edit: Business name, contact name, phone, address, business type
     - Save button
     - Success toast on save
  2. **Account Settings**
     - Email display (read-only for now)
     - Change password (for email/password users)
     - Shows "Signed in with Google" for OAuth users
  3. **Danger Zone** (optional for MVP)
     - Delete account button
     - Confirmation dialog
- Form validation
- Loading states
- Pre-fill current values

---

# Sprint 4: Admin Dashboard + Polish (Feb 26 - Mar 12)

## Story 4.1: Admin Dashboard

### Story Description
As an admin, I need a dashboard to view and manage all pickup requests so that I can coordinate food rescues efficiently.

### Business Value
- Enables team to manage incoming requests
- Provides visibility into operations
- Tracks organizational impact
- Supports quick response to donor requests

### Acceptance Criteria
- [ ] Admins can view all pickup requests
- [ ] Admins can filter requests by status
- [ ] Admins can update request status
- [ ] Admins can log actual weight after pickup
- [ ] Admins can view all donors
- [ ] Dashboard shows key metrics
- [ ] Only admin emails can access admin routes

---

### Task 4.1.1: Build Admin Dashboard Home

**Reason**  
Admins need an overview of operations and quick access to key functions.

**Goal**  
Create admin dashboard with metrics and recent activity.

**Technical Requirements**
- Create `pages/admin/index.tsx`
- Sections:
  1. **Metrics cards**
     - Pending requests (count, clickable)
     - Rescues this week
     - Total pounds rescued (all time)
     - Active donors
  2. **Pending requests** (urgent section)
     - List of pending requests, newest first
     - Show: Business name, date, time window, estimated weight
     - Click to manage
     - "View all requests" link
  3. **Recent activity** (last 5 completed)
     - Recently completed pickups
     - Quick stats
- Protect with `useRequireAdmin` hook
- Quick action buttons: "View All Requests", "View All Donors"
- Refresh button to reload data

---

### Task 4.1.2: Build Admin Requests List Page

**Reason**  
Admins need to see all requests and filter by status.

**Goal**  
Create requests list with filtering and quick actions.

**Technical Requirements**
- Create `pages/admin/requests/index.tsx`
- Table columns:
  - Date submitted
  - Business name
  - Contact
  - Pickup date
  - Time window
  - Est. weight
  - Status (badge)
  - Actions
- Filters:
  - Status tabs: All, Pending, Confirmed, Completed, Cancelled
  - Date range (stretch goal)
- Quick actions:
  - Confirm (for pending)
  - View details
  - Cancel (with confirmation)
- Sorting by date
- Click row to view/edit details
- Pagination if >20 requests
- Mobile: card view instead of table

---

### Task 4.1.3: Build Admin Request Detail Page

**Reason**  
Admins need to view full request details and update status.

**Goal**  
Create request management page with status controls.

**Technical Requirements**
- Create `pages/admin/requests/[id].tsx`
- Display all request info:
  - Status badge (large)
  - Food description
  - Estimated weight
  - Pickup address (with "Open in Maps" link)
  - Pickup date and time window
  - Contact on arrival
  - Special instructions
  - Donor info section:
    - Business name (link to donor detail)
    - Contact name
    - Phone (clickable)
    - Email (clickable)
- Actions based on status:
  - **Pending:**
    - "Confirm Pickup" button → status = confirmed
    - "Cancel Request" button → confirmation dialog → status = cancelled
  - **Confirmed:**
    - "Mark as Completed" → opens modal to enter actual weight
    - "Cancel Request" button
  - **Completed:**
    - Display actual weight
    - Display completed date
    - No actions available
  - **Cancelled:**
    - Display cancelled reason (if any)
    - No actions available
- Actual weight modal:
  - Number input for weight
  - "Save & Complete" button
  - Validates weight > 0
- "Back to Requests" link
- Timestamps: created, confirmed, completed

---

### Task 4.1.4: Build Admin Donors List Page

**Reason**  
Admins need visibility into all donors for relationship management.

**Goal**  
Create donors list with key info and links.

**Technical Requirements**
- Create `pages/admin/donors/index.tsx`
- Table columns:
  - Business name
  - Contact name
  - Email
  - Phone
  - Total donated (lbs)
  - Last donation date
  - Actions
- Search:
  - By business name
  - By contact name
  - By email
- Sorting:
  - Default: most recent donation first
  - By business name A-Z
  - By total donated
- Click row to view donor detail
- Pagination if >20 donors

---

### Task 4.1.5: Build Admin Donor Detail Page

**Reason**  
Admins may need to view donor details and their donation history.

**Goal**  
Create donor detail page with profile and history.

**Technical Requirements**
- Create `pages/admin/donors/[id].tsx`
- Display:
  - Business name (header)
  - Contact info: name, email, phone, address
  - Business type
  - Member since (created date)
  - Stats:
    - Total donations
    - Total pounds
    - Meals provided
- Donation history:
  - Table of all requests from this donor
  - Columns: Date, Description, Weight, Status
  - Click to view request detail
- Actions:
  - "Edit Donor" (stretch goal)
  - "View All Requests" filtered to this donor
- "Back to Donors" link

---

## Story 4.2: Slack Integration

### Story Description
As an admin, I need to receive Slack notifications for new pickup requests so that I can respond quickly to donors.

### Business Value
- Enables immediate awareness of new requests
- Supports quick response time to donors
- Works with existing team communication tools
- No additional cost

### Acceptance Criteria
- [ ] New pickup request triggers Slack message
- [ ] Message includes all relevant pickup details
- [ ] Message includes link to admin dashboard
- [ ] Notification works reliably

---

### Task 4.2.1: Set Up Slack App and Webhook

**Reason**  
Need Slack infrastructure in place before notifications can work.

**Goal**  
Create Slack app with incoming webhook configured.

**Technical Requirements**
- Create Slack app at api.slack.com:
  - App name: "MobilePantry Bot"
  - Description: "Notifications for food pickup requests"
- Enable Incoming Webhooks
- Create webhook for #pickup-requests channel
- Add webhook URL to Vercel environment variables:
  - Key: `SLACK_WEBHOOK_URL`
  - Value: `https://hooks.slack.com/services/...`
- Document setup in `docs/SLACK_SETUP.md`:
  - How to create new webhook
  - How to change notification channel
  - Message format documentation

---

### Task 4.2.2: Implement Slack Notification Function

**Reason**  
Need reliable function to send formatted notifications to Slack.

**Goal**  
Create and test Slack notification sending.

**Technical Requirements**
- Create `lib/slack.ts` (if not already done in 3.1.2)
- Implement `sendPickupNotification` function
- Message format using Slack Block Kit:
  - Header: "🚨 New Pickup Request"
  - Business name and contact
  - Pickup address
  - Food description with estimated weight
  - Pickup date and time window
  - Contact on arrival instructions
  - Special instructions (if any)
  - Link to admin dashboard
- Error handling:
  - Log errors but don't fail request submission
  - Consider retry logic (optional)
- Test in development with test channel
- Create `lib/slack.test.ts` for manual testing script

---

## Story 4.3: Polish and Launch Prep

### Story Description
As a development team, we need to polish the application and prepare for launch so that we can deploy a reliable MVP.

### Business Value
- Ensures quality user experience at launch
- Reduces bugs and issues during pilot
- Creates documentation for ongoing maintenance
- Prepares team for production support

### Acceptance Criteria
- [ ] All pages are mobile responsive
- [ ] No console errors in production build
- [ ] Loading states exist for all async operations
- [ ] Error states handled gracefully
- [ ] Basic SEO meta tags on all pages
- [ ] Manual testing checklist completed
- [ ] Production environment configured

---

### Task 4.3.1: Mobile Responsiveness Audit

**Reason**  
Many donors will access the site from mobile devices.

**Goal**  
Ensure all pages work well on mobile devices.

**Technical Requirements**
- Test all pages on:
  - iPhone SE (small)
  - iPhone 14 (medium)
  - iPad (tablet)
  - Desktop (1024px+)
- Fix issues with:
  - Navigation menu on mobile
  - Form field sizes
  - Table layouts (switch to cards on mobile)
  - Button sizes (min 44px touch target)
  - Text readability
- Use Chrome DevTools device emulation
- Test on real devices if available
- Document any known mobile limitations

---

### Task 4.3.2: Error Handling and Loading States

**Reason**  
Users need feedback when things are loading or when errors occur.

**Goal**  
Audit and improve all loading and error states.

**Technical Requirements**
- Audit all pages for:
  - Loading states during data fetch
  - Error states when fetch fails
  - Empty states when no data
- Implement missing states:
  - Spinner component for loading
  - Error component with retry button
  - Empty state illustrations/messages
- Error boundary:
  - Create `components/ErrorBoundary.tsx`
  - Wrap app in error boundary
  - Show friendly error message
  - Log errors for debugging
- 404 page:
  - Create `pages/404.tsx`
  - Friendly message with link home
- API error handling:
  - Consistent error response format
  - User-friendly error messages

---

### Task 4.3.3: SEO and Meta Tags

**Reason**  
Need basic SEO for discoverability and social sharing.

**Goal**  
Add meta tags and SEO essentials to all pages.

**Technical Requirements**
- Create `components/SEO.tsx`:
  ```typescript
  interface SEOProps {
    title: string;
    description: string;
    ogImage?: string;
  }
  ```
- Use Next.js `Head` component
- Default meta tags:
  - Title: "[Page] | MobilePantry"
  - Description: Page-specific
  - Open Graph tags
  - Twitter card tags
- Add to all public pages:
  - Homepage
  - About
  - Contact
- Create default OG image (1200x630px)
- Add favicon:
  - favicon.ico
  - apple-touch-icon.png
- robots.txt allowing all
- sitemap.xml (stretch goal)

---

### Task 4.3.4: Create Manual Testing Checklist

**Reason**  
Need systematic way to verify all functionality before launch.

**Goal**  
Create comprehensive manual testing checklist.

**Technical Requirements**
- Create `docs/MANUAL_TESTING_CHECKLIST.md`
- Include test cases for:
  - **Visitor Flow:**
    - Homepage loads correctly
    - Navigation works
    - About page loads
    - Contact form submits
  - **Donor Registration:**
    - Email/password signup works
    - Google OAuth signup works
    - Profile completion (Google users)
    - Validation errors display correctly
  - **Donor Login:**
    - Email/password login works
    - Google OAuth login works
    - Forgot password flow works
    - Invalid credentials show error
  - **Pickup Request:**
    - Form loads with pre-filled address
    - All fields validate correctly
    - Submission creates Firestore document
    - Slack notification sent
    - Confirmation page displays
  - **Donor Dashboard:**
    - Stats display correctly
    - Pending requests show
    - Recent donations show
    - Links work
  - **Admin Dashboard:**
    - Only accessible by admin emails
    - Metrics display correctly
    - Requests list loads
    - Can update request status
    - Can log actual weight
    - Donors list loads
- Assign testers
- Track results
- Document bugs found

---

### Task 4.3.5: Production Environment Setup

**Reason**  
Need secure, properly configured production environment for launch.

**Goal**  
Finalize production configuration on Vercel and Firebase.

**Technical Requirements**
- Vercel:
  - Verify all environment variables set
  - Configure custom domain (if available)
  - Enable analytics (optional)
  - Set up error notifications
- Firebase:
  - Verify production project settings
  - Deploy Firestore security rules
  - Enable only needed auth providers
  - Set up Firebase project budget alerts
- Update ADMIN_EMAILS:
  - Add actual admin email addresses
  - Update Firestore rules with admin emails
- Create production checklist:
  - [ ] All env vars configured
  - [ ] Domain configured
  - [ ] Security rules deployed
  - [ ] Admin emails set
  - [ ] Slack webhook verified
- Document rollback procedure

---

### Task 4.3.6: Launch Day Checklist

**Reason**  
Need structured approach to go-live.

**Goal**  
Create launch day runbook.

**Technical Requirements**
- Create `docs/LAUNCH_CHECKLIST.md`:
  - Pre-launch (day before):
    - [ ] All tests passing
    - [ ] Manual testing complete
    - [ ] No blocking bugs
    - [ ] Team briefed on launch plan
  - Launch morning:
    - [ ] Final production deploy
    - [ ] Verify site loads correctly
    - [ ] Test donor signup flow
    - [ ] Test pickup request flow
    - [ ] Verify Slack notification works
    - [ ] Test admin dashboard access
  - Post-launch:
    - [ ] Monitor for errors
    - [ ] Check Slack for notifications
    - [ ] Team available for issues
    - [ ] Document any issues found
- Create rollback plan:
  - How to revert to previous deploy
  - Who can perform rollback
  - When to decide to rollback
- Communication plan:
  - Who announces launch
  - Where to report issues

---

# Backlog (Post-MVP)

These stories are documented for future planning but not scheduled for MVP.

## Story B.1: Automated Thank-You Emails

**Description:** As a donor, I want to receive a thank-you email after my donation is completed so that I feel appreciated and can see my impact.

**Acceptance Criteria:**
- Email sent when pickup marked complete
- Includes: pounds rescued, meals provided, CO2 prevented
- Uses professional email template
- Sent via Resend or similar service

---

## Story B.2: Destinations Management

**Description:** As an admin, I need to track where food is delivered so that we can report on our impact by recipient organization.

**Acceptance Criteria:**
- CRUD for destination organizations
- Assign destination to pickup requests
- Report: pounds delivered per destination

---

## Story B.3: Public Impact Dashboard

**Description:** As a funder or partner, I want to see MobilePantry's impact data so that I can evaluate their effectiveness.

**Acceptance Criteria:**
- Public page showing aggregated stats
- Charts showing trends over time
- Embeddable widget for partners

---

## Story B.4: Volunteer Coordination (Mobile App)

**Description:** As a volunteer, I need a mobile app to claim available rescues so that I can help with food pickups.

**Acceptance Criteria:**
- View available rescues
- Claim a rescue
- Get directions to pickup and delivery
- Mark rescue complete

---

*— End of Epic Breakdown —*