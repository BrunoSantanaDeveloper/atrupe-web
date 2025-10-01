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

export default function BankAccountsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['financial_settings:payment_methods:view']} // TODO: verificar permissão
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
