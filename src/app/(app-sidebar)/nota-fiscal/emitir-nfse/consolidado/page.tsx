import { Metadata } from 'next'
import { Suspense } from 'react'

import { PermissionGate } from '@/components/common/PermissionGate'
import { FiscalModuleGate } from '../../components/FiscalModuleGate'
import { IssueConsolidatedNfseForm } from './components/IssueConsolidatedNfseForm'

export const metadata: Metadata = {
  title: 'Emissão consolidada de NFS-e',
  description: 'Emissão de Nota Fiscal de Serviço Eletrônica consolidada',
}

interface Props {
  searchParams: {
    orders?: string
  }
}

export default async function IssueConsolidatedNfsePage({
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
            Você não tem permissão para emitir nota fiscal.
          </div>
        }
      >
        <Suspense fallback={null}>
          <IssueConsolidatedNfseForm orderIds={orderIds} />
        </Suspense>
      </PermissionGate>
    </FiscalModuleGate>
  )
}
