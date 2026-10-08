'use client'

import { Suspense } from 'react'
import { ClientData } from './components/ClientData'
import { useClientById } from '@/hooks/queries/useClient'
import { PermissionGate } from '@/components/common/PermissionGate'
import { IconLoader2 } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

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
      <Suspense
        fallback={
          <Icon icon={IconLoader2} size="lg" className="animate-spin p-8" />
        }
      >
        <ClientData data={data} />
      </Suspense>
    </PermissionGate>
  )
}
