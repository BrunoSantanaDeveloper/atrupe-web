'use client'

// UI
import { Card } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewBankAccountDialog } from './BankAccountsTable/NewBankAccount'
import { BankAccountsData } from './BankAccountsTable/BankAccountsData'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { PermissionGate } from '@/components/common/PermissionGate'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

export function BankAccounts({ searchParams }: SearchParamsType) {
  const { canCreateBankAccount } = usePlanFeatures()

  return (
    <PermissionGate permissions={['financial_settings:bank_accounts:view']}>
      <div className="space-y-5">
        <Topbar
          title="Contas bancárias"
          previousPage="/configuracoes/financeiro"
          primaryCta={
            canCreateBankAccount() ? (
              <PermissionGate
                permissions={['financial_settings:bank_accounts:create']}
              >
                <NewBankAccountDialog searchParams={searchParams} />
              </PermissionGate>
            ) : undefined
          }
        />
        <Card>
          <BankAccountsData searchParams={searchParams} />
        </Card>
      </div>
    </PermissionGate>
  )
}
