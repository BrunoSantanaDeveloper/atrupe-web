import { z } from 'zod'

export const schema = z.object({
  reference: z
    .string()
    .min(1, 'Referência é obrigatória')
    .max(100, 'Referência deve ter no máximo 100 caracteres'),
  type: z.enum(['INCREASE', 'DISCOUNT']),
  amount: z.number().min(0, 'Valor deve ser maior que 0'),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  reference: '',
  type: 'INCREASE',
  amount: 0,
}
