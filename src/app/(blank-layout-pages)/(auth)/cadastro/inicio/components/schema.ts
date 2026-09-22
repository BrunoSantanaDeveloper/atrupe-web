// Third-party Imports
import { z } from 'zod'

export const signupSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  email: z
    .string()
    .min(1, 'Campo obrigatório')
    .email('Formato de e-mail inválido'),
  company: z.string().min(1, 'Campo obrigatório'),
  mobile: z.string().min(1, 'Campo obrigatório'),
})

export type SignupType = z.infer<typeof signupSchema>
