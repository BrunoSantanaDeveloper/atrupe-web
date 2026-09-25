// Component Imports
import { PDV } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PDV'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Constants
import { FEATURES } from '@/consts/features'

export function metadata() {
  return {
    title: 'Frente de Caixa',
  }
}

// A frente de caixa troca de aba dentro da própria tela: o caixa do dia não
// é navegação, é o mesmo posto de trabalho
export default function PDVsPage() {
  return (
    <FeatureGate
      features={[FEATURES.FINANCIAL.PDV_SCREEN]}
      fallback={
        <UpgradeFallback
          title="Módulo Frente de Caixa"
          description="O módulo de frente de caixa (PDV) não está incluído no seu plano atual. Faça upgrade para gerenciar vendas diretas."
        />
      }
    >
      <PermissionGate
        permissions={['financial:pdv:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar a frente de caixa.
          </div>
        }
      >
        <PDV />
      </PermissionGate>
    </FeatureGate>
  )
}
