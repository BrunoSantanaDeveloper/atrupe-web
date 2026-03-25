// Components
import { FixedExpenses } from './components/FixedExpenses'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Despesas Fixas',
  }
}

export default function FixedExpensesPage({ searchParams }: SearchParamsType) {
  const month = searchParams.month || String(new Date().getMonth())
  const year = searchParams.year || String(new Date().getFullYear())

  return (
    <PermissionGate
      requireAll
      permissions={['financial:fixed_expense:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as despesas fixas.
        </div>
      }
    >
      <FixedExpenses searchParams={{ ...searchParams, month, year }} />
    </PermissionGate>
  )
}
