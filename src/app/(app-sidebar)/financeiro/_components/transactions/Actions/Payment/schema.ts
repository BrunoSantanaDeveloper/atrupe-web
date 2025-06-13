// Third-party Imports
import { z } from 'zod'

export const schema = z.object({
  paidDate: z.date(),
  paymentMethodId: z.string().min(1, 'Campo obrigatório'),
  bankId: z.string().optional(), // não precisa mandar
  bankAccountId: z.string().min(1, 'Campo obrigatório'),
  totalValue: z.number().optional(), // não precisa mandar
  amount: z.number(),
})

export type FormType = z.infer<typeof schema>
