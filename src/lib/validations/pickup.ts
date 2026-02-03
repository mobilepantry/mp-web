import { z } from 'zod';

export const pickupRequestSchema = z.object({
  foodDescription: z.string().min(1, 'Please describe the food you have'),
  estimatedWeight: z
    .string()
    .min(1, 'Please enter the estimated weight')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: 'Weight must be at least 1 lb',
    })
    .transform((val) => Number(val)),
  useBusinessAddress: z.boolean(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  pickupTimeWindow: z.enum(['morning', 'afternoon', 'evening'], {
    message: 'Please select a time window',
  }),
  contactOnArrival: z.string().min(1, 'Please provide contact instructions'),
  specialInstructions: z.string().optional(),
});

export type PickupRequestFormData = z.output<typeof pickupRequestSchema>;
export type PickupRequestFormInput = z.input<typeof pickupRequestSchema>;
