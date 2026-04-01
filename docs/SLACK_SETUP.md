# Slack Integration Setup

MobilePantry uses Slack Incoming Webhooks to notify the ops team when new surplus alerts are submitted by suppliers.

## Setup Steps

### 1. Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: `MobilePantry Bot`
4. Pick your workspace
5. Click **Create App**

### 2. Enable Incoming Webhooks

1. In the app settings, click **Incoming Webhooks** in the left sidebar
2. Toggle **Activate Incoming Webhooks** to **On**
3. Click **Add New Webhook to Workspace**
4. Select the `#surplus-alerts` channel (or create it first)
5. Click **Allow**
6. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

### 3. Configure Environment Variable

Add the webhook URL to your environment:

**Local development** — add to `.env.local`:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

**Vercel (production)** — add in Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add `SLACK_WEBHOOK_URL` with the webhook URL
3. Apply to Production (and optionally Preview)

### 4. App URL for Dashboard Links

Slack messages include a "View in Ops Dashboard" link. Set the production URL:

```
NEXT_PUBLIC_APP_URL=https://app.mobilepantry.org
```

If not set, defaults to `https://mp-web-livid.vercel.app`.

## Notification Format

When a supplier submits a surplus alert, the Slack message includes:

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

### Fields Included

- Supplier business name and contact
- Produce description and categories (with emoji badges)
- Estimated weight and case count
- Produce grade (if provided by supplier)
- Alert type (ad-hoc or standing weekly)
- Pickup date and time window
- Pickup address with Google Maps link
- Contact on arrival instructions
- Special instructions (if any)
- Link to the alert in the ops dashboard
- Alert ID for tracking

## Changing the Notification Channel

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → your app
2. Click **Incoming Webhooks**
3. Create a new webhook for the desired channel
4. Update `SLACK_WEBHOOK_URL` in your environment

## Message Customization

The Slack message is built in `src/lib/slack.ts` using [Block Kit](https://api.slack.com/block-kit) format. To customize:

1. Edit the `message.blocks` array in `sendSurplusAlertNotification()`
2. Preview your changes at [Block Kit Builder](https://app.slack.com/block-kit-builder)

## Troubleshooting

- **No notifications**: Check that `SLACK_WEBHOOK_URL` is set. The app logs a warning if it's missing.
- **Alerts still succeed without Slack**: By design — Slack failures don't block alert creation.
- **403 errors**: The webhook URL may have been revoked. Create a new one in the Slack app settings.
