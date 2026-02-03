import type { NextApiRequest, NextApiResponse } from 'next';
import { Timestamp } from 'firebase/firestore';
import { createPickupRequest } from '@/lib/db/pickups';
import { getDonor } from '@/lib/db/donors';
import { sendPickupNotification } from '@/lib/slack';
import type { Address, TimeWindow } from '@/types';

interface CreatePickupRequestBody {
  donorId: string;
  foodDescription: string;
  estimatedWeight: number;
  pickupAddress: Address;
  pickupDate: string;
  pickupTimeWindow: TimeWindow;
  contactOnArrival: string;
  specialInstructions?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const body = req.body as CreatePickupRequestBody;

    // Validate required fields
    if (
      !body.donorId ||
      !body.foodDescription ||
      !body.estimatedWeight ||
      !body.pickupAddress ||
      !body.pickupDate ||
      !body.pickupTimeWindow ||
      !body.contactOnArrival
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate pickup time window
    if (!['morning', 'afternoon', 'evening'].includes(body.pickupTimeWindow)) {
      return res.status(400).json({ message: 'Invalid pickup time window' });
    }

    // Get donor info for Slack notification
    const donor = await getDonor(body.donorId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Convert date string to Timestamp
    const pickupDate = Timestamp.fromDate(new Date(body.pickupDate));

    // Create the pickup request (only include specialInstructions if provided)
    const pickupRequest = await createPickupRequest({
      donorId: body.donorId,
      foodDescription: body.foodDescription,
      estimatedWeight: body.estimatedWeight,
      pickupAddress: body.pickupAddress,
      pickupDate,
      pickupTimeWindow: body.pickupTimeWindow,
      contactOnArrival: body.contactOnArrival,
      ...(body.specialInstructions && { specialInstructions: body.specialInstructions }),
    });

    // Send Slack notification (don't fail the request if this fails)
    try {
      await sendPickupNotification(pickupRequest, donor, body.pickupDate);
    } catch (slackError) {
      console.error('Slack notification failed:', slackError);
    }

    return res.status(201).json({
      id: pickupRequest.id,
      message: 'Pickup request created successfully',
    });
  } catch (error) {
    console.error('Error creating pickup request:', error);
    return res.status(500).json({ message: 'Failed to create pickup request' });
  }
}
