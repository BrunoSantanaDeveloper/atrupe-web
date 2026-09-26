// Situação da venda na fila da frente de caixa (FC-5). Segue a convenção de
// cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'

export const cashFrontClaimObj: { [key: string]: BadgeType } = {
  MINE: { text: 'Com você', variant: 'successLight' },
  OTHER: { text: 'Em outro caixa', variant: 'warningLight' },
  FREE: { text: 'Aguardando um caixa', variant: 'neutralLight' },
}

// Formas de faturar a venda revertida (FC-4): as do cliente autorizado
export const billingOptions = [
  { value: 'Faturamento mensal', label: 'Faturamento mensal' },
  { value: 'Boleto', label: 'Boleto' },
]
