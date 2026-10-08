import { SearchParamsType } from '@/types/coreTypes'
import { CashFlowReport } from './components/CashFlowReport'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Relatório de projeção de caixa',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['reports:financial:view', 'values:values:view']}
      fallback={
        <div className="p-4 text-center">
          <h3 className="type-card-title mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar a projeção de caixa.
          </p>
        </div>
      }
    >
      <CashFlowReport searchParams={searchParams} />
    </PermissionGate>
  )
}
