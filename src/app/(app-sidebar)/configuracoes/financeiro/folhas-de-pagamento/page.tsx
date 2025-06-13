// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Folha de pagamento - Config.',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial_settings:payroll:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de folha de
          pagamento.
        </div>
      }
    >
      <Main searchParams={searchParams} />
    </PermissionGate>
  )
}
