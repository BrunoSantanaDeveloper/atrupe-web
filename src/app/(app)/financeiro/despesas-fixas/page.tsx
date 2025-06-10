// Component Imports
import { FixedExpenses } from './components/FixedExpenses'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Despesas Fixas',
  }
}

export default function FixedExpensesPage({ searchParams }: SearchParamsType) {
  return <FixedExpenses searchParams={searchParams} />
}
