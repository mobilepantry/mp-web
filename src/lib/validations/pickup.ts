import { z } from 'zod';

export const surplusAlertSchema = z.object({
  produceDescription: z.string().min(1, 'Please describe the available produce'),
  produceCategory: z
    .array(
      z.enum([
        'fruits',
        'vegetables',
        'leafy-greens',
        'root-vegetables',
        'herbs',
        'mixed',
        'other',
      ])
    )
    .min(1, 'Select at least one category'),
  estimatedWeightLbs: z
    .string()
    .min(1, 'Please enter the estimated weight')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: 'Weight must be at least 1 lb',
    })
    .transform((val) => Number(val)),
  estimatedCaseCount: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 1), {
      message: 'Case count must be at least 1',
    }),
  produceGrade: z.enum(['A', 'B', 'C']).optional(),
  alertType: z.enum(['ad-hoc', 'standing']),
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

export type SurplusAlertFormData = z.output<typeof surplusAlertSchema>;
export type SurplusAlertFormInput = z.input<typeof surplusAlertSchema>;

// Backward-compat aliases
/** @deprecated Use surplusAlertSchema */
export const pickupRequestSchema = surplusAlertSchema;
/** @deprecated Use SurplusAlertFormData */
export type PickupRequestFormData = SurplusAlertFormData;
/** @deprecated Use SurplusAlertFormInput */
export type PickupRequestFormInput = SurplusAlertFormInput;
