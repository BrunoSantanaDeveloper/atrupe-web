import { AssetDetail } from './components/AssetDetail'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Patrimônio' }
}

export default function AssetPage({ params }: { params: { id: string } }) {
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
        wall={{ title: 'Patrimônios', pageTitle: true }}
      >
        <AssetDetail id={params.id} />
      </FeatureGate>
    </PermissionGate>
  )
}
