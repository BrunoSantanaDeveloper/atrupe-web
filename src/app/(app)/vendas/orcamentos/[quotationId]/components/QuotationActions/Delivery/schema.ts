// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  deliveryType: z.string().nullable(),
  daysAfterApproval: z.coerce.number(),
  estimatedDate: z.coerce.date(),
  modality: z.string(),
  cost: z.number(),
  value: z.number(),
  supplierId: z.string().transform((value) => value || null),
  notes: z.string().trim(),
})

export type FormType = z.infer<typeof schema>
