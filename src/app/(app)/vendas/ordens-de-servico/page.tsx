// Component Imports
import { Orders } from './components/Orders'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Ordens de Serviço',
  }
}

export default function OrdersPage({ searchParams }: SearchParamsType) {
  return <Orders searchParams={searchParams} />
}
