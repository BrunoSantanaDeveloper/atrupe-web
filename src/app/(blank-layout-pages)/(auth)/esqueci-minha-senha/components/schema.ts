// Third-party Imports
import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .email('Formato de e-mail inválido'),
})

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>
