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
    title: 'Movimentações a Receber',
  }
}

export default function ReceivablesPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.ACCOUNTS_RECEIVABLE]}
      fallback={
        <UpgradeFallback
          title="Módulo Contas a Receber"
          description="O módulo de contas a receber não está incluído no seu plano atual. Faça upgrade para gerenciar seus recebimentos."
        />
      }
    >
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
