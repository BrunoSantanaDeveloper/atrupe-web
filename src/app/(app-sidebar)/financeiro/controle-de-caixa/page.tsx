// Components
import { CashControl } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/components/CashControl'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Controle de Caixa',
  }
}

export default function CashControlPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.CASH_CONTROL]}
      fallback={
        <UpgradeFallback
          title="Módulo Controle de Caixa"
          description="O módulo de controle de caixa não está incluído no seu plano atual. Faça upgrade para controlar entradas e saídas de caixa."
        />
      }
    >
      {/* O saldo das contas é informação financeira: exige a permissão de
          valores, como o item de menu. A frente de caixa não exige — o
          operador vê o dinheiro do caixa, não custo nem fluxo (26/09/2026) */}
      <PermissionGate
        requireAll
        permissions={['financial:cash_control:view', 'values:values:view']}
        fallback={<div>Você não tem permissão para acessar esta página.</div>}
      >
        <CashControl searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
