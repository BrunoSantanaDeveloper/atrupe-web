import { Depreciation } from './components/Depreciation'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Base de custos' }
}

export default function DepreciationPage({ searchParams }: SearchParamsType) {
  return <Depreciation searchParams={searchParams} />
}
