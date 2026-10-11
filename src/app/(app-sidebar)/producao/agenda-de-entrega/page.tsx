// Component Imports
import { DeliverySchedule } from './components/DeliverySchedule'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Agenda de entrega',
  }
}

export default function DeliverySchedulePage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['production:delivery_schedule:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a agenda de entrega.
        </div>
      }
    >
      <DeliverySchedule searchParams={searchParams} />
    </PermissionGate>
  )
}
