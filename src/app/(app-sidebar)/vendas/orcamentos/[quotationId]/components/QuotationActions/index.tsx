'use client'

// React
import { useState, type ReactNode } from 'react'

// Components
import { SetClient } from './SetClient'
import { OpenQuotation } from './OpenQuotation'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { RejectQuotation } from './RejectQuotation'
import { DiscardQuickSale } from './DiscardQuickSale'
import { FinishQuotation } from './FinishQuotation'
import { ApproveQuotation } from './ApproveQuotation'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { useRouter } from '@/hooks/useRouter'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'

// Type
import { QuotationType } from '@/types/sales/quotation'

// Icons
import { IconChartPie, IconPrinter } from '@tabler/icons-react'

interface Props {
  data: QuotationType
  // Substitui concluir e aprovar. É o caso da venda rápida, em que o vendedor
  // não monta condição de pagamento: ele cobra ou envia ao caixa (FC-1)
  primaryAction?: ReactNode
  // Sem "Prévia da proposta": a venda rápida sem cliente informado tem
  // comprovante, não proposta (decisão do produto, 26/10/2026)
  hidePrint?: boolean
}

export function QuotationActions({ data, primaryAction, hidePrint }: Props) {
  const [openPrint, setOpenPrint] = useState(false)
  const router = useRouter()
  const { hasFeature } = usePlanFeatures()

  const status = {
    open: data?.status === 'OPEN',
    done: data?.status === 'DONE',
    overdue: data?.status === 'OVERDUE',
    rejected: data?.status === 'REJECTED',
    // Aprovada à espera do pagamento antecipado (PA-4): volta para
    // digitação ou é rejeitada; a aprovação de fato é a baixa no financeiro
    pending: data?.status === 'PENDING_PAYMENT',
  }

  // A venda rápida não tem Digitação, Aguardando e Rejeitado: aprova direto
  // da digitação ou é descartada (11/11/2026)
  const quickSale = !!data?.quickSale
  const canApprove = status.done || status.overdue || (quickSale && status.open)
  const canReject =
    !quickSale &&
    (status.open || status.done || status.overdue || status.pending)
  const canDiscard = quickSale && status.open
  const canFinish = status.open
  const canOpen =
    status.rejected || status.done || status.overdue || status.pending
  const canSetClient = status.open && quickSale

  // Informar o cliente é o próximo passo da venda rápida: vem primeiro
  const setClient = canSetClient ? (
    <PermissionGate permissions={['sale:quotation:edit']}>
      <SetClient quotationId={data.id} />
    </PermissionGate>
  ) : null

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          {setClient}
          {!hidePrint && (
            <PermissionGate permissions={['sale:quotation:view']}>
              <CustomButton
                icon={IconPrinter}
                title={status.done ? 'Proposta' : 'Prévia da proposta'}
                onClick={() => setOpenPrint(true)}
              />
            </PermissionGate>
          )}
          {/* Custo e margem da venda (ORC-8): permissão própria, valores e
              a base de custos */}
          {hasFeature(FEATURES.COSTS.COST_BASE) && (
            <PermissionGate
              requireAll
              permissions={['sale:quotation_result:view', 'values:values:view']}
            >
              <CustomButton
                icon={IconChartPie}
                title="Resultado previsto"
                onClick={() =>
                  router.push(`/vendas/orcamentos/${data.id}/resultado`)
                }
              />
            </PermissionGate>
          )}
          {canOpen ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <OpenQuotation data={data} />
            </PermissionGate>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4">
          {canReject ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <RejectQuotation data={data} />
            </PermissionGate>
          ) : null}
          {canDiscard ? (
            <PermissionGate permissions={['sale:quotation:delete']}>
              <DiscardQuickSale data={data} />
            </PermissionGate>
          ) : null}
          {primaryAction ?? (
            <>
              {!quickSale && !status.pending ? (
                <PermissionGate permissions={['sale:quotation:edit']}>
                  <FinishQuotation data={data} canFinish={canFinish} />
                </PermissionGate>
              ) : null}
              {canApprove ? (
                <PermissionGate permissions={['sale:order:create']}>
                  <ApproveQuotation data={data} />
                </PermissionGate>
              ) : null}
            </>
          )}
        </div>
      </div>
      <PrintQuotationDialog
        type="quotation"
        quotationId={data?.id}
        open={openPrint}
        onOpenChange={setOpenPrint}
      />
    </>
  )
}
