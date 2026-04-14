import { Metadata } from 'next'
import { Suspense } from 'react'

// Components
import { IssueInvoiceForm } from './components/IssueInvoiceForm'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Emissão de NF-e',
  description: 'Emissão de Nota Fiscal Eletrônica',
}

export default async function IssueInvoicePage({ params }: ParamsType) {
  return (
    <FiscalModuleGate>
      <PermissionGate
        permissions={['nota_fiscal:emitir:create']}
        fallback={
          <div className="p-4">
            Você não tem permissão para emitir nota fiscal.
          </div>
        }
      >
        <Suspense fallback={null}>
          <IssueInvoiceForm id={params.orderId} />
        </Suspense>
      </PermissionGate>
    </FiscalModuleGate>
  )
}
