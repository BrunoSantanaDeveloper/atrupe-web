// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  deliveryType: z.string().nullable(),
  daysAfterApproval: z.coerce.number(),
  estimatedDate: z.coerce.date().optional().nullable(),
  modality: z.string(),
  cost: z.number(),
  value: z.number(),
  supplierId: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .transform((value) => value?.value)
    .nullable(),
  clientAddressId: z.string().optional(),
  customAddress: z
    .object({
      zipcode: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
    })
    .optional(),
  notes: z.string().trim(),
})

export type FormType = z.infer<typeof schema>
