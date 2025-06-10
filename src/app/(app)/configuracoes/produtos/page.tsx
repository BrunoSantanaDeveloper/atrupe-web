// Component Imports
import { Products } from './components/Products'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Configurações de Produtos',
  }
}

export default function ProductsPage({ searchParams }: SearchParamsType) {
  return <Products searchParams={searchParams} />
}
