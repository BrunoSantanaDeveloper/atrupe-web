'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ClientData } from './components/ClientData'
import { useClientById } from '@/hooks/queries/useClient'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientDataPage({ params }: Props) {
  const { data } = useClientById({ id: params.id })
  return (
    <PermissionGate
      permissions={['register:client:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os dados do cliente.
        </div>
      }
    >
      <Suspense fallback={<Loader2 className="size-16 animate-spin p-8" />}>
        <ClientData data={data} />
      </Suspense>
    </PermissionGate>
  )
}
