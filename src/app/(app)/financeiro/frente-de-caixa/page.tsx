// Component Imports
import { Checkouts } from './components/Checkouts'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

export default function CheckoutsPage({ searchParams }: SearchParamsType) {
  return <Checkouts searchParams={searchParams} />
}
