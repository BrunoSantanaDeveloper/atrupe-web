'use client'

// A venda pendente de pagamento (PA, 12/11/2026): quanto é exigido, quanto
// já entrou e os títulos "⚠️ Pendência". A consulta também libera a venda
// cujo título já foi pago (se a liberação da baixa falhou)

import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'

export type PaymentHold = {
  pending: boolean
  reason: 'PREPAYMENT' | 'CREDIT_LIMIT' | null
  // Centavos
  amount: number | null
  paid: number
  since: string | null
  releasedAt: string | null
  releaseNote: string | null
  releasedBy: string | null
  receivableIds: string[]
}

export const PAYMENT_HOLD_QUERY_KEY = 'payment-hold'

export function usePaymentHold(
  quotationId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: [PAYMENT_HOLD_QUERY_KEY, quotationId],
    queryFn: async () => {
      const result = await getItem({
        route: `/sale/quotation/${quotationId}/payment-hold`,
      })
      return result.success ? ((result.data ?? null) as PaymentHold) : null
    },
    enabled: enabled && !!quotationId,
    // A baixa é no financeiro, em outra tela: confere de tempos em tempos
    refetchInterval: 30_000,
  })
}
