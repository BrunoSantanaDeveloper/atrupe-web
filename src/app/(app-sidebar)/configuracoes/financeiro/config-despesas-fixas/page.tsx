import { FixedExpenses } from './components/FixedExpenses'
import { SearchParamsType } from '@/types/coreTypes'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Despesas fixas - Config.',
  }
}

export default function scheduledExpensePage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={[
        'financial_settings:fixed_expenses:view',
        'values:values:view',
      ]}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de despesas
          fixas.
        </div>
      }
    >
      <FixedExpenses searchParams={searchParams} />
    </PermissionGate>
  )
}
