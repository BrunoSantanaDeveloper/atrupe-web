// Type
import { BadgeType } from '@/types/coreTypes'

export const clientStatusObj: {
  [key: string]: BadgeType
} = {
  PROSPECT: { text: 'Pré-Cadastro', variant: 'warningLight' },
  ACTIVE: { text: 'Regularizado', variant: 'successLight' },
  INACTIVE: { text: 'Inativo', variant: 'neutralLight' },
}

export const supplierStatusObj: {
  [key: string]: BadgeType
} = {
  ACTIVE: { text: 'Ativo', variant: 'successLight' },
  INACTIVE: { text: 'Inativo', variant: 'neutralLight' },
}

export const clientCategoryOptions = [
  { label: 'Comércio', value: 'Comércio' },
  { label: 'Indústria', value: 'Indústria' },
  { label: 'Serviços', value: 'Serviços' },
  {
    label: 'Agências de Publicidade e Marketing',
    value: 'Agências de Publicidade e Marketing',
  },
  { label: 'Estúdios de Fotografia', value: 'Estúdios de Fotografia' },
  { label: 'Arquiteto/Decorador', value: 'Arquiteto/Decorador' },
  { label: 'Saúde', value: 'Saúde' },
  { label: 'Terceirizados', value: 'Terceirizados' },
]
