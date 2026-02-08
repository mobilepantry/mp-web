import type { PickupRequest, Donor, Address } from '@/types';

function formatAddress(address: Address): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

function formatTimeWindow(window: string): string {
  switch (window) {
    case 'morning':
      return 'Morning (8am-12pm)';
    case 'afternoon':
      return 'Afternoon (12pm-5pm)';
    case 'evening':
      return 'Evening (5pm-8pm)';
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

export async function sendPickupNotification(
  request: PickupRequest,
  donor: Donor,
  pickupDateString: string
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping notification');
    return;
  }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(formatAddress(request.pickupAddress))}`;

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 New Pickup Request',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${donor.businessName}* has food ready for rescue!`,
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
            text: `:package: *Food*\n${request.foodDescription}`,
          },
          {
            type: 'mrkdwn',
            text: `:scales: *Estimated Weight*\n~${request.estimatedWeight} lbs`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:calendar: *Pickup Date*\n${formatDate(pickupDateString)}`,
          },
          {
            type: 'mrkdwn',
            text: `:clock3: *Time Window*\n${formatTimeWindow(request.pickupTimeWindow)}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:round_pushpin: *Pickup Location*\n${formatAddress(request.pickupAddress)}\n<${mapsUrl}|Open in Google Maps>`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:bust_in_silhouette: *Contact*\n${donor.contactName}`,
          },
          {
            type: 'mrkdwn',
            text: `:telephone_receiver: *On Arrival*\n${request.contactOnArrival}`,
          },
        ],
      },
      ...(request.specialInstructions
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:memo: *Special Instructions*\n${request.specialInstructions}`,
              },
            },
          ]
        : []),
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Request ID: \`${request.id}\``,
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
