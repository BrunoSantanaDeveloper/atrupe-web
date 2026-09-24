'use client'

// UI
import { Card } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
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
          review="todo"
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
        <ReviewTodo rule="LITE" title="Cadastro de bancos sem desenvolvimento">
          O cadastro existe como tela, mas o recurso não está concluído. Ele é o
          começo de uma corrente: sem conta bancária cadastrada não há controle
          de caixa, e sem controle de caixa não há provisionamento nem
          compensação de parcelas. No START a empresa usa só a conta Caixa
          Empresa, criada automaticamente.
        </ReviewTodo>
        <Card>
          <BankAccountsData searchParams={searchParams} />
        </Card>
      </div>
    </PermissionGate>
  )
}
