import { Metadata } from 'next'
import { Suspense } from 'react'

// Components
import { Quotation } from './components/Quotation'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Orçamento',
  description: 'Orçamento',
}

export default async function QuotationPage({ params }: ParamsType) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view', 'sale:quotation:edit']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar este orçamento.
        </div>
      }
    >
      <Suspense fallback={null}>
        <Quotation id={params.quotationId} />
      </Suspense>
    </PermissionGate>
  )
}
