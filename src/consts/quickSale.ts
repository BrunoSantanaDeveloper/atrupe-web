// Situação da venda rápida depois de sair do orçamento (FC-11, FC-17,
// FC-19). Segue a convenção de cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'

export const quickSaleCheckoutStatusObj: { [key: string]: BadgeType } = {
  AT_CASH: { text: 'No caixa', variant: 'blueLight' },
  DOWN_PAYMENT: { text: 'Sinal pago', variant: 'warningLight' },
  FINISHED: { text: 'Concluída', variant: 'successLight' },
  CANCELLED: { text: 'Cancelada', variant: 'errorLight' },
}
