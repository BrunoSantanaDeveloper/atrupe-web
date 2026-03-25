// Component Imports
import { Payroll } from './components/Payroll'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Folha de Pagamento',
  }
}

export default function PayrollPage({ searchParams }: SearchParamsType) {
  const month = searchParams.month || String(new Date().getMonth())
  const year = searchParams.year || String(new Date().getFullYear())

  return (
    <PermissionGate
      requireAll
      permissions={['financial:payroll:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a folha de pagamento.
        </div>
      }
    >
      <Payroll searchParams={{ ...searchParams, month, year }} />
    </PermissionGate>
  )
}
