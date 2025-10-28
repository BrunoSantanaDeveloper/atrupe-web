import * as z from 'zod'

// Schema base com campos comuns
const baseSchema = z.object({
  type: z.enum(['PERSON', 'COMPANY']),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.union([z.string().email('Email inválido'), z.literal('')]),
  category: z.string(),
  phone: z.string(),
  mobile: z.string(),
})

// Schema específico para Pessoa Física
const personSchema = baseSchema.extend({
  type: z.literal('PERSON'),
  rg: z.string(),
  cpf: z.string(),
})

// Schema específico para Pessoa Jurídica
const companySchema = baseSchema.extend({
  type: z.literal('COMPANY'),
  cnpj: z.string(),
  activity: z.string(),
  corporateName: z.string(),
})

// Schema usando discriminatedUnion
export const newClientSchema = z.discriminatedUnion('type', [
  personSchema,
  companySchema,
])

export type NewClientFormType = z.infer<typeof newClientSchema>

export const defaultValues: z.infer<typeof personSchema> = {
  type: 'PERSON',
  name: '',
  email: '',
  category: '',
  rg: '',
  cpf: '',
  phone: '',
  mobile: '',
}
