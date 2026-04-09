import { Metadata } from 'next'
import { Suspense } from 'react'

// Components
import { IssueNfseForm } from './components/IssueNfseForm'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Emissão de NFS-e',
  description: 'Emissão de Nota Fiscal de Serviço Eletrônica',
}

export default async function IssueNfsePage({ params }: ParamsType) {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create']}
      fallback={
        <div className="p-4">
          Você não tem permissão para emitir nota fiscal de serviço.
        </div>
      }
    >
      <Suspense fallback={null}>
        <IssueNfseForm id={params.orderId} />
      </Suspense>
    </PermissionGate>
  )
}
