import { brlToFloat } from '@/lib/utils'
import { z } from 'zod'

export const schema = z.object({
  amount: z
    .string()
    .min(1, 'Campo obrigatório')
    .transform((value) => brlToFloat(value)),
  type: z.string().min(1, 'Campo obrigatório'),
  reason: z.string().optional(),
})

export type FormType = z.infer<typeof schema>

export const defaultValues = {
  amount: 0,
  type: '',
  reason: '',
}
