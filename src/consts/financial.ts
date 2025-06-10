// Type
import { BadgeType } from '@/types/coreTypes'

export const financialFlowStatusObj: {
  [key: string]: BadgeType
} = {
  APPROVED: { text: 'Aprovado', variant: 'light' },
  PENDING: { text: 'Pendente', variant: 'warningLight' },
  CANCELED: { text: 'Cancelado', variant: 'errorLight' },
  BILLING_PENDING: { text: 'Faturamento Pendente', variant: 'warningLight' },
  BILLED: { text: 'Faturado', variant: 'successLight' },
  PAID: { text: 'Pago', variant: 'successLight' },
}
