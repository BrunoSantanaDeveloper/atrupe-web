import { ProductionBoard } from './components/ProductionBoard'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Gerenciador de produção' }
}

export default function ProductionBoardPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['production:production:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a produção.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTION.PRODUCTION_MANAGER]}
        fallback={
          <UpgradeFallback
            title="Gerenciador de produção"
            description="O gerenciador de produção faz parte do plano ELITE. Ele controla as etapas por setor, com tempo previsto, dependências e produtividade."
          />
        }
      >
        <ProductionBoard searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
