// Component Imports
import { DeliverySchedule } from './components/DeliverySchedule'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Agenda de Entrega',
  }
}

export default function DeliverySchedulePage({
  searchParams,
}: SearchParamsType) {
  return <DeliverySchedule searchParams={searchParams} />
}
