// Itens do orçamento cujo produto foi inativado (PAD-7, regra do Maicol em
// 05/10/2026): o orçamento aberto fica marcado e não pode ser aprovado até o
// item ser trocado ou retirado. O detalhe do orçamento traz `product.isActive`
// em cada item (Fase 4.1), sem consulta por produto, e o /approve recusa do
// lado do servidor (Fase 4.3), devolvendo também os itens com parte inativa
// numa linha acrescentada.

import { useMemo } from 'react'

import type { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Só enquanto o orçamento ainda pode ser aprovado; aprovado ou rejeitado, a
// marca não muda nada
const WATCHED = ['OPEN', 'DONE', 'OVERDUE']

const isInactive = (item: QuotationItemType) => item.product?.isActive === false

export function useInactiveQuotationItems(data?: QuotationType) {
  const watched = WATCHED.includes(data?.status || '')

  const inactiveItems = useMemo<QuotationItemType[]>(
    () => (watched ? (data?.quotationItems || []).filter(isInactive) : []),
    [data, watched],
  )

  return {
    inactiveItems,
    hasInactive: inactiveItems.length > 0,
    isItemInactive: (item: QuotationItemType) => watched && isInactive(item),
    isLoading: false,
  }
}
