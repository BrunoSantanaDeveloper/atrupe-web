// lib/schema.ts
import { z } from 'zod'

export const companySchema = z.object({
  general: z.object({
    legalName: z.string().min(1, 'Razão social é obrigatória'),
    name: z.string(),
    cnpj: z.string(),
    stateRegistration: z.string().optional(),
    municipalRegistration: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    siteUrl: z.string().optional(),
    phone: z.string().min(1, 'Telefone é obrigatório'),
    mobile: z.string().optional(),
  }),
  address: z.object({
    zipcode: z.string(),
    state: z.string(),
    city: z.string(),
    neighborhood: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
  }),
  // .url('URL do logo inválida')
  personalization: z.object({
    logoUrl: z.string().optional().nullable(),
    favIconUrl: z.string().optional().nullable(),
    textsBeforeItems: z.string().optional(),
    textsAfterItems: z.string().optional(),
  }),
  socialNetworks: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  fiscal: z.object({
    cnae: z.string().optional(),
    accessKey: z.string().optional(),
    certificateType: z
      .literal('A1')
      .or(z.literal('A3'))
      .or(z.literal(''))
      .optional(),
    certificateDescription: z.string().optional(),
    certificatePassword: z.string().optional(),
    certificate: z.string().optional(),
    certificateName: z.string().optional(),
    certificateLastUpload: z.string().optional(),
  }),
})
export type CompanyFormType = z.infer<typeof companySchema>

// Valores padrão
export const defaultValues: CompanyFormType = {
  general: {
    legalName: '',
    name: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    email: '',
    siteUrl: '',
    phone: '',
    mobile: '',
  },
  address: {
    zipcode: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
  },
  personalization: {
    logoUrl: '',
    favIconUrl: '',
    textsBeforeItems: '',
    textsAfterItems: '',
  },
  socialNetworks: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
  fiscal: {
    cnae: '',
    accessKey: '',
    certificateType: '',
    certificateDescription: '',
    certificatePassword: '',
    certificateLastUpload: '',
  },
}

// Definição de tipos para o endereço
interface Address {
  zipcode: string | null
  state: string | null
  city: string | null
  neighborhood: string | null
  street: string | null
  number: string | null
  complement: string | null
}

// Definição de tipos para a personalização
interface Personalization {
  logoUrl: string | null
  favIconUrl: string | null
  textsBeforeItems: string | null
  textsAfterItems: string | null
}

// Definição de tipos para redes sociais
interface SocialNetworks {
  instagram: string | null
  facebook: string | null
  linkedin: string | null
}

// Definição de tipos para as informações gerais
interface General {
  name: string
  legalName: string
  stateRegistration: string | null
  municipalRegistration: string | null
  cnpj: string
  email: string | null
  siteUrl: string | null
  phone: string | null
  mobile: string | null
}

// Definição de tipos para o fiscal
interface Fiscal {
  cnae: string | null
  accessKey: string | null
  certificateType: 'A1' | 'A3' | '' | null
  certificateDescription: string | null
  certificatePassword: string | null
  certificate: string | null
  certificateName: string | null
  certificateLastUpload: string | null
}

// Definição de tipos para cada item de dados
export interface ICompanyData {
  id: string
  principal?: boolean
  isActive: boolean
  general: General
  address: Address | null
  personalization: Personalization
  socialNetworks: SocialNetworks | null
  fiscal: Fiscal | null
}

// Definição de tipos para o objeto principal
export interface ICompanyResponse {
  total: number
  lastPage: number
  data: ICompanyData[]
}
