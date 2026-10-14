// Component Imports
import { PDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PDV'
import { PDV as DemoPDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/demo/PDV'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Libs
import { DEMO_DATA } from '@/lib/demo'

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
    <PermissionGate
      permissions={['financial:pdv:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a frente de caixa.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.FINANCIAL.PDV_SCREEN]}
        wall={{
          title: 'Frente de caixa',
          description: 'Registre as vendas diretas no caixa (PDV).',
          pageTitle: true,
        }}
      >
        {/* A frente de caixa nova (FC-1 a FC-20) ainda roda sobre dados de
            exemplo: só com a flag de demonstração. Sem ela, a tela real,
            com os caixas em /financeiro/frente-de-caixa/[pdvId] */}
        {DEMO_DATA ? <DemoPDV /> : <PDV searchParams={searchParams} />}
      </FeatureGate>
    </PermissionGate>
  )
}
