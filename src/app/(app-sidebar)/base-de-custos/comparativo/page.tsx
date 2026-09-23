import { Comparison } from './components/Comparison'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Base de custos' }
}

export default function ComparisonPage({ searchParams }: SearchParamsType) {
  return <Comparison searchParams={searchParams} />
}
