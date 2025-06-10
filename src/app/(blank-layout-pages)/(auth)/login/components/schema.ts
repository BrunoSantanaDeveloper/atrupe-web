// Third-party Imports
import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Campo obrigatório')
    .email('Formato de e-mail inválido'),
  password: z.string().min(1, 'Campo obrigatório'),
  remember: z.boolean().optional(),
})

export type LoginType = z.infer<typeof loginSchema>
