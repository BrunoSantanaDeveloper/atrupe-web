// Components
import { FinancialReport } from './components/FinancialReport'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Relatório financeiro',
  }
}

export default function FinancialReportPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['reports:financial:view', 'values:values:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="type-card-title mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o relatório financeiro.
          </p>
        </div>
      }
    >
      <FinancialReport searchParams={searchParams} />
    </PermissionGate>
  )
}
