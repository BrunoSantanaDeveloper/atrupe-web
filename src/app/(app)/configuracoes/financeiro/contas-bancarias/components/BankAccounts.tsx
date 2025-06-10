// UI
import { Card } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewBankAccountDialog } from './BankAccountsTable/NewBankAccount'
import { BankAccountsData } from './BankAccountsTable/BankAccountsData'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { PermissionGate } from '@/components/common/PermissionGate'

export function BankAccounts({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate permissions={['financial_settings:bank_accounts:view']}>
      <div className="space-y-5">
        <Topbar
          title="Contas bancárias"
          previousPage="/configuracoes/financeiro"
          primaryCta={
            <PermissionGate
              permissions={['financial_settings:bank_accounts:create']}
            >
              <NewBankAccountDialog searchParams={searchParams} />
            </PermissionGate>
          }
        />
        <Card>
          <BankAccountsData searchParams={searchParams} />
        </Card>
      </div>
    </PermissionGate>
  )
}
