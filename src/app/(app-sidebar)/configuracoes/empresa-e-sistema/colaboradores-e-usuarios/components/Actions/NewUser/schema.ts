import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Mínimo de 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial')

const baseSchema = {
  name: z.string().min(1, 'Campo obrigatório'),
  email: z.string().email('E-mail inválido'),
}

const createSchema = z
  .object({
    ...baseSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

const editSchema = z
  .object({
    ...baseSchema,
    password: z.union([z.string().length(0), passwordSchema]),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      if (data.password === '') return data.confirmPassword === ''
      return data.password === data.confirmPassword
    },
    {
      message: 'As senhas não conferem',
      path: ['confirmPassword'],
    },
  )

export const getSchema = (isEditMode: boolean) =>
  isEditMode ? editSchema : createSchema

export type FormType = z.infer<typeof createSchema>
