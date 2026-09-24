// Cálculo dos itens do orçamento (areas/08-composicao.md §3.9). Fica fora das
// actions porque arquivos 'use server' só exportam funções assíncronas.

// Types
import type { QuotationItem } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/composicao/types'

// Enquanto o item não tem composição, vale o preço do produto; a partir da
// primeira linha, o preço é a soma da composição (CP-16)
export const itemUnitPrice = (item: QuotationItem) =>
  item.price ?? item.lines.reduce((sum, line) => sum + line.price, 0)

export const itemCost = (item: QuotationItem) =>
  item.lines.reduce((sum, line) => sum + line.cost, 0) * item.quantity

export const itemTotal = (item: QuotationItem) =>
  Math.max(0, itemUnitPrice(item) * item.quantity - item.discount)

export const quotationTotal = (items: QuotationItem[]) =>
  items.reduce((sum, item) => sum + itemTotal(item), 0)
