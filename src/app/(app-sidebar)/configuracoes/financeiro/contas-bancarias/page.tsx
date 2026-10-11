// Components
import { BankAccounts } from './components/BankAccounts'
import { BankAccounts as DemoBankAccounts } from './components/demo/BankAccounts'
import { PermissionGate } from '@/components/common/PermissionGate'

// Libs
import { DEMO_DATA } from '@/lib/demo'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Configurações de Contas Bancárias',
  }
}

export default function BankAccountsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial_settings:bank_accounts:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as contas bancárias.
        </div>
      }
    >
      {/* A tela nova (CX-0 a CX-5) ainda roda sobre dados de exemplo: só com
          a flag de demonstração. Sem ela, a tela real */}
      {DEMO_DATA ? (
        <DemoBankAccounts searchParams={searchParams} />
      ) : (
        <BankAccounts searchParams={searchParams} />
      )}
    </PermissionGate>
  )
}
