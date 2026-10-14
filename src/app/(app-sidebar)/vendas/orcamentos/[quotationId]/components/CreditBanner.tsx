'use client'

// A barra de aviso do crédito do cliente no orçamento (PO, 13/10/2026):
// incluir o cliente e concluir só avisam; a aprovação é recusada com cliente
// bloqueado, condição fora das permitidas ou acima do limite

// UI
import { AlertBanner } from '@/components/ui/alert-banner'

// Hooks
import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'

// Types
import type { QuotationType } from '@/types/sales/quotation'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

export function CreditBanner({ data }: { data: QuotationType }) {
  const version = [
    data?.client?.id,
    data?.status,
    data?.totalValue,
    data?.updatedAt,
    data?.paymentConditions?.paymentCondition?.id,
    data?.paymentConditions?.installmentQty,
    data?.paymentConditions?.finalValue,
  ].join('|')
  const { data: credit } = useQuotationCredit(
    data?.id,
    !!data?.client?.id && data?.status !== 'APPROVED',
    version,
  )

  if (!credit?.applies || !credit.issues?.length) return null

  const exceeded = credit.issues.some(
    (issue) => issue.code === 'CREDIT_LIMIT_EXCEEDED',
  )
  // Sem a permissão de valores, os valores não vêm: fica só o motivo
  const amounts =
    exceeded &&
    typeof credit.limit === 'number' &&
    typeof credit.used === 'number' &&
    typeof credit.requested === 'number'
      ? `Limite ${formatCurrencyToBrl(credit.limit)} · já usado ${formatCurrencyToBrl(credit.used)} · esta venda ${formatCurrencyToBrl(credit.requested)}`
      : null

  return (
    <AlertBanner
      variant={credit.enforcing ? 'error' : 'warning'}
      icon={IconAlertTriangle}
      className="rounded-lg border"
      title={
        credit.enforcing
          ? 'A aprovação está bloqueada pelo crédito do cliente'
          : 'Atenção ao crédito do cliente'
      }
      description={
        <div className="space-y-1">
          {credit.issues.map((issue) => (
            <p key={issue.code}>{issue.message}</p>
          ))}
          {amounts ? <p>{amounts}</p> : null}
          <p>
            Quem pode alterar o limite ou desbloquear o cliente faz isso no
            cadastro do cliente.
          </p>
        </div>
      }
    />
  )
}
