// Type
import { BadgeType } from '@/types/coreTypes'

export const bankAccountStatusObj: {
  [key: string]: BadgeType
} = {
  ACTIVE: { text: 'Ativo', variant: 'light' },
  INACTIVE: { text: 'Inativo', variant: 'errorLight' },
}

export const bankAccountEnabledObj: {
  [key: string]: BadgeType
} = {
  ENABLED: { text: 'Habilitado', variant: 'light' },
  DISABLED: { text: 'Desabilitado', variant: 'errorLight' },
}
