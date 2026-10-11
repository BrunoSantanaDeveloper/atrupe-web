import { AdminExpenses } from './components/AdminExpenses'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Despesas administrativas', 'Base de custos') }
}

export default function AdminExpensesPage({ searchParams }: SearchParamsType) {
  return <AdminExpenses searchParams={searchParams} />
}
