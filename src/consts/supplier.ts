// Type
import { BadgeType } from '@/types/coreTypes'

export const supplierStatusObj: {
  [key: string]: BadgeType
} = {
  ACTIVE: { text: 'Ativo', variant: 'successLight' },
  INACTIVE: { text: 'Inativo', variant: 'neutralLight' },
}

export const supplierCategoryOptions = [
  { label: 'Suprimentos Gerais', value: 'Suprimentos Gerais' },
  { label: 'Equipamentos e Manutenção', value: 'Equipamentos e Manutenção' },
  { label: 'Serviços Terceirizados', value: 'Serviços Terceirizados' },
  { label: 'Logística e Transporte', value: 'Logística e Transporte' },
  {
    label: 'Serviços Administrativos/Gerais',
    value: 'Serviços Administrativos/Gerais',
  },
]
