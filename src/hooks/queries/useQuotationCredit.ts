'use client'

// A conferência de crédito do orçamento (decisões do PO de 13 e 14/10/2026):
// cliente bloqueado, condição fora das permitidas e limite. Escolher o
// cliente e concluir só avisam; a aprovação recusa. Só com o recurso
// `credit_limit_enforcement` no plano (LITE em diante)

import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

export type CreditIssue = {
  code: 'CLIENT_BLOCKED' | 'CONDITION_NOT_ALLOWED' | 'CREDIT_LIMIT_EXCEEDED'
  message: string
  conditions?: { id: string; name: string }[]
}

// Os valores (centavos) só vêm para quem vê valores
export type QuotationCredit = {
  applies: boolean
  // A aprovação já é recusada (a data de corte chegou); antes, só avisa
  enforcing: boolean
  blockClient: boolean
  limit?: number | null
  openBalance?: number
  pendingApproved?: number
  used?: number
  available?: number | null
  requested?: number
  issues: CreditIssue[]
}

export const QUOTATION_CREDIT_QUERY_KEY = 'quotation-credit'

/**
 * `version` muda quando o que a conta lê muda (cliente, condição, valor,
 * situação): a consulta é refeita sem esperar o cache.
 */
export function useQuotationCredit(
  quotationId: string | undefined,
  enabled: boolean,
  version: string,
) {
  const { hasFeature } = usePlanFeatures()
  const active =
    enabled && !!quotationId && hasFeature('credit_limit_enforcement')

  return useQuery({
    queryKey: [QUOTATION_CREDIT_QUERY_KEY, quotationId, version],
    queryFn: async () => {
      const result = await getItem({
        route: `/sale/quotation/${quotationId}/credit`,
      })
      return result.success ? ((result.data ?? null) as QuotationCredit) : null
    },
    enabled: active,
    staleTime: 30_000,
  })
}
