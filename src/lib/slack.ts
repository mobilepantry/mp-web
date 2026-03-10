import type { SurplusAlert, Supplier, Address, ProduceCategory } from '@/types';

function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

function formatTimeWindow(window: string): string {
  switch (window) {
    case 'morning':
      return 'Morning (8am–12pm)';
    case 'afternoon':
      return 'Afternoon (12pm–5pm)';
    case 'evening':
      return 'Evening (5pm–8pm)';
    default:
      return window;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const categoryEmoji: Record<ProduceCategory, string> = {
  fruits: '🍎',
  vegetables: '🥕',
  'leafy-greens': '🥬',
  'root-vegetables': '🥔',
  herbs: '🌿',
  mixed: '📦',
  other: '🥗',
};

function formatCategories(categories: ProduceCategory[]): string {
  return categories
    .map((c) => `${categoryEmoji[c] || '📦'} ${c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`)
    .join(', ');
}

function formatGrade(grade: string): string {
  switch (grade) {
    case 'A':
      return 'A — Minor cosmetic';
    case 'B':
      return 'B — Noticeable blemishes, fully edible';
    case 'C':
      return 'C — Very ripe, use immediately';
    default:
      return grade;
  }
}

export async function sendSurplusAlertNotification(
  alert: SurplusAlert,
  supplier: Supplier,
  pickupDateString: string
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formatAddress(alert.pickupAddress))}`;

  const weightText = alert.estimatedCaseCount
    ? `~${alert.estimatedWeightLbs} lbs (${alert.estimatedCaseCount} cases)`
    : `~${alert.estimatedWeightLbs} lbs`;

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🥬 New Surplus Alert',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${supplier.businessName}* has surplus produce available for rescue!`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:seedling: *Produce*\n${alert.produceDescription}`,
          },
          {
            type: 'mrkdwn',
            text: `:scales: *Est. Weight*\n${weightText}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:label: *Categories*\n${formatCategories(alert.produceCategory)}`,
          },
          {
            type: 'mrkdwn',
            text: `:clipboard: *Type*\n${alert.alertType === 'standing' ? 'Standing Weekly' : 'Ad-hoc'}`,
          },
        ],
      },
      ...(alert.produceGrade
        ? [
            {
              type: 'section' as const,
              text: {
                type: 'mrkdwn' as const,
                text: `:mag: *Grade*\n${formatGrade(alert.produceGrade)}`,
              },
            },
          ]
        : []),
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:calendar: *Pickup Date*\n${formatDate(pickupDateString)}`,
          },
          {
            type: 'mrkdwn',
            text: `:clock3: *Time Window*\n${formatTimeWindow(alert.pickupTimeWindow)}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:round_pushpin: *Pickup Location*\n${formatAddress(alert.pickupAddress)}\n<${mapsUrl}|Open in Google Maps>`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:bust_in_silhouette: *Contact*\n${supplier.contactName}`,
          },
          {
            type: 'mrkdwn',
            text: `:telephone_receiver: *On Arrival*\n${alert.contactOnArrival}`,
          },
        ],
      },
      ...(alert.specialInstructions
        ? [
            {
              type: 'section' as const,
              text: {
                type: 'mrkdwn' as const,
                text: `:memo: *Special Instructions*\n${alert.specialInstructions}`,
              },
            },
          ]
        : []),
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<${process.env.NEXT_PUBLIC_APP_URL || 'https://mp-web-livid.vercel.app'}/admin/requests/${alert.id}|View in Ops Dashboard>`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Alert ID: \`${alert.id}\``,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Failed to send Slack notification:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

// Backward-compat alias
/** @deprecated Use sendSurplusAlertNotification */
export const sendPickupNotification = sendSurplusAlertNotification;
