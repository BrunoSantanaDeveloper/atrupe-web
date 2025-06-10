import { z } from 'zod'

const cashControlSchema = z.object({
  id: z.string().optional(),
  acceptPayments: z.boolean(),
  paymentType: z.string(), // PROVISION | PAYSOFF
  acceptIncomes: z.boolean(),
  incomeType: z.string(), // PROVISION | PAYSOFF
  paymentMethodId: z.string(),
})

export const schema = z.object({
  name: z.string().min(1, {
    message: 'Campo obrigatório.',
  }),
  bankId: z.string().min(1, {
    message: 'Campo obrigatório.',
  }),
  description: z.string(),
  cashControl: z.boolean(),
  bankAccountCashControl: z.array(cashControlSchema),
})

export const schemas = z.any()

export type FormType = z.infer<typeof schema>
