// Component Imports
import { Suppliers } from './components/Suppliers'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Fornecedores',
  }
}

export default function SuppliersPage({ searchParams }: SearchParamsType) {
  return <Suppliers searchParams={searchParams} />
}
