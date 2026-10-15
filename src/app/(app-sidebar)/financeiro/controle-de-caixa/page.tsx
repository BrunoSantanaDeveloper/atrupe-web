// Components
import { CashControl } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/components/CashControl'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

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
    <PermissionGate
      requireAll
      // O caixa do dia (CX-0 a CX-5, Fase 7.2): o saldo é informação
      // financeira, então a tela pede também a permissão de valores
      permissions={['financial:cash_control:view', 'values:values:view']}
      fallback={<div>Você não tem permissão para acessar esta página.</div>}
    >
      <FeatureGate
        features={[FEATURES.FINANCIAL.CASH_CONTROL]}
        wall={{
          title: 'Controle de caixa',
          description: 'Controle as entradas e as saídas de caixa da empresa.',
          pageTitle: true,
        }}
      >
        <CashControl searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
