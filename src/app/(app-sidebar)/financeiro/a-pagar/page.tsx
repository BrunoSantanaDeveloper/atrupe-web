// Components
import { Transactions } from '@/app/(app-sidebar)/financeiro/_components/transactions/Transactions'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Movimentações a Pagar',
  }
}

export default function PayablePage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.ACCOUNTS_PAYABLE]}
      fallback={
        <UpgradeFallback
          title="Módulo Contas a Pagar"
          description="O módulo de contas a pagar não está incluído no seu plano atual. Faça upgrade para gerenciar suas obrigações financeiras."
        />
      }
    >
      <PermissionGate
        requireAll
        permissions={['financial:flow:view']}
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
