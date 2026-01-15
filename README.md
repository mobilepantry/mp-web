# MobilePantry

A web application for coordinating food rescue pickups in Columbus, Ohio.

MobilePantry connects businesses with surplus food to community organizations in need. Donors request pickups through our platform, and our team handles the rescue and delivery.

## Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Hosting:** Vercel
- **Notifications:** Slack Webhooks

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Auth enabled
- Slack workspace with incoming webhook (for notifications)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in your environment variables (see below)
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
SLACK_WEBHOOK_URL=
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Project Structure

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

## Features

**Donors** can:
- Create an account (email or Google)
- Submit pickup requests
- Track request status
- View donation history and impact

**Admins** can:
- Receive Slack notifications for new requests
- Manage pickup requests (confirm, complete, cancel)
- Log actual weight after pickups
- View all donors and metrics

## Documentation

- [MVP Specification](./docs/MVP_SPEC.md)
- [Jira Epic Breakdown](./docs/JIRA_EPIC.md)

## License

Private - MobilePantry © 2026