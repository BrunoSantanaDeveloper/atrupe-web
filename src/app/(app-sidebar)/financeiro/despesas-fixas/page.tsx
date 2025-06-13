// Component Imports
import { FixedExpenses } from './components/FixedExpenses'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Despesas Fixas',
  }
}

export default function FixedExpensesPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial:fixed_expense:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as despesas fixas.
        </div>
      }
    >
      <FixedExpenses searchParams={searchParams} />
    </PermissionGate>
  )
}
