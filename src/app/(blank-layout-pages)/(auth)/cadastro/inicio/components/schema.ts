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
  cpf: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine((v) => v.replace(/\D/g, '').length === 11, 'CPF inválido'),
})

export type SignupType = z.infer<typeof signupSchema>
