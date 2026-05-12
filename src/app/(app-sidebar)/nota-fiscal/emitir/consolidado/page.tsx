import { Metadata } from 'next'
import { Suspense } from 'react'

import { PermissionGate } from '@/components/common/PermissionGate'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { IssueConsolidatedInvoiceForm } from './components/IssueConsolidatedInvoiceForm'

export const metadata: Metadata = {
  title: 'Emissao consolidada de NF-e',
  description: 'Emissao de Nota Fiscal Eletronica consolidada',
}

interface Props {
  searchParams: {
    orders?: string
  }
}

export default async function IssueConsolidatedInvoicePage({
  searchParams,
}: Props) {
  const orderIds =
    searchParams.orders
      ?.split(',')
      .map((orderId) => orderId.trim())
      .filter(Boolean) || []

  return (
    <FiscalModuleGate>
      <PermissionGate
        permissions={['nota_fiscal:emitir:create']}
        fallback={
          <div className="p-4">
            Voce nao tem permissao para emitir nota fiscal.
          </div>
        }
      >
        <Suspense fallback={null}>
          <IssueConsolidatedInvoiceForm orderIds={orderIds} />
        </Suspense>
      </PermissionGate>
    </FiscalModuleGate>
  )
}
