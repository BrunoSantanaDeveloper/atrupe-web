// Component Imports
import { Checkouts } from './components/Checkouts'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

export default function CheckoutsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial:checkout:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a frente de caixa.
        </div>
      }
    >
      <Checkouts searchParams={searchParams} />
    </PermissionGate>
  )
}
