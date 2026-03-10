import type { NextApiRequest, NextApiResponse } from 'next';
import { createSurplusAlert } from '@/lib/db/surplus-alerts';
import { getSupplier } from '@/lib/db/suppliers';
import { sendSurplusAlertNotification } from '@/lib/slack';
import type { TimeWindow, ProduceCategory, ProduceGrade, AlertType } from '@/types';

interface CreateSurplusAlertBody {
  supplierId: string;
  produceDescription: string;
  produceCategory: ProduceCategory[];
  estimatedWeightLbs: number;
  estimatedCaseCount?: number;
  produceGrade?: ProduceGrade;
  alertType: AlertType;
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
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
    const body = req.body as CreateSurplusAlertBody;

    // Validate required fields
    if (
      !body.supplierId ||
      !body.produceDescription ||
      !body.produceCategory ||
      !Array.isArray(body.produceCategory) ||
      body.produceCategory.length < 1 ||
      !body.estimatedWeightLbs ||
      typeof body.estimatedWeightLbs !== 'number' ||
      body.estimatedWeightLbs < 1 ||
      !body.alertType ||
      !body.pickupDate ||
      !body.pickupTimeWindow ||
      !body.contactOnArrival
    ) {
      return res.status(400).json({ message: 'Missing or invalid required fields' });
    }

    // Validate pickupTimeWindow
    if (!['morning', 'afternoon', 'evening'].includes(body.pickupTimeWindow)) {
      return res.status(400).json({ message: 'Invalid pickup time window' });
    }

    // Validate alertType
    if (!['ad-hoc', 'standing'].includes(body.alertType)) {
      return res.status(400).json({ message: 'Invalid alert type' });
    }

    // Get supplier info for Slack notification
    const supplier = await getSupplier(body.supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Create the surplus alert — pickupDate is stored as a string
    const surplusAlert = await createSurplusAlert({
      supplierId: body.supplierId,
      produceDescription: body.produceDescription,
      produceCategory: body.produceCategory,
      estimatedWeightLbs: body.estimatedWeightLbs,
      ...(body.estimatedCaseCount != null && { estimatedCaseCount: body.estimatedCaseCount }),
      ...(body.produceGrade && { produceGrade: body.produceGrade }),
      alertType: body.alertType,
      pickupAddress: body.pickupAddress,
      pickupDate: body.pickupDate,
      pickupTimeWindow: body.pickupTimeWindow,
      contactOnArrival: body.contactOnArrival,
      ...(body.specialInstructions && { specialInstructions: body.specialInstructions }),
    });

    // Send Slack notification (don't fail the request if this fails)
    try {
      await sendSurplusAlertNotification(surplusAlert, supplier, body.pickupDate);
    } catch (slackError) {
      console.error('Slack notification failed:', slackError);
    }

    return res.status(201).json({
      id: surplusAlert.id,
      message: 'Surplus alert created successfully',
    });
  } catch (error) {
    console.error('Error creating surplus alert:', error);
    return res.status(500).json({ message: 'Failed to create surplus alert' });
  }
}
