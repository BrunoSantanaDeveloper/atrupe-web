import { z } from 'zod'

export const schema = z.object({
  planId: z.string().min(1, { message: 'Selecione o plano' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
})

export type FormType = z.infer<typeof schema>
