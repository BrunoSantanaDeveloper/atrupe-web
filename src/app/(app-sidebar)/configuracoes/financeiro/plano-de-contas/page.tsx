// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Plano de contas',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial_settings:chart_accounts:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o plano de contas.
        </div>
      }
    >
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
