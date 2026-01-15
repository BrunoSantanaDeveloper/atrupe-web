// Component Imports
import { Checkout } from './components/Checkout'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { ParamsType, SearchParamsType } from '@/types/coreTypes'

interface Props extends SearchParamsType, ParamsType {}

export default function PDVPage({ searchParams, params }: Props) {
  return (
    <PermissionGate
      permissions={['financial:pdv:edit', 'values:values:view']}
      fallback={
        <div className="p-4">Você não tem permissão para visualizar o PDV.</div>
      }
    >
      <Checkout searchParams={searchParams} id={params.pdvId} />
    </PermissionGate>
  )
}
