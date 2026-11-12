'use client'

// A venda pendente de pagamento (PA-4 e PA-6, 12/11/2026): a faixa diz o
// que ela espera, quanto já entrou e onde se faz a baixa. Quando o título é
// pago, a venda vira ordem de serviço sozinha e a página passa a mostrá-la

// React
import { useEffect } from 'react'

// Next
import Link from 'next/link'

// UI
import { AlertBanner } from '@/components/ui/alert-banner'
import { Button } from '@/components/ui/button'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Hooks
import { usePaymentHold } from '@/hooks/queries/usePaymentHold'
import { usePermissions } from '@/hooks/usePermissions'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'

// Types
import type { QuotationType } from '@/types/sales/quotation'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

import { QUOTATION_DATA_QUERY_KEY } from './Quotation'

export function PaymentHoldBanner({ data }: { data: QuotationType }) {
  const queryClient = useQueryClient()
  const { hasAnyPermission } = usePermissions()
  const { data: hold } = usePaymentHold(data?.id)

  // Liberada (pela baixa ou na consulta): recarrega a venda aprovada
  useEffect(() => {
    if (hold && !hold.pending) {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    }
  }, [hold, queryClient])

  if (!hold?.pending) return null

  const amount = formatCurrencyToBrl(hold.amount ?? 0)
  const canSeeFinancial = hasAnyPermission([
    'financial:flow:view',
    'financial:receivable:view',
  ])

  return (
    <AlertBanner
      variant="warning"
      icon={IconAlertTriangle}
      className="rounded-lg border"
      title={
        hold.reason === 'PREPAYMENT'
          ? `⚠️ Pendente: aguarda o pagamento antecipado de ${amount}`
          : `⚠️ Pendente: aguarda a entrada de ${amount}`
      }
      description={
        <div className="space-y-1">
          <p>
            {hold.reason === 'PREPAYMENT'
              ? 'Este cliente exige pagamento antecipado. A venda vira ordem de serviço, e entra na produção, quando o total for recebido no financeiro.'
              : 'A venda passava do limite de crédito do cliente e foi aprovada com entrada. Ela vira ordem de serviço quando a entrada for recebida no financeiro.'}
          </p>
          <p>{`Recebido até agora: ${formatCurrencyToBrl(hold.paid)} de ${amount}.`}</p>
          {hold.since ? (
            <p>{`Aprovada com pendência em ${formatToLocaleDate(hold.since)}.`}</p>
          ) : null}
          <p>
            Para mudar a venda, volte para digitação. Para desistir, rejeite: o
            título ⚠️ Pendência é cancelado junto.
          </p>
        </div>
      }
      action={
        canSeeFinancial ? (
          <Button type="button" size="sm" variant="neutralOutline" asChild>
            <Link href="/financeiro/a-receber?pendency=true">
              Ver no financeiro
            </Link>
          </Button>
        ) : null
      }
    />
  )
}
