// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Motivos de Rejeição e Cancelamento',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['sales_settings:rejection_reasons:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os motivos de rejeição e
          cancelamento.
        </div>
      }
    >
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
