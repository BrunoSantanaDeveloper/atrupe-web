import { z } from 'zod'

export const schema = z.object({
  companyName: z.string().min(1, 'Razão social é obrigatória'),
  document: z.string().min(1, 'CNPJ é obrigatório'),
  displayName: z.string().optional(),
  userName: z.string().min(1, 'Nome do responsável é obrigatório'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().min(1, 'Celular é obrigatório'),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

export type FormType = z.infer<typeof schema>
