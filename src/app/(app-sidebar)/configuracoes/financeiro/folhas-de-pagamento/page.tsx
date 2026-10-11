// Components
import { Main } from './components/Main'
import { Main as DemoMain } from './components/demo/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

// Libs
import { DEMO_DATA } from '@/lib/demo'

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
      requireAll
      permissions={['financial_settings:payroll:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de folha de
          pagamento.
        </div>
      }
    >
      {/* A estrutura nova da folha (ALT-18 e ALT-19) ainda roda sobre dados
          de exemplo: só com a flag de demonstração. Sem ela, a tela real */}
      {DEMO_DATA ? <DemoMain /> : <Main searchParams={searchParams} />}
    </PermissionGate>
  )
}
