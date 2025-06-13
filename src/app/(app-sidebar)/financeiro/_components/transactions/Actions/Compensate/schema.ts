// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  paidDate: z.date().optional().nullable(),
  compensateDate: z.date(),
  paymentMethodId: z.string().optional().nullable(),
  bankId: z.string().optional().nullable(),
  bankAccountId: z.string().optional().nullable(),
  totalValue: z.number().optional().nullable(),
  amount: z.number().optional().nullable(),
})

export type FormType = z.infer<typeof schema>
