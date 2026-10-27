'use client'

// O cliente do orçamento está bloqueado no limite de crédito? (decisão de
// 24/10/2026: o orçamento pode ser montado, mas não aprova, não vira ordem
// de serviço nem gera cobrança). Lê a mesma conta do crédito que a faixa
// do orçamento usa; vale independentemente da data de corte do servidor.

import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'
import type { QuotationType } from '@/types/sales/quotation'

export function useClientBlocked(data?: QuotationType | null) {
  const { data: credit } = useQuotationCredit(
    data?.id,
    !!data?.client?.id,
    `blocked|${data?.client?.id ?? ''}`,
  )
  return !!credit?.applies && !!credit?.blockClient
}
