// Components
import { SectorReport } from './components/SectorReport'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Resultado por setor',
  }
}

export default function SectorReportPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['reports:sector_result:view', 'values:values:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="type-card-title mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o relatório de resultado por
            setor.
          </p>
        </div>
      }
    >
      <SectorReport searchParams={searchParams} />
    </PermissionGate>
  )
}
