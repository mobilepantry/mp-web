# Slack Integration Setup

MobilePantry uses Slack Incoming Webhooks to notify the team when new pickup requests are submitted.

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
4. Select the `#pickup-requests` channel (or create it first)
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

### 4. Optional: App URL for Dashboard Links

Slack messages include a "View in Admin Dashboard" link. Set this if your production URL differs:

```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

If not set, defaults to `https://mp-web-livid.vercel.app`.

## Notification Format

When a donor submits a pickup request, the Slack message includes:

- Business name and contact
- Food description and estimated weight
- Pickup date and time window
- Pickup address with Google Maps link
- Contact on arrival instructions
- Special instructions (if any)
- Link to the request in the admin dashboard
- Request ID for tracking

## Changing the Notification Channel

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → your app
2. Click **Incoming Webhooks**
3. Create a new webhook for the desired channel
4. Update `SLACK_WEBHOOK_URL` in your environment

## Message Customization

The Slack message is built in `src/lib/slack.ts` using [Block Kit](https://api.slack.com/block-kit) format. To customize:

1. Edit the `message.blocks` array in `sendPickupNotification()`
2. Preview your changes at [Block Kit Builder](https://app.slack.com/block-kit-builder)

## Troubleshooting

- **No notifications**: Check that `SLACK_WEBHOOK_URL` is set. The app logs a warning if it's missing.
- **Requests still succeed without Slack**: By design — Slack failures don't block request creation.
- **403 errors**: The webhook URL may have been revoked. Create a new one in the Slack app settings.
