// Components
import { BankAccounts } from './components/BankAccounts'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Configurações de Contas Bancárias',
  }
}

// As contas com tipo, padrão por forma e saldo calculado (CX-0 a CX-5,
// Fase 7.1), pela API
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
      <BankAccounts searchParams={searchParams} />
    </PermissionGate>
  )
}
