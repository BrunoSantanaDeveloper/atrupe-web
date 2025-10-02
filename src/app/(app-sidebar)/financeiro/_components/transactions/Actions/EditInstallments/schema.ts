import { z } from 'zod'

export const schema = z.object({
  installments: z.array(
    z.object({
      id: z.string().optional(),
      originalId: z.string().optional(),
      amount: z.number(),
      additionalFee: z.number().optional(),
      dueDate: z.date({ invalid_type_error: 'Selecione uma data' }),
      paymentConditionId: z.string().min(1, 'Campo obrigatório'),
    }),
  ),
})

export type FormType = z.infer<typeof schema>
