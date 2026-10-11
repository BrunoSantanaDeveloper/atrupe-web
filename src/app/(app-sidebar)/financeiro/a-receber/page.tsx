// Components
import { Transactions } from '@/app/(app-sidebar)/financeiro/_components/transactions/Transactions'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Movimentações a Receber',
  }
}

export default function ReceivablesPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.ACCOUNTS_RECEIVABLE]}
      wall={{
        title: 'Movimentações a receber',
        description:
          'Gerencie as contas a receber e os recebimentos da empresa.',
        pageTitle: true,
      }}
    >
      <PermissionGate
        requireAll
        permissions={['financial:flow:view']}
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
