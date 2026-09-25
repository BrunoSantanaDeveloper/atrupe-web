'use client'

// O orçamento quando ele é uma venda rápida. É o mesmo orçamento (VR-3), com
// duas diferenças: no lugar das condições de pagamento entra o recebimento
// (FC-1, VR-5), e depois de enviada ou cobrada a venda trava (FC-11) e a tela
// passa a mostrar onde ela está.

// Next
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'

// Components
import { QuotationSummary } from './Summary'
import { QuotationDelivery } from './Delivery'
import { QuotationItems } from './QuotationItems'
import { QuotationActions } from './QuotationActions'
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  useQuickSale,
  QuickSaleStatusCard,
  QuickSaleCheckoutCard,
  QuickSaleCheckoutButton,
} from './QuickSaleCheckout'

// Contexts
import { QuotationProvider } from '@/contexts/quotationContext'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Consts
import { quotationsStatusObj } from '@/consts/quotations'

// Icons
import { IconExternalLink } from '@tabler/icons-react'

interface Props {
  data: QuotationType
  previousUrl: string
}

export function QuickSaleQuotation({ data, previousUrl }: Props) {
  const sale = useQuickSale(data)
  const { checkout } = sale

  // Enviar é aprovar (FC-12): para a tela, a venda que saiu é uma venda
  // aprovada, e os itens ficam só para leitura, pelas mesmas regras que já
  // valem para o orçamento aprovado
  const locked = !!checkout || data.status === 'APPROVED'
  const view = locked ? { ...data, status: 'APPROVED' } : data

  const topbar = (
    <Topbar
      title={`Venda rápida #${data?.serie?.quotation || ''}-${data?.serie?.code || ''}`}
      supportText={data?.client?.name || ''}
      previousPage={previousUrl}
      badge={
        quotationsStatusObj[view.status] || {
          text: 'Desconhecido',
          variant: 'neutralLight',
        }
      }
      label="Venda Rápida"
      primaryCta={
        data?.orderId ? (
          <Button type="button" variant="neutralOutline" asChild>
            <Link href={`/vendas/ordens-de-servico/${data.orderId}`}>
              Ver ordem de serviço
              <IconExternalLink size={20} className="ml-2" />
            </Link>
          </Button>
        ) : undefined
      }
    />
  )

  if (locked) {
    return (
      <PermissionGate permissions={['sale:quotation:view']}>
        <div className="space-y-5">
          {topbar}
          <div className="space-y-3">
            {checkout && (
              <QuickSaleStatusCard sale={sale} checkout={checkout} />
            )}
            <QuotationSummary data={view} />
            <QuotationProvider>
              <QuotationItems data={view} />
            </QuotationProvider>
            <QuotationDelivery quotationData={view} />
          </div>
        </div>
      </PermissionGate>
    )
  }

  return (
    <PermissionGate permissions={['sale:quotation:view']}>
      <div className="space-y-5">
        {topbar}
        <div className="space-y-3">
          <QuotationActions
            data={data}
            primaryAction={<QuickSaleCheckoutButton sale={sale} />}
          />
          <QuotationSummary data={data} />
          <QuotationProvider>
            <QuotationItems data={data} />
          </QuotationProvider>
          <QuotationDelivery quotationData={data} />
          {/* O fechamento da venda fica depois dos itens, como o total de um
              carrinho: é o último gesto do vendedor */}
          <QuickSaleCheckoutCard sale={sale} />
        </div>
      </div>
    </PermissionGate>
  )
}
