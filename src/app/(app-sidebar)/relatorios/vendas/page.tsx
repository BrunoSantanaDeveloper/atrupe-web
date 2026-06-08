// Components
import { SalesReport } from './components/SalesReport'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Relatório de Vendas',
  }
}

export default function SalesReportPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['reports:sales:view', 'values:values:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="text-lg font-medium mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o relatório de vendas.
          </p>
        </div>
      }
    >
      <SalesReport searchParams={searchParams} />
    </PermissionGate>
  )
}
