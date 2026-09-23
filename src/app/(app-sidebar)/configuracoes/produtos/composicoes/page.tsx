import { Compositions } from './components/Compositions'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Composições' }
}

export default function CompositionsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as composições.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        fallback={
          <UpgradeFallback
            title="Composições"
            description="A composição dos produtos faz parte do plano PRO. Os produtos que a empresa já vende ganham custo e margem, sem recadastro."
          />
        }
      >
        <Compositions searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
