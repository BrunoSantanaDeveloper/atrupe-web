import { FixedExpenses } from './components/FixedExpenses'
import { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Despesas fixas - Config.',
  }
}

export default function scheduledExpensePage({
  searchParams,
}: SearchParamsType) {
  return <FixedExpenses searchParams={searchParams} />
}
