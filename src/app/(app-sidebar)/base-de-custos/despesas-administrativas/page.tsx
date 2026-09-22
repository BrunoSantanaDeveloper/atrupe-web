import { AdminExpenses } from './components/AdminExpenses'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return { title: 'Base de custos' }
}

export default function AdminExpensesPage({ searchParams }: SearchParamsType) {
  return <AdminExpenses searchParams={searchParams} />
}
