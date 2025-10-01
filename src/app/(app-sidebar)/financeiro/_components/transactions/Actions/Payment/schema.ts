// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  paidDate: z.date(),
  paymentConditionId: z.string().min(1, 'Campo obrigatório'),
  bankId: z.string().optional(), // não precisa mandar
  bankAccountId: z.string().min(1, 'Campo obrigatório'),
  totalValue: z.number().optional(), // não precisa mandar
  amount: z.number(),
  // Campos para diferença
  differenceNatureId: z.string().optional(),
  differenceCategoryId: z.string().optional(),
})

export type FormType = z.infer<typeof schema>
