// Third-party Imports
import { z } from 'zod'

// Lib
import { isValidCnpj, isValidCpf } from '@/lib/utils'

/**
 * A conta nova, a empresa e o representante de quem aceita a transferência.
 * O e-mail não entra: é o do convite, travado. Razão social e nome do
 * representante só são exigidos quando a consulta pública não os traz — a
 * tela confere isso ao enviar.
 */
export const inviteSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o seu nome.'),
    password: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Repita a senha.'),
    cnpj: z.string().refine((value) => isValidCnpj(value), 'CNPJ inválido.'),
    legalName: z.string().optional(),
    tradeName: z.string().optional(),
    representativeCpf: z
      .string()
      .refine((value) => isValidCpf(value), 'CPF inválido.'),
    representativeIsSelf: z.boolean(),
    representativeName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

export type InviteForm = z.infer<typeof inviteSchema>
