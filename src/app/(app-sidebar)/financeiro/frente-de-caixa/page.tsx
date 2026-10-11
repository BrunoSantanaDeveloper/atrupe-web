// Component Imports
import { PDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PDV'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

export default function PDVsPage({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.PDV_SCREEN]}
      wall={{
        title: 'Frente de caixa',
        description: 'Registre as vendas diretas no caixa (PDV).',
        pageTitle: true,
      }}
    >
      <PermissionGate
        permissions={['financial:pdv:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar a frente de caixa.
          </div>
        }
      >
        <PDV searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
