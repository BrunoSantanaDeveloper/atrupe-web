// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  deliveryType: z.string().nullable(),
  daysAfterApproval: z.coerce.number().positive('Dia deve ser positivo'),
  estimatedDate: z.coerce.date().refine(
    (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    },
    {
      message: 'A data estimada deve ser hoje ou uma data futura',
    },
  ),
  modality: z.string(),
  cost: z.number(),
  value: z.number(),
  supplierId: z.string().transform((value) => value || null),
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
