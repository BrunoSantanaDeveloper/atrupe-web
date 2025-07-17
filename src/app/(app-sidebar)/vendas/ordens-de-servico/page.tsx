// Component Imports
import { Orders } from './components/Orders'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Ordens de Serviço',
  }
}

export default function OrdersPage({ searchParams }: SearchParamsType) {
  const defaultTab = 'producao'
  const status = searchParams.status || defaultTab

  return (
    <PermissionGate
      permissions={['sale:order:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a página de ordens de serviço.
        </div>
      }
    >
      <Orders searchParams={{ ...searchParams, status }} />
    </PermissionGate>
  )
}
