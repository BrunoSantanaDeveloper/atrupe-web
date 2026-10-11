import { Materials } from './components/Materials'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Materiais' }
}

export default function MaterialsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os materiais.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Materiais"
            description="O cadastro de materiais faz parte do plano PRO. Os materiais compõem os produtos que a empresa já vende, sem recadastro."
          />
        }
      >
        <Materials searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
