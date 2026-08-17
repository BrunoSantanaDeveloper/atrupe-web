import { z } from 'zod'

export const schema = z.object({
  name: z
    .string()
    .min(1, 'Referência é obrigatória')
    .max(100, 'Referência deve ter no máximo 100 caracteres'),
  type: z.enum(['INCREASE', 'DISCOUNT', 'ADVANCE']),
})

export type FormType = z.infer<typeof schema>

export const defaultValues: FormType = {
  name: '',
  type: 'INCREASE',
}
