// Components
import { BankAccounts } from './components/BankAccounts'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Contas bancárias',
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
      <BankAccounts searchParams={searchParams} />
    </PermissionGate>
  )
}
