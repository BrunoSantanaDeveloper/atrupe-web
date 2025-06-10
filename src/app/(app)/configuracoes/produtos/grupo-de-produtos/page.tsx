// Component Imports
import { ProductsGroup } from './components/ProductsGroup'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export default function ProductsGroupPage({ searchParams }: SearchParamsType) {
  return <ProductsGroup searchParams={searchParams} />
}
