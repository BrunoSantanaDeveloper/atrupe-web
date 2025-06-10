// Components
import { Quotations } from './components/Quotations'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Orçamentos',
  }
}

export default function QuotationsPage({ searchParams }: SearchParamsType) {
  return <Quotations searchParams={searchParams} />
}
