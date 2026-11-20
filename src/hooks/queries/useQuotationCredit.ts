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
  // No limite (PA-2): quanto passa e a entrada que resolve (centavos)
  excess?: number
  suggestedDownPayment?: number
  // A entrada cobre toda a parte a prazo: é pagamento integral à vista
  fullPayment?: boolean
}

/**
 * A aprovação, se feita agora, deixa a venda pendente deste valor (PA,
 * 12/11/2026): o total (cliente com pagamento antecipado) ou a entrada que
 * faz a venda caber no limite.
 */
export type PaymentHoldPreview = {
  reason: 'PREPAYMENT' | 'CREDIT_LIMIT'
  amount: number
  // Só a entrada nasce na pendência, ou a venda inteira
  scope?: 'DOWN_PAYMENT' | 'ALL'
} | null

// Os valores (centavos) só vêm para quem vê valores
export type QuotationCredit = {
  applies: boolean
  // A aprovação já é recusada (a data de corte chegou); antes, só avisa
  enforcing: boolean
  blockClient: boolean
  // "Exigir pagamento antecipado" no cadastro do cliente (PA-1)
  requirePrepayment?: boolean
  limit?: number | null
  openBalance?: number
  pendingApproved?: number
  used?: number
  available?: number | null
  requested?: number
  // As formas liberadas para o cliente; nulo, todas
  allowedConditionIds?: string[] | null
  issues: CreditIssue[]
  hold?: PaymentHoldPreview
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
