// Components
import { ComissionReport } from './components/ComissionReport'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Relatório de comissões',
  }
}

export default function ComissionReportPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['reports:commission:view', 'values:values:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="text-lg font-medium mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o relatório de comissões.
          </p>
        </div>
      }
    >
      <ComissionReport searchParams={searchParams} />
    </PermissionGate>
  )
}
