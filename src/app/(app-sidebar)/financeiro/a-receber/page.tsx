// Components
import { Transactions } from '@/app/(app-sidebar)/financeiro/_components/transactions/Transactions'
import { PermissionGate } from '@/components/common/PermissionGate'
import type { SearchParamsType } from '@/types/coreTypes'
import { FeatureGate } from '@/components/common/FeatureGate'

export function metadata() {
  return {
    title: 'Movimentações a Receber',
  }
}

export default function ReceivablesPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate features={['accounts_receivable']} showUpgradeMessage>
      <PermissionGate
        permissions={['financial:receivable:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar contas a receber.
          </div>
        }
      >
        <Transactions searchParams={searchParams} type="receivable" />
      </PermissionGate>
    </FeatureGate>
  )
}
