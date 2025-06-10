// Component Imports
import { Clients } from './components/Clients'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Clientes',
  }
}

export default function ClientsPage({ searchParams }: SearchParamsType) {
  return <Clients searchParams={searchParams} />
}
