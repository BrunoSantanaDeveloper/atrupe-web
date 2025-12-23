// Components
import { FinancialReport } from './components/FinancialReport'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Relatório Financeiro',
  }
}

export default function FinancialReportPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial:flow:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="text-lg font-medium mb-2">Acesso restrito</h3>
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
