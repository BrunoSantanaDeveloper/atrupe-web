// Type
import { BadgeType } from '@/types/coreTypes'

export const payrollStatusObj: {
  [key: string]: BadgeType
} = {
  OPEN: { text: 'Aberto', variant: 'blueLight' },
  CLOSED: { text: 'Fechado', variant: 'warningLight' },
  EMPTY: { text: 'Sem lançamento', variant: 'neutralLight' },
}

export const payrollItemTypeObj: {
  [key: string]: BadgeType
} = {
  INCREASE: { text: 'Acréscimo', variant: 'success' },
  DISCOUNT: { text: 'Desconto', variant: 'error' },
  ADVANCE: { text: 'Adiantamento', variant: 'orange' },
}
