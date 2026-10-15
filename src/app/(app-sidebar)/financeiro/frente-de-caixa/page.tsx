// Component Imports
import { PDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PDV'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

// A frente de caixa (FC-1 a FC-20) pela API /financial/pdv (Fase 7.4). O
// operador vê os valores do caixa sem a permissão de valores (FC-15)
export default function PDVsPage() {
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
        <PDV />
      </FeatureGate>
    </PermissionGate>
  )
}
