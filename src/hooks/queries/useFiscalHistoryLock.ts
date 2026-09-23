'use client'

import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fetchFiscalHistoryLock } from '@/actions/ownership'

export interface FiscalDocumentRef {
  createdAt?: string | Date | null
  invoicyConfigId?: string | null
}

/**
 * Notas emitidas sob o CNPJ anterior a uma transferência de titularidade:
 * ficam no ambiente como histórico, só para consulta. A regra é a do backend
 * (fiscal-history-lock.ts): pelo emissor quando a nota o registra, e pela
 * data da troca quando não — o backend recusa a manipulação de qualquer
 * jeito; a tela só esconde as ações e diz por quê.
 */
export function useFiscalHistoryLock() {
  const { data } = useQuery({
    queryKey: ['fiscal-history-lock'],
    queryFn: () => fetchFiscalHistoryLock(),
    staleTime: 5 * 60 * 1000,
  })
  const lock = data?.success ? (data.data ?? null) : null

  const isHistorical = useCallback(
    (document?: FiscalDocumentRef | null) => {
      if (!lock || !document) return false
      if (document.invoicyConfigId) {
        return lock.historicalEmitterIds.includes(document.invoicyConfigId)
      }
      return (
        !!document.createdAt &&
        new Date(document.createdAt).getTime() <
          new Date(lock.lockedBefore).getTime()
      )
    },
    [lock],
  )

  return { reason: lock?.reason ?? null, isHistorical }
}
