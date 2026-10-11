import { Materials } from './components/Materials'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

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
        wall={{
          title: 'Materiais',
          description:
            'Os materiais compõem os produtos que a empresa já vende, sem recadastro.',
          pageTitle: true,
        }}
      >
        <Materials searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
