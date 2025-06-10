import * as z from 'zod'

export const newClientSchema = z.object({
  type: z.enum(['PERSON', 'COMPANY']),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z
    .union([z.string().email('Email inválido'), z.literal('')])
    .optional(),
  category: z.string(),
  rg: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  cnpj: z.string().optional(),
  activity: z.string().optional(),
  corporateName: z.string().optional(),
})

export type NewClientFormType = z.infer<typeof newClientSchema>

export const defaultPersonValues: Partial<NewClientFormType> = {
  type: 'PERSON',
  name: '',
  email: '',
  category: '',
  rg: '',
  cpf: '',
  phone: '',
  mobile: '',
}

export const defaultCompanyValues: Partial<NewClientFormType> = {
  type: 'COMPANY',
  name: '',
  email: '',
  category: '',
  cnpj: '',
  activity: '',
  corporateName: '',
  phone: '',
  mobile: '',
}
