import { Assets } from './components/Assets'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Patrimônios' }
}

export default function AssetsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      requireAll
      permissions={['cost:base:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os patrimônios.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Patrimônios"
            description="O cadastro de patrimônios faz parte do plano PRO. Ele calcula a depreciação e o custo por unidade de cada máquina, móvel ou veículo."
          />
        }
      >
        <Assets searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
