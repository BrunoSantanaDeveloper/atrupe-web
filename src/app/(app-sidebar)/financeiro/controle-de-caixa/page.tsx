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
    <FeatureGate
      features={[FEATURES.FINANCIAL.CASH_CONTROL]}
      wall={{
        title: 'Controle de caixa',
        description: 'Controle as entradas e as saídas de caixa da empresa.',
        pageTitle: true,
      }}
    >
      <PermissionGate
        permissions={['financial:cash_control:view']}
        fallback={<div>Você não tem permissão para acessar esta página.</div>}
      >
        <CashControl searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
