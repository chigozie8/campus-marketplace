import { z } from 'zod'

export const submitVerificationSchema = z.object({
  full_name:        z.string().min(2).max(100),
  business_name:    z.string().min(2).max(150),
  phone_number:     z.string().regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number'),
  location_city:    z.string().min(2).max(100),
  location_state:   z.string().min(2).max(100),
  bank_name:        z.string().min(2).max(100),
  account_number:   z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  id_type:          z.enum(['nin', 'bvn', 'drivers_license', 'international_passport', 'voters_card']),
  id_number:        z.string().min(5).max(50),
  id_image_url:     z.string().url('id_image_url must be a valid URL'),
  selfie_image_url: z.string().url('selfie_image_url must be a valid URL'),
})

export const reviewVerificationSchema = z.object({
  status:           z.enum(['approved', 'rejected']),
  rejection_reason: z.string().min(5).max(500).optional(),
}).refine(
  (d) => d.status === 'approved' || (d.status === 'rejected' && !!d.rejection_reason),
  { message: 'rejection_reason is required when rejecting', path: ['rejection_reason'] },
)

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>
export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>
