import { z } from 'zod'
import { PersonType } from '@/types/subscription'

// Schema base para pessoa física
const individualSchema = z.object({
  personType: z.literal('individual' as PersonType),
  responsibleName: z.string().min(1, 'Nome do responsável é obrigatório'),
  responsibleCpf: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  mobile: z.string().min(1, 'Celular é obrigatório'),
})

// Schema base para pessoa jurídica
const companySchema = z.object({
  personType: z.literal('company' as PersonType),
  companyName: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().min(14, 'CNPJ deve ter pelo menos 14 caracteres'),
  responsibleName: z.string().min(1, 'Nome do responsável é obrigatório'),
  responsibleCpf: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres'),
  email: z.string().email('E-mail inválido').min(1, 'E-mail é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  mobile: z.string().min(1, 'Celular é obrigatório'),
})

// Schema para endereço
const addressSchema = z.object({
  zipCode: z.string().min(8, 'CEP deve ter 8 caracteres'),
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
})

// Schema principal do formulário
export const subscriptionFormSchema = z.discriminatedUnion('personType', [
  individualSchema.extend({
    address: addressSchema,
    additionalUsers: z.number().min(0).default(0),
    invoiceModule: z.boolean().default(false),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos do contrato',
    }),
  }),
  companySchema.extend({
    address: addressSchema,
    additionalUsers: z.number().min(0).default(0),
    invoiceModule: z.boolean().default(false),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos do contrato',
    }),
  }),
])

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

// Schema para validação de CEP
export const cepSchema = z
  .string()
  .min(8, 'CEP deve ter 8 caracteres')
  .max(9, 'CEP deve ter no máximo 9 caracteres')
  .regex(/^\d{5}-?\d{3}$/, 'CEP deve estar no formato 00000-000')

// Schema para validação de CPF
export const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF deve ter no máximo 14 caracteres')
  .regex(
    /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
    'CPF deve estar no formato 000.000.000-00',
  )

// Schema para validação de CNPJ
export const cnpjSchema = z
  .string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ deve ter no máximo 18 caracteres')
  .regex(
    /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/,
    'CNPJ deve estar no formato 00.000.000/0000-00',
  )

// Schema para validação de telefone
export const phoneSchema = z
  .string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone deve ter no máximo 15 caracteres')
  .regex(
    /^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/,
    'Formato de telefone inválido',
  )
