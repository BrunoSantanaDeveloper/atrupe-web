import { Comparison } from './components/Comparison'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Comparativo', 'Base de custos') }
}

export default function ComparisonPage({ searchParams }: SearchParamsType) {
  return <Comparison searchParams={searchParams} />
}
