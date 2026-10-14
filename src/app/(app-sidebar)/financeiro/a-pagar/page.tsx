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
    title: 'Movimentações a pagar',
  }
}

export default function PayablePage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['financial:flow:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar contas a pagar.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.FINANCIAL.ACCOUNTS_PAYABLE]}
        wall={{
          title: 'Movimentações a pagar',
          description:
            'Gerencie as contas a pagar e as obrigações financeiras da empresa.',
          pageTitle: true,
        }}
      >
        <Transactions searchParams={searchParams} type="payable" />
      </FeatureGate>
    </PermissionGate>
  )
}
