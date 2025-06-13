// Component Imports
import { Clients } from './components/Clients'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Clientes',
  }
}

export default function ClientsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['register:client:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a página de clientes.
        </div>
      }
    >
      <Clients searchParams={searchParams} />
    </PermissionGate>
  )
}
