// Components
import { Transactions } from '@/app/(app-sidebar)/financeiro/_components/transactions/Transactions'
import { PermissionGate } from '@/components/common/PermissionGate'
import type { SearchParamsType } from '@/types/coreTypes'
import { FeatureGate } from '@/components/common/FeatureGate'

export function metadata() {
  return {
    title: 'Movimentações a Pagar',
  }
}

export default function PayablePage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate features={['accounts_payable']} showUpgradeMessage>
      <PermissionGate
        permissions={['financial:payable:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar contas a pagar.
          </div>
        }
      >
        <Transactions searchParams={searchParams} type="payable" />
      </PermissionGate>
    </FeatureGate>
  )
}
