import { z } from 'zod'

export const schema = z.object({
  password: z.string().min(1, { message: 'Senha é obrigatória' }),
})

export type FormType = z.infer<typeof schema>
