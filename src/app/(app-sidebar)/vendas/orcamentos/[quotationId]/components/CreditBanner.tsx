'use client'

// A barra de aviso do crédito do cliente no orçamento (PO, 13/10/2026):
// incluir o cliente e concluir só avisam; a aprovação é recusada com cliente
// bloqueado ou condição fora das permitidas.
//
// Todo bloqueio diz o caminho (12/11/2026): o limite estourado diz quanto
// passa e oferece a entrada da diferença ("Usar R$ X como entrada"), que a
// venda precisa receber antes de virar ordem de serviço (PA-2). O cliente
// com "Exigir pagamento antecipado" é avisado do que a aprovação fará (PA-3)

// React
import { useState } from 'react'

// UI
import { AlertBanner } from '@/components/ui/alert-banner'
import { Button } from '@/components/ui/button'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { PaymentConditionsDialog } from './QuotationActions/PaymentConditions'

// Hooks
import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'

// Types
import type { QuotationType } from '@/types/sales/quotation'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Icons
import { IconAlertTriangle, IconCash } from '@tabler/icons-react'

export function CreditBanner({ data }: { data: QuotationType }) {
  const [openPayment, setOpenPayment] = useState(false)
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

  if (!credit?.applies) return null

  const limitIssue = credit.issues?.find(
    (issue) => issue.code === 'CREDIT_LIMIT_EXCEEDED',
  )
  const registryIssues = (credit.issues ?? []).filter(
    (issue) => issue.code !== 'CREDIT_LIMIT_EXCEEDED',
  )
  const suggested = limitIssue?.suggestedDownPayment ?? 0
  // Lista Lite 19/11, item 3: a "entrada" que é a venda inteira é pagamento
  // integral à vista, e o texto diz isso
  const fullPayment = !!limitIssue?.fullPayment

  // Sem bloqueio: o que a aprovação fará, se a venda vai esperar o pagamento
  if (!credit.issues?.length) {
    const hold = credit.hold
    if (!hold && !credit.requirePrepayment) return null
    const amount = hold ? formatCurrencyToBrl(hold.amount) : ''
    return (
      <AlertBanner
        variant="warning"
        icon={IconAlertTriangle}
        className="rounded-lg border"
        title={
          hold?.reason === 'CREDIT_LIMIT'
            ? `${amount} precisam ser pagos antes`
            : 'Este cliente exige pagamento antecipado'
        }
        description={
          hold?.reason === 'CREDIT_LIMIT'
            ? `É o que passa do limite de crédito do cliente: o que vence hoje (a entrada ou o pagamento à vista) só conta como pago depois de recebido. Ao aprovar, a venda fica na aba ⚠️ Pendente até ${amount} serem recebidos no financeiro; depois, vira ordem de serviço.`
            : hold
              ? `Ao aprovar, a venda fica na aba ⚠️ Pendente e o financeiro recebe ${amount} num título marcado ⚠️ Pendência. Quando ele for baixado, a venda vira ordem de serviço.`
              : 'A venda só vira ordem de serviço depois de paga: ao aprovar, ela fica na aba ⚠️ Pendente até o financeiro baixar o pagamento.'
        }
      />
    )
  }

  return (
    <>
      <AlertBanner
        variant="error"
        icon={IconAlertTriangle}
        className="rounded-lg border"
        title={
          registryIssues.length
            ? 'A aprovação está bloqueada pelo crédito do cliente'
            : fullPayment
              ? 'Atenção! Limite de crédito excedido'
              : 'Esta venda passa do limite de crédito do cliente'
        }
        description={
          <div className="space-y-1">
            {credit.issues.map((issue) => (
              <p key={issue.code}>{issue.message}</p>
            ))}
            {registryIssues.length ? (
              <p>
                Quem pode alterar o limite ou desbloquear o cliente faz isso no
                cadastro do cliente.
              </p>
            ) : null}
          </div>
        }
        action={
          suggested > 0 && !registryIssues.length ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <Button
                type="button"
                size="sm"
                LeftIcon={IconCash}
                onClick={() => setOpenPayment(true)}
              >
                {fullPayment
                  ? `Receber ${formatCurrencyToBrl(suggested)} à vista`
                  : `Usar ${formatCurrencyToBrl(suggested)} como entrada`}
              </Button>
            </PermissionGate>
          ) : null
        }
      />
      {suggested > 0 ? (
        <PaymentConditionsDialog
          quotationData={data}
          open={openPayment}
          onOpenChange={setOpenPayment}
          hideTrigger
          suggestedDownPayment={openPayment ? suggested : undefined}
          fullPayment={fullPayment}
          submitLabel="Salvar a entrada"
        />
      ) : null}
    </>
  )
}
