import { AssetGroups } from './components/AssetGroups'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Grupos de bens' }
}

export default function AssetGroupsPage() {
  return (
    <PermissionGate
      requireAll
      permissions={['cost:base:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os grupos de bens.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{ title: 'Grupos de bens', pageTitle: true }}
      >
        <AssetGroups />
      </FeatureGate>
    </PermissionGate>
  )
}
