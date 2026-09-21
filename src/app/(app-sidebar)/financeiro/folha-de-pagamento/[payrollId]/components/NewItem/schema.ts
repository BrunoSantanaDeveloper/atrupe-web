import { z } from 'zod'

export const schema = z.object({
  id: z.string().optional(),
  payrollId: z.string().optional(),
  description: z
    .string()
    .min(1, 'Referência é obrigatória')
    .max(100, 'Referência deve ter no máximo 100 caracteres'),
  type: z.enum(['INCREASE', 'DISCOUNT', 'ADVANCE']),
  amount: z.number().positive('Valor deve ser maior que 0'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  description: '',
  type: 'INCREASE',
  amount: 0,
}
