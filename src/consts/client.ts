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
